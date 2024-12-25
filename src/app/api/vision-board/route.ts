import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

const getDbClient = async () => {
 const client = createClient();
 await client.connect();
 return client;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');
  
  if (!memberId) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

  try {
    const client = await getDbClient();
    const { rows } = await client.query(
      'SELECT * FROM vision_board_items WHERE memberstack_id = $1 ORDER BY z_index ASC',
      [memberId]
    );
    const response = NextResponse.json(rows);
    response.headers.set('Cache-Control', 'public, max-age=300');
    await client.end();
    return response;
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: 'Failed to load vision board', details: error?.toString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", { ...body, image_url: body.image_url?.substring(0, 100) + '...' }); // Log truncated version
    
    const { memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color } = body;
    
    // If the image is base64
    let finalImageUrl = image_url;
    if (image_url.startsWith('data:image')) {
      console.log("Processing base64 image...");
      // Convert base64 to blob
      const base64Data = image_url.split(',')[1];
      const blob = Buffer.from(base64Data, 'base64');
      
      console.log("Uploading to blob storage...");
      // Upload to Vercel Blob Storage
      const { url } = await put(
        `vision-board/${memberstack_id}/${Date.now()}.jpg`, 
        blob, 
        { access: 'public' }
      );
      
      console.log("Got URL from blob storage:", url);
      finalImageUrl = url;
    }
    
    console.log("Saving to database with URL:", finalImageUrl);
    const client = await getDbClient();
    const { rows } = await client.query(
      `INSERT INTO vision_board_items 
       (memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [memberstack_id, finalImageUrl, x_position, y_position, width, height, z_index, board_color]
    );
    
    const response = NextResponse.json(rows[0]);
    response.headers.set('Cache-Control', 'no-store');
    await client.end();
    return response;
  } catch (err) {
    const error = err as Error;
    console.error('Full error details:', error);
    return NextResponse.json({ error: 'Failed to save item', details: error?.toString() }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, memberstack_id, image_url, x_position, y_position, width, height, z_index, board_color } = body;

    if (!id || !memberstack_id) {
      return NextResponse.json({ error: 'ID and Member ID required' }, { status: 400 });
    }

    const client = await getDbClient();
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Handle base64 image if present
    let finalImageUrl = image_url;
    if (image_url && image_url.startsWith('data:image')) {
      const base64Data = image_url.split(',')[1];
      const blob = Buffer.from(base64Data, 'base64');
      const { url } = await put(
        `vision-board/${memberstack_id}/${Date.now()}.jpg`, 
        blob, 
        { access: 'public' }
      );
      finalImageUrl = url;
    }

    const fieldsToUpdate = {
      image_url: finalImageUrl,
      x_position, 
      y_position, 
      width, 
      height, 
      z_index, 
      board_color
    };

    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id, memberstack_id);

    const query = `
      UPDATE vision_board_items 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++} AND memberstack_id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await client.query(query, values);
    await client.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const response = NextResponse.json(rows[0]);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: 'Failed to update item', details: error?.toString() }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const memberstack_id = searchParams.get('memberstack_id');
  
  if (!id || !memberstack_id) {
    return NextResponse.json({ error: 'ID and Member ID required' }, { status: 400 });
  }

  try {
    const client = await getDbClient();
    
    // First get the image URL before deleting
    const { rows: itemRows } = await client.query(
      'SELECT image_url FROM vision_board_items WHERE id = $1 AND memberstack_id = $2',
      [id, memberstack_id]
    );

    if (itemRows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete from database
    await client.query(
      'DELETE FROM vision_board_items WHERE id = $1 AND memberstack_id = $2',
      [id, memberstack_id]
    );
    
    await client.end();

    // If image is in Vercel Blob storage (URL contains specific pattern)
    const imageUrl = itemRows[0].image_url;
    if (imageUrl.includes('vercel.blob.core.windows.net')) {
      try {
        // Delete from blob storage
        await del(imageUrl);
      } catch (blobError) {
        console.error('Failed to delete from blob storage:', blobError);
        // Continue even if blob deletion fails
      }
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: 'Failed to delete item', details: error?.toString() }, { status: 500 });
  }
}
