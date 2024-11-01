import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Starting database setup...');
    
    // First test connection with your specific env variables
    const testResult = await sql`
      SELECT current_database() as database_name, 
             current_user as user_name, 
             version() as postgres_version;
    `;
    console.log('Connection test result:', testResult.rows[0]);

    // Create the vision_boards table
    await sql`DROP TABLE IF EXISTS vision_boards;`; // Reset table if needed
    
    const createResult = await sql`
      CREATE TABLE vision_boards (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        items JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Test the table by inserting a dummy record
    await sql`
      INSERT INTO vision_boards (user_id, items) 
      VALUES ('test_user', '[]'::jsonb)
      ON CONFLICT (user_id) DO NOTHING;
    `;
    
    // Verify the table exists
    const verifyResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vision_boards'
      );
    `;
    
    return NextResponse.json({ 
      message: 'Database setup completed successfully',
      details: {
        connection: testResult.rows[0],
        tableExists: verifyResult.rows[0].exists
      }
    });

  } catch (error) {
    console.error('Database setup error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: {
        message: error.message,
        code: error.code
      }
    }, { status: 500 });
  }
}
