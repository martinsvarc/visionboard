import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET route to load vision board items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Create a connection pool using the Prisma URL
    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // First check if the user exists
    const checkResult = await pool.sql`
      SELECT EXISTS (
        SELECT 1 FROM vision_boards WHERE user_id = ${memberId}
      );
    `;
    
    const userExists = checkResult.rows[0].exists;
    console.log('User exists:', userExists);

    if (!userExists) {
      console.log('Creating new user record for:', memberId);
      await pool.sql`
        INSERT INTO vision_boards (user_id, items)
        VALUES (${memberId}, '[]'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;
      `;
    }

    // Get the user's items
    const { rows } = await pool.sql`
      SELECT items, created_at, updated_at
      FROM vision_boards 
      WHERE user_id = ${memberId};
    `;

    return NextResponse.json({
      items: rows[0]?.items || [],
      metadata: {
        createdAt: rows[0]?.created_at,
        updatedAt: rows[0]?.updated_at,
        userExists: userExists,
        userId: memberId
      }
    });
    
  } catch (error) {
    console.error('Load vision board error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to load vision board',
      details: errorMessage
    }, { status: 500 });
  }
}

// POST route to save vision board items
export async function POST(request: Request) {
  try {
    const { memberId, items } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });
    }

    console.log('Saving items for user:', memberId);
    console.log('Items:', items);

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    await pool.sql`
      INSERT INTO vision_boards (user_id, items)
      VALUES (${memberId}, ${JSON.stringify(items)}::jsonb)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        items = ${JSON.stringify(items)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const { rows } = await pool.sql`
      SELECT items, created_at, updated_at
      FROM vision_boards 
      WHERE user_id = ${memberId};
    `;

    return NextResponse.json({
      success: true,
      data: {
        items: rows[0].items,
        savedAt: rows[0].updated_at,
        userId: memberId
      }
    });
    
  } catch (error) {
    console.error('Save vision board error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to save vision board',
      details: errorMessage
    }, { status: 500 });
  }
}
