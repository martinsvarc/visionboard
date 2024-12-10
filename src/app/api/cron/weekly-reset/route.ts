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

export async function GET(request: Request) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    console.log('Starting weekly reset process...');

    const { rows } = await pool.sql`
      WITH users_to_reset AS (
        SELECT member_id
        FROM user_achievements
        WHERE weekly_reset_at <= CURRENT_TIMESTAMP
      ),
      weekly_totals AS (
        SELECT 
          ua.member_id,
          ua.user_name,
          (SELECT SUM(value::numeric)
           FROM jsonb_each_text(ua.daily_points)
           WHERE key::date >= ua.weekly_reset_at::date
             AND key::date < ${getNextSunday().toISOString()}::date
          ) as total_points
        FROM user_achievements ua
        WHERE ua.member_id IN (SELECT member_id FROM users_to_reset)
      ),
      user_rankings AS (
        SELECT 
          member_id,
          user_name,
          total_points as points,
          DENSE_RANK() OVER (ORDER BY total_points DESC NULLS LAST) as rank
        FROM weekly_totals
        WHERE total_points > 0
        ORDER BY total_points DESC
      ),
      award_badges AS (
        SELECT 
          member_id,
          CASE rank
            WHEN 1 THEN 'league_first'
            WHEN 2 THEN 'league_second'
            WHEN 3 THEN 'league_third'
          END as badge_to_award
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
        AND (ua.member_id = ab.member_id OR ab.member_id IS NULL)
      RETURNING 
        ua.*,
        (SELECT rankings FROM rankings_snapshot) as final_rankings;
    `;

    console.log('Weekly reset completed. Rankings before reset:', 
      rows[0]?.final_rankings || 'No rankings available');
    
    console.log('Users updated:', rows.length);
    console.log('Next reset scheduled for:', getNextSunday().toISOString());

    return NextResponse.json({
      message: 'Weekly reset completed successfully',
      usersUpdated: rows.length,
      nextResetDate: getNextSunday().toISOString(),
      finalRankings: rows[0]?.final_rankings || [],
      updatedUsers: rows.map(row => ({
        memberId: row.member_id,
        newBadges: row.unlocked_badges
      }))
    });

  } catch (error) {
    console.error('Error performing weekly reset:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({ 
      error: 'Failed to perform weekly reset',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
