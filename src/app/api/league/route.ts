import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    let query;
    if (period === 'daily') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE user_name IS NOT NULL
            AND call_date >= CURRENT_DATE
          GROUP BY user_name
        ),
        RankedScores AS (
          SELECT 
            user_name,
            total_points,
            call_count,
            last_call_date,
            score_history,
            profile_picture_url,
            RANK() OVER (ORDER BY total_points DESC) as rank
          FROM UserScores
        )
        SELECT * FROM RankedScores
        WHERE user_name = ${memberId}
           OR rank <= 10
        ORDER BY rank ASC;
      `;
    } else if (period === 'weekly') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE user_name IS NOT NULL
            AND call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY user_name
        ),
        RankedScores AS (
          SELECT 
            user_name,
            total_points,
            call_count,
            last_call_date,
            score_history,
            profile_picture_url,
            RANK() OVER (ORDER BY total_points DESC) as rank
          FROM UserScores
        )
        SELECT * FROM RankedScores
        WHERE user_name = ${memberId}
           OR rank <= 10
        ORDER BY rank ASC;
      `;
    } else {
      // monthly
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE user_name IS NOT NULL
            AND call_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY user_name
        ),
        RankedScores AS (
          SELECT 
            user_name,
            total_points,
            call_count,
            last_call_date,
            score_history,
            profile_picture_url,
            RANK() OVER (ORDER BY total_points DESC) as rank
          FROM UserScores
        )
        SELECT * FROM RankedScores
        WHERE user_name = ${memberId}
           OR rank <= 10
        ORDER BY rank ASC;
      `;
    }

    const { rows } = query;

    // Get chart data specifically for the member
    let chartQuery;
    if (period === 'daily') {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('hour', call_date) as date,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE user_name = ${memberId}
            AND call_date >= CURRENT_DATE
          GROUP BY DATE_TRUNC('hour', call_date)
          ORDER BY date ASC
        )
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD HH24:MI') as date,
          COALESCE(daily_total, 0) as points
        FROM DailyScores;
      `;
    } else if (period === 'weekly') {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('day', call_date) as date,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE user_name = ${memberId}
            AND call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE_TRUNC('day', call_date)
          ORDER BY date ASC
        )
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          COALESCE(daily_total, 0) as points
        FROM DailyScores;
      `;
    } else {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('day', call_date) as date,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE user_name = ${memberId}
            AND call_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('day', call_date)
          ORDER BY date ASC
        )
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          COALESCE(daily_total, 0) as points
        FROM DailyScores;
      `;
    }

    return NextResponse.json({
      leaderboard: rows.map(row => ({
        user_name: row.user_name,
        total_points: Math.round(parseFloat(row.total_points)),
        call_count: parseInt(row.call_count),
        last_call_date: row.last_call_date,
        score_history: row.score_history.map((score: string) => parseFloat(score)),
        rank: parseInt(row.rank),
        profile_picture_url: row.profile_picture_url || '/placeholder.svg?height=32&width=32'
      })),
      chartData: chartQuery.rows.map(row => ({
        date: row.date,
        points: Math.round(parseFloat(row.points))
      }))
    });
  } catch (error) {
    console.error('Error getting league data:', error);
    return NextResponse.json({ error: 'Failed to get league data' }, { status: 500 });
  }
}
