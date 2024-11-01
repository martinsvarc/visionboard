import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Create the vision_boards table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS vision_boards (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        items JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    return NextResponse.json({ message: 'Database setup completed' });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: 'Database setup failed' }, { status: 500 });
  }
}
