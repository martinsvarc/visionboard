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

    // Get all visits ordered by date
    const { rows } = await pool.sql`
      WITH ordered_dates AS (
        SELECT DISTINCT visit_date, 
               LAG(visit_date, 1) OVER (ORDER BY visit_date) as prev_date
        FROM user_streaks 
        WHERE user_id = ${memberId}
        ORDER BY visit_date DESC
      )
      SELECT visit_date, prev_date,
             CASE 
               WHEN prev_date IS NULL OR visit_date - prev_date = 1 THEN 1
               ELSE 0
             END as is_consecutive
      FROM ordered_dates;
    `;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < rows.length; i++) {
      const visitDate = new Date(rows[i].visit_date);
      visitDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = currentStreak;
    let tempStreak = 1;

    for (let i = 1; i < rows.length; i++) {
      const currDate = new Date(rows[i].visit_date);
      const prevDate = new Date(rows[i].prev_date);
      
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Get all visit dates for the current month
    const activeDates = rows.map(row => row.visit_date.toISOString().split('T')[0]);

    return NextResponse.json({
      currentStreak,
      longestStreak: longestStreak.toString(),
      activeDates
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
