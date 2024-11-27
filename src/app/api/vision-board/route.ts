import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');
  
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
  }

  try {
    const client = createClient();
    await client.connect();
    
    const { rows } = await client.query(
      'SELECT * FROM vision_board_items WHERE memberstack_id = $1 ORDER BY z_index ASC',
      [memberId]
    );
    
    await client.end();
    return NextResponse.json(rows);
  } catch (err) {
    const error = err as Error;
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to load vision board', details: error?.toString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color } = body;
    
    const client = createClient();
    await client.connect();
    
    const { rows } = await client.query(
      `INSERT INTO vision_board_items 
       (memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color]
    );
    
    await client.end();
    return NextResponse.json(rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save item', details: error?.toString() }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, memberstack_id, x_position, y_position, width, height, z_index, board_color } = body;

    if (!id || !memberstack_id) {
      return NextResponse.json({ error: 'ID and Member ID required' }, { status: 400 });
    }

    const client = createClient();
    await client.connect();
    
    const updates = [];
    const values = [id, memberstack_id];
    let paramCount = 3;

    if (x_position !== undefined) {
      updates.push(`x_position = $${paramCount++}`);
      values.push(x_position);
    }
    if (y_position !== undefined) {
      updates.push(`y_position = $${paramCount++}`);
      values.push(y_position);
    }
    if (width !== undefined) {
      updates.push(`width = $${paramCount++}`);
      values.push(width);
    }
    if (height !== undefined) {
      updates.push(`height = $${paramCount++}`);
      values.push(height);
    }
    if (z_index !== undefined) {
      updates.push(`z_index = $${paramCount++}`);
      values.push(z_index);
    }
    if (board_color !== undefined) {
      updates.push(`board_color = $${paramCount++}`);
      values.push(board_color);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE vision_board_items 
      SET ${updates.join(', ')}
      WHERE id = $1 AND memberstack_id = $2
      RETURNING *
    `;

    const { rows } = await client.query(query, values);
    
    await client.end();
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update item', details: error?.toString() }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const memberstack_id = searchParams.get('memberstack_id');
    
    if (!id || !memberstack_id) {
      return NextResponse.json({ error: 'ID and Member ID required' }, { status: 400 });
    }

    const client = createClient();
    await client.connect();
    
    const { rows } = await client.query(
      'DELETE FROM vision_board_items WHERE id = $1 AND memberstack_id = $2 RETURNING *',
      [id, memberstack_id]
    );
    
    await client.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete item', details: error?.toString() }, { status: 500 });
  }
}
