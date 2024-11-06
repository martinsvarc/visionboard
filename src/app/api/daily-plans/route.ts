import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Add these lines to explicitly tell Next.js what methods are allowed
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      SELECT id, task, completed
      FROM daily_plans 
      WHERE user_id = ${memberId}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({
      improvements: rows.map(row => ({
        id: row.id,
        text: row.task,
        completed: row.completed
      }))
    });
  } catch (error) {
    console.error('Error getting daily plans:', error);
    return NextResponse.json({ error: 'Failed to get daily plans' }, { status: 500 });
  }
}

export const POST = async (request: Request) => {
  try {
    const { memberId, tasks } = await request.json();
    
    if (!memberId || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Member ID and tasks array required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // First clear existing tasks
    await pool.sql`
      DELETE FROM daily_plans 
      WHERE user_id = ${memberId};
    `;

    // Add new tasks
    for (const task of tasks) {
      await pool.sql`
        INSERT INTO daily_plans (user_id, task)
        VALUES (${memberId}, ${task});
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding daily plans:', error);
    return NextResponse.json({ error: 'Failed to add daily plans' }, { status: 500 });
  }
}

export const DELETE = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    await pool.sql`
      DELETE FROM daily_plans 
      WHERE user_id = ${memberId};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily plans:', error);
    return NextResponse.json({ error: 'Failed to delete daily plans' }, { status: 500 });
  }
}
