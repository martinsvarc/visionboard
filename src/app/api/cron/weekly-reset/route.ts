import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const getNextSunday = (date: Date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  const dayOfWeek = newDate.getDay();
  const daysToAdd = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  newDate.setDate(newDate.getDate() + daysToAdd);
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
      WITH user_rankings AS (
        SELECT 
          member_id,
          points,
          user_name,
          DENSE_RANK() OVER (ORDER BY points DESC) as rank
        FROM user_achievements
        WHERE points > 0
        ORDER BY points DESC
      ),
      award_badges AS (
        -- Store badge assignments before reset
        SELECT 
          member_id,
          CASE rank
            WHEN 1 THEN 'league_first'
            WHEN 2 THEN 'league_second'
            WHEN 3 THEN 'league_third'
          END as badge_to_award
        FROM user_rankings
        WHERE rank <= 3
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
      WHERE (ua.member_id = ab.member_id OR ab.member_id IS NULL)
      RETURNING 
        ua.*,
        (SELECT json_agg(json_build_object('name', user_name, 'rank', rank, 'points', points))
         FROM user_rankings) as final_rankings;
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
    // Log detailed error information
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
