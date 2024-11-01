import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Simple test query
    const result = await sql`SELECT NOW();`;
    return NextResponse.json({ 
      message: 'Database connected successfully', 
      timestamp: result.rows[0],
      connectionDetails: {
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        // Don't log actual username/password
        hasUser: !!process.env.POSTGRES_USER,
        hasPassword: !!process.env.POSTGRES_PASSWORD
      }
    });
  } catch (error) {
    console.error('Detailed database error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error.message 
    }, { status: 500 });
  }
}
