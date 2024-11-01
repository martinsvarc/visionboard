import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Log environment variables (safely)
    console.log('Environment check:', {
      hasUrl: !!process.env.visionboard_URL,
      hasHost: !!process.env.visionboard_HOST,
      hasDb: !!process.env.visionboard_DATABASE,
    });

    // Step 1: Test basic connection
    console.log('Testing connection...');
    const connectionTest = await sql`SELECT 1 as test;`;
    console.log('Connection successful:', connectionTest.rows[0]);

    // Step 2: Create table with better error handling
    console.log('Creating table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS vision_boards (
          id SERIAL PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          items JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Table created successfully');
    } catch (tableError)
