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
        weekly_reset_at = ${getNextSunday().toISOString()},
        unlocked_badges = CASE 
          WHEN EXISTS (
            SELECT 1 FROM user_rankings ur 
            WHERE ur.member_id = ua.member_id 
            AND ur.rank = 1
          ) THEN ua.unlocked_badges || '["league_first"]'::jsonb
          WHEN EXISTS (
            SELECT 1 FROM user_rankings ur 
            WHERE ur.member_id = ua.member_id 
            AND ur.rank = 2
          ) THEN ua.unlocked_badges || '["league_second"]'::jsonb
          WHEN EXISTS (
            SELECT 1 FROM user_rankings ur 
            WHERE ur.member_id = ua.member_id 
            AND ur.rank = 3
          ) THEN ua.unlocked_badges || '["league_third"]'::jsonb
          ELSE ua.unlocked_badges
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json({
      message: 'Weekly reset completed successfully',
      usersUpdated: rows.length
    });

  } catch (error) {
    console.error('Error performing weekly reset:', error);
    return NextResponse.json({ error: 'Failed to perform weekly reset' }, { status: 500 });
  }
}
