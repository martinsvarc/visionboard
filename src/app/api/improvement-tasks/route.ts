import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET endpoint to fetch improvement tasks
export async function GET(request: Request) {
    try {
        const pool = createPool({
            connectionString: process.env.visionboard_PRISMA_URL
        });

        // Get user_id from the URL
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const result = await pool.sql`
            SELECT * FROM user_improvements 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 3;
        `;

        return NextResponse.json({ tasks: result.rows });

    } catch (error) {
        console.error('Error fetching improvement tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch improvement tasks' }, { status: 500 });
    }
}

// POST endpoint to add a new improvement task
export async function POST(request: Request) {
    try {
        const pool = createPool({
            connectionString: process.env.visionboard_PRISMA_URL
        });

        const { userId, improvement } = await request.json();

        if (!userId || !improvement) {
            return NextResponse.json({ error: 'User ID and improvement text are required' }, { status: 400 });
        }

        const result = await pool.sql`
            INSERT INTO user_improvements (user_id, improvement)
            VALUES (${userId}, ${improvement})
            RETURNING *;
        `;

        return NextResponse.json({ task: result.rows[0] });

    } catch (error) {
        console.error('Error adding improvement task:', error);
        return NextResponse.json({ error: 'Failed to add improvement task' }, { status: 500 });
    }
}

// DELETE endpoint to remove a task
export async function DELETE(request: Request) {
    try {
        const pool = createPool({
            connectionString: process.env.visionboard_PRISMA_URL
        });

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        await pool.sql`
            DELETE FROM user_improvements 
            WHERE id = ${taskId};
        `;

        return NextResponse.json({ message: 'Task deleted successfully' });

    } catch (error) {
        console.error('Error deleting improvement task:', error);
        return NextResponse.json({ error: 'Failed to delete improvement task' }, { status: 500 });
    }
}
