import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Create a connection pool using the Prisma URL
        const pool = createPool({
            connectionString: process.env.visionboard_PRISMA_URL
        });

        // Simple connection test
        const result = await pool.sql`
            SELECT current_database() as db_name, 
                   current_timestamp as server_time;
        `;

        return NextResponse.json({ 
            success: true,
            data: result.rows[0],
            connection: {
                hasUrl: !!process.env.visionboard_URL,
                hasPrismaUrl: !!process.env.visionboard_PRISMA_URL,
                hasNonPooling: !!process.env.visionboard_URL_NON_POOLING
            }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return NextResponse.json({ 
            success: false,
            error: errorMessage,
            connection: {
                hasUrl: !!process.env.visionboard_URL,
                hasPrismaUrl: !!process.env.visionboard_PRISMA_URL,
                hasNonPooling: !!process.env.visionboard_URL_NON_POOLING
            }
        }, { status: 500 });
    }
}
