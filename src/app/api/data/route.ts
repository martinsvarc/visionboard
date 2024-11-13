import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const client = createClient();
        await client.connect();

        const { rows } = await client.sql`
            SELECT 
                session_id,
                team_id,
                member_id,
                user_picture_url,
                assistant_picture_url,
                assistant_name,
                created_at
            FROM data 
            WHERE session_id = ${sessionId};
        `;

        await client.end();

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error('Data retrieval error:', error);
        return NextResponse.json({
            error: 'Failed to retrieve data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received body:', body);

        // Validate required fields
        if (!body.sessionId || !body.teamId || !body.memberId) {
            return NextResponse.json({
                error: 'Missing required fields',
                receivedData: body
            }, { status: 400 });
        }

        const client = createClient();
        await client.connect();

        // Insert or update data
        await client.sql`
            INSERT INTO data (
                session_id,
                team_id,
                member_id,
                user_picture_url,
                assistant_picture_url,
                assistant_name
            )
            VALUES (
                ${body.sessionId},
                ${body.teamId},
                ${body.memberId},
                ${body.userPictureUrl || null},
                ${body.assistantPictureUrl || null},
                ${body.assistantName || null}
            )
            ON CONFLICT (session_id) 
            DO UPDATE SET
                team_id = EXCLUDED.team_id,
                member_id = EXCLUDED.member_id,
                user_picture_url = EXCLUDED.user_picture_url,
                assistant_picture_url = EXCLUDED.assistant_picture_url,
                assistant_name = EXCLUDED.assistant_name,
                updated_at = CURRENT_TIMESTAMP;
        `;

        // Get the updated data
        const { rows: updatedData } = await client.sql`
            SELECT * FROM data WHERE session_id = ${body.sessionId};
        `;

        await client.end();

        return NextResponse.json({
            success: true,
            message: 'Data created/updated successfully',
            data: updatedData[0]
        });

    } catch (error) {
        console.error('Data creation error:', error);
        return NextResponse.json({
            error: 'Failed to create/update data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
