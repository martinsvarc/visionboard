// src/app/api/badges/route.ts

import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET endpoint to fetch user's badges and stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      // If no memberId, return leaderboard
      const pool = createPool({
        connectionString: process.env.visionboard_PRISMA_URL
      });

      const { rows } = await pool.sql`
        SELECT 
          member_id,
          current_week_points as points,
          league_rank,
          RANK() OVER (ORDER BY current_week_points DESC) as rank
        FROM user_badges
        WHERE current_week_points > 0
        ORDER BY current_week_points DESC
        LIMIT 10;
      `;

      return NextResponse.json(rows);
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Get user badges and stats
    const { rows } = await pool.sql`
      SELECT *
      FROM user_badges 
      WHERE member_id = ${memberId};
    `;

    if (rows.length === 0) {
      // Initialize badges for new user
      const { rows: newUser } = await pool.sql`
        INSERT INTO user_badges (
          member_id,
          practice_streak,
          total_calls,
          daily_calls,
          weekly_calls,
          monthly_calls,
          current_week_points,
          total_points,
          league_rank,
          last_practice_date
        ) VALUES (
          ${memberId},
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          NULL,
          NULL
        )
        RETURNING *;
      `;
      return NextResponse.json(transformBadgeData(newUser[0]));
    }

    return NextResponse.json(transformBadgeData(rows[0]));
  } catch (error) {
    console.error('Error getting badges:', error);
    return NextResponse.json({ error: 'Failed to get badges' }, { status: 500 });
  }
}

// POST endpoint to record practice and update badges
export async function POST(request: Request) {
  try {
    const { memberId, points = 0 } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Get current user data
    const { rows: currentData } = await pool.sql`
      SELECT * FROM user_badges WHERE member_id = ${memberId};
    `;

    const now = new Date();
    let streak = 1;
    let lastDate = currentData[0]?.last_practice_date;

    if (lastDate) {
      const dayDifference = Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      if (dayDifference === 1) {
        streak = currentData[0].practice_streak + 1;
      } else if (dayDifference > 1) {
        streak = 1;
      } else if (dayDifference === 0) {
        streak = currentData[0].practice_streak;
      }
    }

    // Update user badges and stats
    const { rows: updated } = await pool.sql`
      UPDATE user_badges
      SET 
        practice_streak = ${streak},
        total_calls = total_calls + 1,
        daily_calls = CASE 
          WHEN last_practice_date::date = CURRENT_DATE 
          THEN daily_calls 
          ELSE 1 
        END,
        weekly_calls = CASE 
          WHEN last_practice_date >= date_trunc('week', CURRENT_TIMESTAMP)
          THEN weekly_calls + 1 
          ELSE 1 
        END,
        monthly_calls = CASE 
          WHEN last_practice_date >= date_trunc('month', CURRENT_TIMESTAMP)
          THEN monthly_calls + 1 
          ELSE 1 
        END,
        current_week_points = CASE 
          WHEN last_practice_date >= date_trunc('week', CURRENT_TIMESTAMP)
          THEN current_week_points + ${points}
          ELSE ${points}
        END,
        total_points = total_points + ${points},
        last_practice_date = CURRENT_TIMESTAMP,
        unlocked_practice_badges = 
          array(SELECT unnest(ARRAY[5, 10, 30, 90, 180, 365]) 
                WHERE unnest <= ${streak}),
        unlocked_calls_badges = 
          array(SELECT unnest(ARRAY[10, 25, 50, 100, 250, 500, 750, 1000, 1500, 2500]) 
                WHERE unnest <= total_calls + 1),
        unlocked_activity_badges = 
          array(
            SELECT badge
            FROM (
              SELECT 'daily_10' as badge WHERE daily_calls + 1 >= 10
              UNION SELECT 'weekly_50' WHERE weekly_calls + 1 >= 50
              UNION SELECT 'monthly_100' WHERE monthly_calls + 1 >= 100
            ) badges
          ),
        last_updated = CURRENT_TIMESTAMP
      WHERE member_id = ${memberId}
      RETURNING *;
    `;

    // Update league ranks based on weekly points
    await pool.sql`
      WITH rankings AS (
        SELECT 
          member_id,
          RANK() OVER (ORDER BY current_week_points DESC) as rank
        FROM user_badges
        WHERE current_week_points > 0
      )
      UPDATE user_badges u
      SET league_rank = CASE 
        WHEN r.rank = 1 THEN 'Gold'
        WHEN r.rank = 2 THEN 'Silver'
        WHEN r.rank = 3 THEN 'Bronze'
        ELSE u.league_rank
      END
      FROM rankings r
      WHERE u.member_id = r.member_id;
    `;

    // Reset points if it's Sunday
    if (now.getDay() === 0 && now.getHours() === 0) {
      await pool.sql`
        UPDATE user_badges
        SET current_week_points = 0
        WHERE current_week_points > 0;
      `;
    }

    return NextResponse.json(transformBadgeData(updated[0]));
  } catch (error) {
    console.error('Error updating badges:', error);
    return NextResponse.json({ error: 'Failed to update badges' }, { status: 500 });
  }
}

function transformBadgeData(row: any) {
  return {
    memberId: row.member_id,
    practice_streak: row.practice_streak,
    total_calls: row.total_calls,
    daily_calls: row.daily_calls,
    weekly_calls: row.weekly_calls,
    monthly_calls: row.monthly_calls,
    current_week_points: row.current_week_points,
    total_points: row.total_points,
    league_rank: row.league_rank,
    unlocked_badges: {
      practice_streak: row.unlocked_practice_badges || [],
      completed_calls: row.unlocked_calls_badges || [],
      activity_goals: row.unlocked_activity_badges || []
    },
    last_updated: row.last_updated
  };
}
