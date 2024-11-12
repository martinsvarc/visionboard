import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    await pool.sql`
      CREATE TABLE IF NOT EXISTS user_badges (
          id SERIAL PRIMARY KEY,
          member_id TEXT NOT NULL UNIQUE,
          practice_streak INTEGER DEFAULT 0,
          total_calls INTEGER DEFAULT 0,
          daily_calls INTEGER DEFAULT 0,
          weekly_calls INTEGER DEFAULT 0,
          monthly_calls INTEGER DEFAULT 0,
          current_week_points INTEGER DEFAULT 0,
          total_points INTEGER DEFAULT 0,
          league_rank TEXT DEFAULT NULL,
          last_practice_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          unlocked_practice_badges INTEGER[] DEFAULT ARRAY[]::INTEGER[],
          unlocked_calls_badges INTEGER[] DEFAULT ARRAY[]::INTEGER[],
          unlocked_activity_badges TEXT[] DEFAULT ARRAY[]::TEXT[],
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_user_badges_member_id 
      ON user_badges(member_id)
    `;

    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_user_badges_points 
      ON user_badges(current_week_points DESC)
    `;

    return NextResponse.json({ message: "Table created successfully" });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
