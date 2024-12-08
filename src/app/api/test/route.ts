import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const client = createClient();
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW();');
    await client.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected',
      timestamp: result.rows[0]
    });
  } catch (error: any) {
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
