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
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
};
