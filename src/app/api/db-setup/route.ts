import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Starting database setup...');
    
    // First test connection
    const testConnection = await sql`SELECT NOW();`;
    console.log('Database connection successful');

    // Create the vision_boards table with more detailed error handling
    const result = await sql`
      CREATE TABLE IF NOT EXISTS vision_boards (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        items JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Log success
    console.log('Table creation successful');
    
    return NextResponse.json({ 
      message: 'Database setup completed',
      details: {
        timestamp: testConnection.rows[0],
        tableCreated: true
      }
    });
  } catch (error) {
    // Detailed error logging
    console.error('Detailed setup error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
