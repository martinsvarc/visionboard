import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const getNextSunday = (date: Date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  const dayOfWeek = newDate.getDay();
  const daysUntilNextSunday = 7 - dayOfWeek;
  newDate.setDate(newDate.getDate() + daysUntilNextSunday);
  return newDate;
};

interface UserAchievement {
  member_id: string;
  unlocked_badges: string[];
  final_rank?: number;
  final_points?: number;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    console.log('Starting weekly reset process...');
    
    const { rows: usersToReset } = await pool.sql`
      SELECT member_id, points, user_name
      FROM user_achievements
      WHERE weekly_reset_at <= CURRENT_TIMESTAMP;
    `;

    if (usersToReset.length === 0) {
      console.log('No users need resetting at this time');
      return NextResponse.json({
        message: 'No users required reset',
        nextResetDate: getNextSunday().toISOString()
      });
    }

    console.log(`Found ${usersToReset.length} users to reset`);

    const { rows } = await pool.sql`
      WITH users_to_reset AS (
        SELECT member_id
        FROM user_achievements
        WHERE weekly_reset_at <= CURRENT_TIMESTAMP
      ),
      user_rankings AS (
        SELECT 
          member_id,
          points,
          user_name,
          DENSE_RANK() OVER (ORDER BY points DESC) as rank
        FROM user_achievements
        WHERE member_id IN (SELECT member_id FROM users_to_reset)
        AND points > 0
        ORDER BY points DESC
      ),
      award_badges AS (
        SELECT 
          member_id,
          CASE rank
            WHEN 1 THEN 'league_first'
            WHEN 2 THEN 'league_second'
            WHEN 3 THEN 'league_third'
          END as badge_to_award,
          points as final_points,
          rank as final_rank
        FROM user_rankings
        WHERE rank <= 3
      ),
      rankings_snapshot AS (
        SELECT json_agg(
          json_build_object(
            'name', user_name,
            'memberId', member_id,
            'rank', rank,
            'points', points
          )
        ) as rankings
        FROM user_rankings
      )
      UPDATE user_achievements ua
      SET 
        points = 0,
        daily_points = '{}'::jsonb,
        weekly_reset_at = ${getNextSunday().toISOString()},
        sessions_this_week = 0,
        unlocked_badges = (
          CASE 
            WHEN ab.badge_to_award IS NOT NULL THEN
              CASE 
                WHEN ua.unlocked_badges IS NULL THEN jsonb_build_array(ab.badge_to_award)
                WHEN NOT ua.unlocked_badges::jsonb ? ab.badge_to_award THEN 
                  ua.unlocked_badges::jsonb || jsonb_build_array(ab.badge_to_award)
                ELSE ua.unlocked_badges::jsonb
              END
            ELSE COALESCE(ua.unlocked_badges::jsonb, '[]'::jsonb)
          END
        )
      FROM award_badges ab
      WHERE ua.member_id IN (SELECT member_id FROM users_to_reset)
      RETURNING 
        ua.*,
        ab.final_points,
        ab.final_rank,
        (SELECT rankings FROM rankings_snapshot) as final_rankings;
    `;

    const typedRows = rows as UserAchievement[];
    
    const resetSummary = {
      totalUsersReset: typedRows.length,
      topPerformers: typedRows
        .filter(row => row.final_rank && row.final_points)
        .map(row => ({
          memberId: row.member_id,
          rank: row.final_rank,
          points: row.final_points,
          newBadge: row.unlocked_badges?.find((badge: string) => 
            ['league_first', 'league_second', 'league_third'].includes(badge)
          )
        }))
    };

    console.log('Weekly reset completed successfully');
    console.log('Reset summary:', JSON.stringify(resetSummary, null, 2));
    console.log('Next reset scheduled for:', getNextSunday().toISOString());

    return NextResponse.json({
      message: 'Weekly reset completed successfully',
      usersUpdated: typedRows.length,
      nextResetDate: getNextSunday().toISOString(),
      summary: resetSummary,
      finalRankings: typedRows[0]?.final_rankings || [],
      updatedUsers: typedRows.map(row => ({
        memberId: row.member_id,
        newBadges: row.unlocked_badges,
        finalStats: {
          rank: row.final_rank,
          points: row.final_points
        }
      }))
    });

  } catch (error) {
    console.error('Error performing weekly reset:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return NextResponse.json({ 
      error: 'Failed to perform weekly reset',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
