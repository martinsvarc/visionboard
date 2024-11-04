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

    // Format dates as strings
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // Get counts for different periods using string dates
    const { rows } = await pool.sql`
      SELECT 
        COUNT(*) FILTER (WHERE DATE(session_date) = CURRENT_DATE) as today_count,
        COUNT(*) FILTER (WHERE session_date >= ${startOfWeekStr}::date) as week_count,
        COUNT(*) FILTER (WHERE session_date >= ${startOfMonthStr}::date) as month_count,
        COUNT(*) as total_count
      FROM user_sessions
      WHERE user_id = ${memberId};
    `;

    return NextResponse.json({
      todayCount: parseInt(rows[0].today_count),
      weeklyCount: parseInt(rows[0].week_count),
      monthlyCount: parseInt(rows[0].month_count),
      totalCount: parseInt(rows[0].total_count)
    });

  } catch (error) {
    console.error('Error getting session data:', error);
    return NextResponse.json({ error: 'Failed to get session data' }, { status: 500 });
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

    // Record session
    await pool.sql`
      INSERT INTO user_sessions (user_id, url_visited)
      VALUES (${memberId}, ${url});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording session:', error);
    return NextResponse.json({ error: 'Failed to record session' }, { status: 500 });
  }
}
