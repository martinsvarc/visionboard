// src/app/api/vision-board/route.ts
import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET endpoint
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
      SELECT * FROM vision_board_items 
      WHERE memberstack_id = ${memberId}
      ORDER BY z_index ASC;
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error getting vision board items:', error);
    return NextResponse.json({ error: 'Failed to get vision board items' }, { status: 500 });
  }
}

// POST endpoint
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color } = body;
    
    if (!memberstack_id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      INSERT INTO vision_board_items (
        memberstack_id,
        image_url,
        x_position,
        y_position,
        width,
        height,
        z_index,
        board_color
      ) VALUES (
        ${memberstack_id},
        ${image_url},
        ${x_position},
        ${y_position},
        ${width},
        ${height},
        ${z_index},
        ${board_color}
      )
      RETURNING *;
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating vision board item:', error);
    return NextResponse.json({ error: 'Failed to create vision board item' }, { status: 500 });
  }
}

// PUT endpoint
export const PUT = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, x_position, y_position, width, height, z_index, board_color, memberstack_id } = body;

    if (!id || !memberstack_id) {
      return NextResponse.json({ error: 'ID and Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Update only the provided fields
    let updateQuery = 'UPDATE vision_board_items SET ';
    const updates = [];
    const values = [];

    if (x_position !== undefined) {
      updates.push(`x_position = $${values.length + 1}`);
      values.push(x_position);
    }
    if (y_position !== undefined) {
      updates.push(`y_position = $${values.length + 1}`);
      values.push(y_position);
    }
    if (width !== undefined) {
      updates.push(`width = $${values.length + 1}`);
      values.push(width);
    }
    if (height !== undefined) {
      updates.push(`height = $${values.length + 1}`);
      values.push(height);
    }
    if (z_index !== undefined) {
      updates.push(`z_index = $${values.length + 1}`);
      values.push(z_index);
    }
    if (board_color !== undefined) {
      updates.push(`board_color = $${values.length + 1}`);
      values.push(board_color);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { rows } = await pool.sql`
      UPDATE vision_board_items 
      SET ${updates.join(', ')}
      WHERE id = ${id} AND memberstack_id = ${memberstack_id}
      RETURNING *;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating vision board item:', error);
    return NextResponse.json({ error: 'Failed to update vision board item' }, { status: 500 });
  }
}

// DELETE endpoint
export const DELETE = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const memberstack_id = searchParams.get('memberstack_id');
    
    if (!id || !memberstack_id) {
      return NextResponse.json({ error: 'ID and Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      DELETE FROM vision_board_items 
      WHERE id = ${id} AND memberstack_id = ${memberstack_id}
      RETURNING *;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vision board item:', error);
    return NextResponse.json({ error: 'Failed to delete vision board item' }, { status: 500 });
  }
}
