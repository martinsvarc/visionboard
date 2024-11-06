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
        // Step 2: Create vision_boards table
        console.log('Creating vision_boards table...');
        await pool.sql`
            CREATE TABLE IF NOT EXISTS vision_boards (
                id SERIAL PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                items JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Vision boards table created successfully');
        // Step 3: Create user_streaks table
        console.log('Creating user_streaks table...');
        await pool.sql`
            CREATE TABLE IF NOT EXISTS user_streaks (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                visit_date DATE NOT NULL,
                url_visited TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, visit_date)
            );
        `;
        console.log('User streaks table created successfully');
        // Step 4: Create user_sessions table
        console.log('Creating user_sessions table...');
        await pool.sql`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                url_visited TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('User sessions table created successfully');

        // Step 5: Create user_improvements table
        console.log('Creating user_improvements table...');
        await pool.sql`
            CREATE TABLE IF NOT EXISTS user_improvements (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                improvement TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('User improvements table created successfully');

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
