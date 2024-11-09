import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // 'daily', 'weekly', 'monthly'

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Define time period filter
    let timeFilter;
    switch (period) {
      case 'daily':
        timeFilter = `WHERE call_date >= CURRENT_DATE`;
        break;
      case 'weekly':
        timeFilter = `WHERE call_date >= CURRENT_DATE - INTERVAL '7 days'`;
        break;
      case 'monthly':
        timeFilter = `WHERE call_date >= CURRENT_DATE - INTERVAL '30 days'`;
        break;
      default:
        timeFilter = ''; // All time if no period specified
    }

    // Get leaderboard data
    const { rows } = await pool.sql`
      WITH UserScores AS (
        SELECT 
          user_name,
          SUM(overall_effectiveness_score) as total_points,
          COUNT(*) as call_count,
          MAX(call_date) as last_call_date,
          ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history
        FROM call_logs
        WHERE user_name IS NOT NULL
        AND ${timeFilter}
        GROUP BY user_name
      )
      SELECT 
        user_name,
        total_points,
        call_count,
        last_call_date,
        score_history,
        RANK() OVER (ORDER BY total_points DESC) as rank
      FROM UserScores
      ORDER BY total_points DESC;
    `;

    const transformedRows = rows.map(row => ({
      user_name: row.user_name,
      total_points: Math.round(parseFloat(row.total_points)), // Round to whole number
      call_count: parseInt(row.call_count),
      last_call_date: row.last_call_date,
      score_history: row.score_history.map((score: string) => parseFloat(score)),
      rank: parseInt(row.rank)
    }));

    // Get chart data for score trends
    const { rows: chartData } = await pool.sql`
      WITH DailyScores AS (
        SELECT 
          DATE_TRUNC('day', call_date) as date,
          SUM(overall_effectiveness_score) as daily_total
        FROM call_logs
        WHERE ${timeFilter}
        GROUP BY DATE_TRUNC('day', call_date)
        ORDER BY date DESC
        LIMIT 7
      )
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        daily_total as points
      FROM DailyScores
      ORDER BY date ASC;
    `;

    return NextResponse.json({
      leaderboard: transformedRows,
      chartData: chartData.map(row => ({
        date: row.date,
        points: Math.round(parseFloat(row.points))
      }))
    });
  } catch (error) {
    console.error('Error getting league data:', error);
    return NextResponse.json({ error: 'Failed to get league data' }, { status: 500 });
  }
}
