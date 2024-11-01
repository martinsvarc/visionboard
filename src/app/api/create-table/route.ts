import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

interface VisionBoardItem {
  id: string;
  url: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

// GET route to load vision board items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT items 
      FROM vision_boards 
      WHERE user_id = ${memberId}
    `;

    // If no record exists, return empty array
    if (rows.length === 0) {
      await sql`
        INSERT INTO vision_boards (user_id, items)
        VALUES (${memberId}, '[]'::jsonb)
      `;
      return NextResponse.json([]);
    }

    return NextResponse.json(rows[0].items);
  } catch (error) {
    console.error('Load vision board error:', error);
    return NextResponse.json(
      { error: 'Failed to load vision board' }, 
      { status: 500 }
    );
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

    await sql`
      INSERT INTO vision_boards (user_id, items)
      VALUES (${memberId}, ${JSON.stringify(items)}::jsonb)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        items = ${JSON.stringify(items)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save vision board error:', error);
    return NextResponse.json(
      { error: 'Failed to save vision board' }, 
      { status: 500 }
    );
  }
}
