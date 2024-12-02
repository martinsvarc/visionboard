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

    // Reset points and update weekly_reset_at for all users
    const { rows } = await pool.sql`
      WITH user_rankings AS (
        SELECT 
          member_id,
          points,
          DENSE_RANK() OVER (ORDER BY points DESC) as rank
        FROM user_achievements
        WHERE points > 0
      )
      UPDATE user_achievements ua
      SET 
        points = 0,
        daily_points = '{}'::jsonb,
        weekly_reset_at = ${getNextSunday().toISOString()},
        unlocked_badges = CASE 
          WHEN EXISTS (
            SELECT 1 FROM user_rankings ur 
            WHERE ur.member_id = ua.member_id 
            AND ur.rank = 1
          ) THEN (
            CASE 
              WHEN ua.unlocked_badges IS NULL THEN '["league_first"]'
              ELSE (ua.unlocked_badges::jsonb || '["league_first"]'::jsonb)
            END
          )::jsonb
          WHEN EXISTS (
            SELECT 1 FROM user_rankings ur 
            WHERE ur.member_id = ua.member_id 
            AND ur.rank = 2
          ) THEN (
            CASE 
              WHEN ua.unlocked_badges IS NULL THEN '["league_second"]'
              ELSE (ua.unlocked_badges::jsonb || '["league_second"]'::jsonb)
            END
          )::jsonb
          WHEN EXISTS (
            SELECT 1 FROM user_rankings ur 
            WHERE ur.member_id = ua.member_id 
            AND ur.rank = 3
          ) THEN (
            CASE 
              WHEN ua.unlocked_badges IS NULL THEN '["league_third"]'
              ELSE (ua.unlocked_badges::jsonb || '["league_third"]'::jsonb)
            END
          )::jsonb
          ELSE COALESCE(ua.unlocked_badges::jsonb, '[]'::jsonb)
        END,
        sessions_this_week = 0,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json({
      message: 'Weekly reset completed successfully',
      usersUpdated: rows.length,
      nextResetDate: getNextSunday().toISOString()
    });

  } catch (error) {
    console.error('Error performing weekly reset:', error);
    return NextResponse.json({ 
      error: 'Failed to perform weekly reset',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
