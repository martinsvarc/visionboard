// app/api/leaderboard/route.ts
import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const category = searchParams.get('category') || 'daily';
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.POSTGRES_URL
    });

    const scoreColumn = category === 'daily' ? 'daily_score' : 
                       category === 'weekly' ? 'weekly_score' : 
                       'all_time_score';

    // Get leaderboard data
    const { rows: leaderboardData } = await pool.sql`
      WITH RankedUsers AS (
        SELECT 
          user_id,
          user_name,
          profile_image_url,
          ${scoreColumn} as score,
          ROW_NUMBER() OVER (ORDER BY ${scoreColumn} DESC) as rank
        FROM user_leaderboard
        WHERE ${scoreColumn} > 0
      )
      SELECT * FROM RankedUsers
      WHERE rank <= 10
      ORDER BY rank ASC;
    `;

    // Get chart data for the past 7 days
    const { rows: chartData } = await pool.sql`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        SUM(daily_score) as user_points,
        MAX(daily_score) as top_user_points
      FROM user_leaderboard
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC;
    `;

    // Get current user's stats
    const { rows: userStats } = await pool.sql`
      SELECT 
        user_id,
        user_name,
        profile_image_url,
        daily_score,
        weekly_score
