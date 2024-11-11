import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Delete all "New User" entries
    await pool.sql`
      DELETE FROM user_leaderboard 
      WHERE user_name = 'New User';
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Test data cleaned up successfully' 
    });

  } catch (error) {
    console.error('Error cleaning up test data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clean up test data'
    }, { 
      status: 500 
    });
  }
}
