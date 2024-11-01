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

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date();

    for (const row of rows) {
      const visitDate = new Date(row.visit_date);
      const diffDays = Math.floor((lastDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        tempStreak++;
        currentStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = visitDate;
    }

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
