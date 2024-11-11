import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

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

    // Get leaderboard data
    const { rows: leaderboardData } = await pool.sql`
      WITH RankedUsers AS (
        SELECT 
          user_id,
          user_name,
          profile_image_url,
          daily_score as score,
          ROW_NUMBER() OVER (ORDER BY daily_score DESC) as rank
        FROM user_leaderboard
        WHERE daily_score > 0
      )
      SELECT * FROM RankedUsers
      WHERE rank <= 10
      ORDER BY rank ASC;
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

    // Get chart data for the past 7 days
    const { rows: chartData } = await pool.sql`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        daily_score as user_points,
        (SELECT MAX(daily_score) 
         FROM user_leaderboard 
         WHERE DATE_TRUNC('day', created_at) = DATE_TRUNC('day', ul.created_at)
        ) as top_user_points
      FROM user_leaderboard ul
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND user_id = ${memberId}
      GROUP BY DATE_TRUNC('day', created_at), daily_score, ul.created_at
      ORDER BY date ASC;
    `;

    return NextResponse.json({
      leaderboard: leaderboardData,
      chartData: chartData.map(row => ({
        ...row,
        date: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })
      })),
      userStats: userStats[0] || null
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

export async function POST(request: Request) {
  try {
    const { memberId, userName, profileImageUrl, score } = await request.json();
    
    if (!memberId || !userName || typeof score !== 'number') {
      return NextResponse.json({ 
        error: 'Missing required fields',
        receivedData: { memberId, userName, score }
      }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Debug log
    console.log('Received data:', {
      memberId,
      userName,
      profileImageUrl,
      score
    });

    await pool.sql`
      INSERT INTO user_leaderboard (
        user_id, 
        user_name, 
        profile_image_url,
        daily_score
      )
      VALUES (
        ${memberId}, 
        ${userName}, 
        ${profileImageUrl || 'https://placehold.co/48x48'},
        ${score}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        user_name = EXCLUDED.user_name,
        profile_image_url = COALESCE(EXCLUDED.profile_image_url, 'https://placehold.co/48x48'),
        daily_score = EXCLUDED.daily_score,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({
      success: true,
      message: 'Score updated successfully'
    });
    
  } catch (error) {
    console.error('Update leaderboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to update leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
