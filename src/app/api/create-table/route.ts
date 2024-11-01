import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET route to load vision board items
export async function GET(request: Request) {
  try {
    // Get user ID from URL
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load items from database
    const { rows } = await sql`
      SELECT items FROM vision_boards 
      WHERE user_id = ${memberId}
    `;

    return NextResponse.json(rows[0]?.items || []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST route to save vision board items
export async function POST(request: Request) {
  try {
    const { memberId, items } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save items to database
    await sql`
      INSERT INTO vision_boards (user_id, items)
      VALUES (${memberId}, ${JSON.stringify(items)})
      ON CONFLICT (user_id)
      DO UPDATE SET 
        items = ${JSON.stringify(items)},
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
