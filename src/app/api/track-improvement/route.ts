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

    // Get only the 3 most recent improvements
    const { rows } = await pool.sql`
      SELECT improvement, id
      FROM user_improvements 
      WHERE user_id = ${memberId}
      ORDER BY created_at DESC
      LIMIT 3;
    `;

    return NextResponse.json({
      improvements: rows.map(row => ({
        id: row.id,
        text: row.improvement
      }))
    });
  } catch (error) {
    console.error('Error getting improvements:', error);
    return NextResponse.json({ error: 'Failed to get improvements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, improvements } = await request.json();
    
    if (!memberId || !improvements || !Array.isArray(improvements)) {
      return NextResponse.json({ error: 'Member ID and improvements array required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Delete old improvements first
    await pool.sql`
      DELETE FROM user_improvements 
      WHERE user_id = ${memberId} 
      AND id NOT IN (
        SELECT id FROM user_improvements 
        WHERE user_id = ${memberId} 
        ORDER BY created_at DESC 
        LIMIT 3
      );
    `;

    // Add new improvements
    for (const improvement of improvements) {
      await pool.sql`
        INSERT INTO user_improvements (user_id, improvement)
        VALUES (${memberId}, ${improvement});
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding improvements:', error);
    return NextResponse.json({ error: 'Failed to add improvements' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const improvementId = searchParams.get('id');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    if (improvementId) {
      await pool.sql`
        DELETE FROM user_improvements 
        WHERE user_id = ${memberId} 
        AND id = ${improvementId};
      `;
    } else {
      await pool.sql`
        DELETE FROM user_improvements 
        WHERE user_id = ${memberId};
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting improvement(s):', error);
    return NextResponse.json({ error: 'Failed to delete improvement(s)' }, { status: 500 });
  }
}
