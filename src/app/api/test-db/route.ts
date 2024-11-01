import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Test queries
    const dbInfo = await sql`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version;
    `;

    const tableInfo = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    return NextResponse.json({
      status: 'connected',
      database_info: dbInfo.rows[0],
      tables: tableInfo.rows.map(row => row.table_name),
      env_check: {
        has_database: !!process.env.visionboard_DATABASE,
        has_host: !!process.env.visionboard_HOST,
        has_url: !!process.env.visionboard_URL,
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database test failed',
      details: error.message,
      env_check: {
        has_database: !!process.env.visionboard_DATABASE,
        has_host: !!process.env.visionboard_HOST,
        has_url: !!process.env.visionboard_URL,
      }
    }, { status: 500 });
  }
}
