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

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Log the full database record
    const { rows } = await pool.sql`
      SELECT * FROM vision_boards WHERE user_id = ${memberId};
    `;

    console.log('Database record:', rows[0]);

    if (!rows.length) {
      console.log('No record found, creating new one');
      await pool.sql`
        INSERT INTO vision_boards (user_id, items)
        VALUES (${memberId}, '[]'::jsonb)
      `;
      return NextResponse.json({
        items: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          userExists: false,
          userId: memberId
        }
      });
    }

    return NextResponse.json({
      items: rows[0].items || [],
      metadata: {
        createdAt: rows[0].created_at,
        updatedAt: rows[0].updated_at,
        userExists: true,
        userId: memberId,
        debug: {
          itemsType: typeof rows[0].items,
          itemsLength: Array.isArray(rows[0].items) ? rows[0].items.length : 'not an array',
          rawItems: rows[0].items
        }
      }
    });
    
  } catch (error) {
    console.error('Load vision board error:', error);
    return NextResponse.json({ 
      error: 'Failed to load vision board',
      details: error instanceof Error ? error.message : 'Unknown error'
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
      return NextResponse.json({ 
        error: 'Items must be an array',
        receivedType: typeof items,
        receivedValue: items
      }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    console.log('Saving vision board:', {
      memberId,
      itemsCount: items.length,
      firstItem: items[0],
      allItems: items
    });

    // Save items
    await pool.sql`
      INSERT INTO vision_boards (user_id, items)
      VALUES (${memberId}, ${JSON.stringify(items)}::jsonb)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        items = ${JSON.stringify(items)}::jsonb,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Verify save
    const { rows } = await pool.sql`
      SELECT * FROM vision_boards WHERE user_id = ${memberId};
    `;

    return NextResponse.json({
      success: true,
      saved: {
        items: rows[0].items,
        timestamp: rows[0].updated_at,
        itemCount: Array.isArray(rows[0].items) ? rows[0].items.length : 0
      }
    });
    
  } catch (error) {
    console.error('Save vision board error:', error);
    return NextResponse.json({ 
      error: 'Failed to save vision board',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
