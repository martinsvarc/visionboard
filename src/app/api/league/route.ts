import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Just try to select from the table first
    const { rows } = await pool.sql`
      SELECT * FROM user_leaderboard ORDER BY daily_score DESC LIMIT 1;
    `;

    return NextResponse.json({
      success: true,
      test: true,
      rows,
      memberId
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to load leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error',
      fullError: error
    }, { 
      status: 500 
    });
  }
}
