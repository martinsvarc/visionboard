import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Simple connection test
        const result = await sql`
            SELECT current_database() as db_name, 
                   current_timestamp as server_time;
        `;

        return NextResponse.json({ 
            success: true,
            data: result.rows[0],
            connection: {
                hasPostgresUrl: !!process.env.POSTGRES_URL,
                hasPooling: !!process.env.POSTGRES_URL_NON_POOLING,
                hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL
            }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return NextResponse.json({ 
            success: false,
            error: errorMessage,
            connection: {
                hasPostgresUrl: !!process.env.POSTGRES_URL,
                hasPooling: !!process.env.POSTGRES_URL_NON_POOLING,
                hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL
            }
        }, { status: 500 });
    }
}
