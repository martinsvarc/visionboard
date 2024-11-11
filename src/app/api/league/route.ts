import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const currentUserId = searchParams.get('currentUserId'); // Add this to identify current user
    
    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    let query;
    if (period === 'weekly') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            cl.member_id,
            MAX(cl.user_name) as user_name,
            SUM(cl.overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(cl.call_date) as last_call_date,
            ARRAY_AGG(cl.overall_effectiveness_score ORDER BY cl.call_date) as score_history,
            MAX(cl.user_picture_url) as profile_picture_url
          FROM call_logs cl
          WHERE cl.member_id IS NOT NULL
            AND cl.call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY cl.member_id
        )
        SELECT 
          member_id,
          user_name,
          total_points,
          call_count,
          last_call_date,
          score_history,
          COALESCE(profile_picture_url, '/placeholder.svg?height=32&width=32') as profile_picture_url,
          RANK() OVER (ORDER BY total_points DESC) as rank
        FROM UserScores
        ORDER BY total_points DESC;
      `;
    } else if (period === 'allTime') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            cl.member_id,
            MAX(cl.user_name) as user_name,
            SUM(cl.overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(cl.call_date) as last_call_date,
            ARRAY_AGG(cl.overall_effectiveness_score ORDER BY cl.call_date) as score_history,
            MAX(cl.user_picture_url) as profile_picture_url
          FROM call_logs cl
          WHERE cl.member_id IS NOT NULL
          GROUP BY cl.member_id
        )
        SELECT 
          member_id,
          user_name,
          total_points,
          call_count,
          last_call_date,
          score_history,
          COALESCE(profile_picture_url, '/placeholder.svg?height=32&width=32') as profile_picture_url,
          RANK() OVER (ORDER BY total_points DESC) as rank
        FROM UserScores
        ORDER BY total_points DESC;
      `;
    } else {
      // teamAllTime - assuming teams are grouped by some team_id field
      query = await pool.sql`
        WITH TeamScores AS (
          SELECT 
            t.team_id as member_id,
            MAX(t.team_name) as user_name,
            SUM(cl.overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(cl.call_date) as last_call_date,
            ARRAY_AGG(cl.overall_effectiveness_score ORDER BY cl.call_date) as score_history,
            MAX(t.team_picture_url) as profile_picture_url
          FROM call_logs cl
          JOIN teams t ON cl.team_id = t.team_id
          WHERE t.team_id IS NOT NULL
          GROUP BY t.team_id
        )
        SELECT 
          member_id,
          user_name,
          total_points,
          call_count,
          last_call_date,
          score_history,
          COALESCE(profile_picture_url, '/placeholder.svg?height=32&width=32') as profile_picture_url,
          RANK() OVER (ORDER BY total_points DESC) as rank
        FROM TeamScores
        ORDER BY total_points DESC;
      `;
    }

    const { rows } = query;

    // Transform the rows
    const transformedRows = rows.map(row => ({
      member_id: row.member_id,
      user_name: row.user_name,
      total_points: Math.round(parseFloat(row.total_points)),
      call_count: parseInt(row.call_count),
      last_call_date: row.last_call_date,
      score_history: row.score_history.map((score: string) => parseFloat(score)),
      rank: parseInt(row.rank),
      profile_picture_url: row.profile_picture_url
    }));

    // Get chart data - now including both user and leader points
    let chartQuery;
    if (period === 'weekly') {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('day', call_date) as date,
            member_id,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE_TRUNC('day', call_date), member_id
        ),
        LeaderScores AS (
          SELECT 
            date,
            MAX(daily_total) as leader_points
          FROM DailyScores
          GROUP BY date
        ),
        UserScores AS (
          SELECT 
            date,
            daily_total as user_points
          FROM DailyScores
          WHERE member_id = ${currentUserId}
        )
        SELECT 
          TO_CHAR(ls.date, 'YYYY-MM-DD') as date,
          COALESCE(us.user_points, 0) as user_points,
          ls.leader_points
        FROM LeaderScores ls
        LEFT JOIN UserScores us ON ls.date = us.date
        ORDER BY ls.date ASC;
      `;
    } else {
      // Similar queries for allTime and teamAllTime periods
      // Adjust the time interval accordingly
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('week', call_date) as date,
            member_id,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          GROUP BY DATE_TRUNC('week', call_date), member_id
        ),
        LeaderScores AS (
          SELECT 
            date,
            MAX(daily_total) as leader_points
          FROM DailyScores
          GROUP BY date
        ),
        UserScores AS (
          SELECT 
            date,
            daily_total as user_points
          FROM DailyScores
          WHERE member_id = ${currentUserId}
        )
        SELECT 
          TO_CHAR(ls.date, 'YYYY-MM-DD') as date,
          COALESCE(us.user_points, 0) as user_points,
          ls.leader_points
        FROM LeaderScores ls
        LEFT JOIN UserScores us ON ls.date = us.date
        ORDER BY ls.date ASC
        LIMIT 12;
      `;
    }

    const chartData = chartQuery.rows.map(row => ({
      date: row.date,
      userPoints: Math.round(parseFloat(row.user_points)),
      leaderPoints: Math.round(parseFloat(row.leader_points))
    }));

    return NextResponse.json({
      leaderboard: transformedRows,
      chartData: chartData
    });
  } catch (error) {
    console.error('Error getting league data:', error);
    return NextResponse.json({ error: 'Failed to get league data' }, { status: 500 });
  }
}
