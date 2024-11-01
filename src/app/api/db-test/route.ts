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
                hasUrl: !!process.env.visionboard_URL,
                hasHost: !!process.env.visionboard_HOST,
                hasDb: !!process.env.visionboard_DATABASE
            }
        });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false,
            error: error.message,
            code: error.code,
            connection: {
                hasUrl: !!process.env.visionboard_URL,
                hasHost: !!process.env.visionboard_HOST,
                hasDb: !!process.env.visionboard_DATABASE
            }
        }, { status: 500 });
    }
}
