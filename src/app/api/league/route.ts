export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const category = searchParams.get('category') || 'daily';
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Check if user exists, if not create them
    const { rows: userExists } = await pool.sql`
      SELECT * FROM user_leaderboard WHERE user_id = ${memberId};
    `;

    if (!userExists.length) {
      await pool.sql`
        INSERT INTO user_leaderboard (user_id, user_name, daily_score, weekly_score, all_time_score)
        VALUES (${memberId}, 'New User', 100, 100, 100);
      `;
    }

    // Get leaderboard data
    const { rows: leaderboardData } = await pool.sql`
      SELECT 
        user_id,
        user_name,
        profile_image_url,
        daily_score as score,
        ROW_NUMBER() OVER (ORDER BY daily_score DESC) as rank
      FROM user_leaderboard
      WHERE daily_score > 0
      ORDER BY daily_score DESC
      LIMIT 10;
    `;

    // Get user stats
    const { rows: userStats } = await pool.sql`
      SELECT 
        user_id,
        user_name,
        profile_image_url,
        daily_score,
        weekly_score,
        all_time_score,
        (SELECT COUNT(*) + 1 
         FROM user_leaderboard 
         WHERE daily_score > ul.daily_score) as rank
      FROM user_leaderboard ul
      WHERE user_id = ${memberId};
    `;

    // Get chart data (last 7 days)
    const chartData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      user_points: Math.floor(Math.random() * 50) + 50,
      top_user_points: Math.floor(Math.random() * 50) + 100
    })).reverse();

    return NextResponse.json({
      leaderboard: leaderboardData,
      chartData: chartData,
      userStats: userStats[0]
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to load leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
