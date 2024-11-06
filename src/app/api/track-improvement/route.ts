import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Get improvements for the specific member
    const { rows } = await pool.sql`
      SELECT improvement, created_at 
      FROM user_improvements 
      WHERE user_id = ${memberId}
      ORDER BY created_at DESC
      LIMIT 5;
    `;

    return NextResponse.json({
      improvements: rows.map(row => row.improvement)
    });

  } catch (error) {
    console.error('Error getting improvements:', error);
    return NextResponse.json({ error: 'Failed to get improvements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, improvement } = await request.json();
    
    if (!memberId || !improvement) {
      return NextResponse.json({ error: 'Member ID and improvement required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Add improvement
    await pool.sql`
      INSERT INTO user_improvements (user_id, improvement)
      VALUES (${memberId}, ${improvement});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding improvement:', error);
    return NextResponse.json({ error: 'Failed to add improvement' }, { status: 500 });
  }
}
