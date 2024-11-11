import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Create table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS user_leaderboard (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        profile_image_url TEXT,
        daily_score INTEGER DEFAULT 0,
        weekly_score INTEGER DEFAULT 0,
        all_time_score INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `;

    // Create index in separate statement
    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_user_leaderboard_scores 
      ON user_leaderboard(weekly_score DESC, all_time_score DESC)
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Table and index created successfully' 
    });

  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
