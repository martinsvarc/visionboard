import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const result = await sql`SELECT NOW();`;
    console.log('Database connection test:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected',
      timestamp: result.rows[0]
    });
  } catch (error: any) {  // Type as 'any' for now
    console.error('Database connection error:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Unknown error',
      type: error?.name || 'Unknown type'
    }, { status: 500 });
  }
};
