import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Get all visits for this user
    const { rows } = await pool.sql`
      SELECT visit_date 
      FROM user_streaks 
      WHERE user_id = ${memberId}
      ORDER BY visit_date DESC;
    `;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    let lastDate = today;

    for (const row of rows) {
      const visitDate = new Date(row.visit_date);
      const diffDays = Math.floor((lastDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak++;
        lastDate = visitDate;
      } else {
        break;
      }
    }

    // Get longest streak
    const streakQuery = await pool.sql`
      WITH dates AS (
        SELECT DISTINCT visit_date
        FROM user_streaks
        WHERE user_id = ${memberId}
        ORDER BY visit_date
      ),
      gaps AS (
        SELECT 
          visit_date,
          CASE 
            WHEN visit_date - LAG(visit_date, 1) OVER (ORDER BY visit_date) = 1 THEN 0
            ELSE 1
          END as is_gap
        FROM dates
      ),
      streaks AS (
        SELECT
          SUM(is_gap) OVER (ORDER BY visit_date) as streak_group,
          COUNT(*) as streak_length
        FROM gaps
        GROUP BY visit_date, is_gap
      )
      SELECT MAX(streak_length) as longest_streak
      FROM streaks;
    `;

    const longestStreak = streakQuery.rows[0]?.longest_streak || 0;

    return NextResponse.json({
      currentStreak,
      longestStreak,
      activeDates: rows.map(row => row.visit_date.toISOString().split('T')[0])
    });

  } catch (error) {
    console.error('Error getting streak data:', error);
    return NextResponse.json({ error: 'Failed to get streak data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, url } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Record visit
    await pool.sql`
      INSERT INTO user_streaks (user_id, visit_date, url_visited)
      VALUES (${memberId}, CURRENT_DATE, ${url})
      ON CONFLICT (user_id, visit_date) DO NOTHING;
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording streak:', error);
    return NextResponse.json({ error: 'Failed to record streak' }, { status: 500 });
  }
}
