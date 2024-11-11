import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const currentUserId = searchParams.get('currentUserId');
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Current user ID is required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    let query;
    if (period === 'weekly') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            member_id,
            MAX(user_name) as user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE member_id IS NOT NULL
          AND call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY member_id
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
            member_id,
            MAX(user_name) as user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE member_id IS NOT NULL
          GROUP BY member_id
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
      // teamAllTime
      query = await pool.sql`
        WITH TeamScores AS (
          SELECT 
            team_id as member_id,
            MAX(team_name) as user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(team_picture_url) as profile_picture_url
          FROM call_logs
          JOIN teams USING (team_id)
          WHERE team_id IS NOT NULL
          GROUP BY team_id
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

    // Get chart data for current user and leader
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
      // For allTime and teamAllTime, show weekly aggregates
      chartQuery = await pool.sql`
        WITH WeeklyScores AS (
          SELECT 
            DATE_TRUNC('week', call_date) as date,
            member_id,
            SUM(overall_effectiveness_score) as weekly_total
          FROM call_logs
          GROUP BY DATE_TRUNC('week', call_date), member_id
        ),
        LeaderScores AS (
          SELECT 
            date,
            MAX(weekly_total) as leader_points
          FROM WeeklyScores
          GROUP BY date
        ),
        UserScores AS (
          SELECT 
            date,
            weekly_total as user_points
          FROM WeeklyScores
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
