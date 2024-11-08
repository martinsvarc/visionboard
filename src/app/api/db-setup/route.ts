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

        // Step 6: Create daily_plans table
        console.log('Creating daily_plans table...');
        await pool.sql`
            CREATE TABLE IF NOT EXISTS daily_plans (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                task TEXT NOT NULL,
                completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Daily plans table created successfully');

        // Step 7: Create call_logs table
        console.log('Creating call_logs table...');
        await pool.sql`
            CREATE TABLE IF NOT EXISTS call_logs (
                id SERIAL PRIMARY KEY,
                member_id TEXT NOT NULL,
                call_number INTEGER NOT NULL,
                agent_name TEXT NOT NULL,
                agent_picture_url TEXT,
                call_recording_url TEXT,
                call_details TEXT,
                call_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                engagement_score DECIMAL,
                objection_handling_score DECIMAL,
                information_gathering_score DECIMAL,
                program_explanation_score DECIMAL,
                closing_skills_score DECIMAL,
                overall_effectiveness_score DECIMAL,
                average_success_score DECIMAL,
                engagement_feedback TEXT,
                objection_handling_feedback TEXT,
                information_gathering_feedback TEXT,
                program_explanation_feedback TEXT,
                closing_skills_feedback TEXT,
                overall_effectiveness_feedback TEXT
            );
        `;
        console.log('Call logs table created successfully');

        // Insert test data for call_logs
        console.log('Inserting test data into call_logs...');
        await pool.sql`
            INSERT INTO call_logs (
                member_id,
                call_number,
                agent_name,
                engagement_score,
                objection_handling_score,
                information_gathering_score,
                program_explanation_score,
                closing_skills_score,
                overall_effectiveness_score,
                average_success_score
            ) VALUES (
                'test123',
                1,
                'Test Agent',
                85.5,
                90.0,
                88.5,
                92.0,
                87.5,
                89.0,
                88.75
            ) ON CONFLICT DO NOTHING;
        `;
        console.log('Test data inserted successfully');

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
