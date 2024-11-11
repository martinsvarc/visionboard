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
        MAX(daily_score) OVER (PARTITION BY DATE_TRUNC('day', created_at)) as top_user_points
      FROM user_leaderboard
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND user_id = ${memberId}
      GROUP BY DATE_TRUNC('day', created_at), created_at
      ORDER BY date ASC;
    `;

    // Get current user's stats
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
         WHERE ${scoreColumn} > ul.${scoreColumn}
        ) as rank
      FROM user_leaderboard ul
      WHERE user_id = ${memberId};
    `;

    // If user doesn't exist, create entry
    if (!userStats.length) {
      console.log('No user record found, creating new one');
      await pool.sql`
        INSERT INTO user_leaderboard (user_id, user_name, daily_score)
        VALUES (${memberId}, 'New User', 0)
      `;
      return NextResponse.json({
        leaderboard: leaderboardData,
        chartData: [],
        userStats: {
          user_id: memberId,
          user_name: 'New User',
          profile_image_url: null,
          daily_score: 0,
          weekly_score: 0,
          all_time_score: 0,
          rank: leaderboardData.length + 1
        }
      });
    }

    return NextResponse.json({
      leaderboard: leaderboardData,
      chartData: chartData,
      userStats: userStats[0]
    });

  } catch (error) {
    console.error('Load leaderboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to load leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    console.log('Updating leaderboard:', {
      memberId,
      userName,
      score,
      profileImageUrl
    });

    // Insert or update user score
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
        ${profileImageUrl || null},
        ${score}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        user_name = EXCLUDED.user_name,
        profile_image_url = COALESCE(EXCLUDED.profile_image_url, user_leaderboard.profile_image_url),
        daily_score = EXCLUDED.daily_score,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Verify save
    const { rows } = await pool.sql`
      SELECT * FROM user_leaderboard WHERE user_id = ${memberId};
    `;

    return NextResponse.json({
      success: true,
      saved: {
        user: rows[0],
        timestamp: rows[0].updated_at
      }
    });
    
  } catch (error) {
    console.error('Update leaderboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to update leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
