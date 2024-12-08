import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'call_logs';
    `;
    
    return NextResponse.json({ 
      success: true, 
      schema: result.rows 
    });
  } catch (error: any) {  // Type as 'any' for now
    console.error('Schema fetch error:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack
    });

    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
};
