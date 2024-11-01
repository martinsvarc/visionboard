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

        return NextResponse.json({ 
            message: 'Setup complete',
            details: {
                connection: 'success',
                tableCreation: 'success'
            }
        });

    } catch (error: any) {
        // Detailed error logging
        const errorDetails = {
            message: error.message,
            code: error.code,
            stack: error.stack,
            type: error.constructor.name
        };
        
        console.error('Detailed error:', errorDetails);

        return NextResponse.json({ 
            error: 'Database setup failed',
            details: errorDetails
        }, { status: 500 });
    }
}
