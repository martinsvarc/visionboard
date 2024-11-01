import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Create a connection pool using the Prisma URL
        const pool = createPool({
            connectionString: process.env.visionboard_PRISMA_URL
        });

        // Log environment check
        console.log('Environment check:', {
            hasUrl: !!process.env.visionboard_URL,
            hasPrismaUrl: !!process.env.visionboard_PRISMA_URL,
            hasNonPooling: !!process.env.visionboard_URL_NON_POOLING
        });

        if (!process.env.visionboard_PRISMA_URL) {
            throw new Error('Database Prisma URL environment variable is missing');
        }

        // Step 1: Test basic connection
        console.log('Testing connection...');
        const connectionTest = await pool.sql`SELECT 1 as test;`;
        console.log('Connection successful:', connectionTest.rows[0]);

        // Step 2: Create table with better error handling
        console.log('Creating table...');
        await pool.sql`
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

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorDetails = {
            message: errorMessage,
            type: error instanceof Error ? error.constructor.name : 'Unknown'
        };
        
        console.error('Detailed error:', errorDetails);

        return NextResponse.json({ 
            error: 'Database setup failed',
            details: errorDetails
        }, { status: 500 });
    }
}
