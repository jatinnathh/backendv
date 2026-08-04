import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const start = Date.now();
    const id = request.nextUrl.searchParams.get('id');

    const trace: any[] = [
        {
            step: 'request received',
            type: 'REAL',
            methos: 'GET',
        },
    ];

    if (id) {
        const item = await prisma.httpLabItem.findUnique({
            where: { id },
        });
        trace.push({
            step: 'Database_query',
            type: "REAL",
            tool: 'prisma',
            operation: 'httpLabItem.findUnique()',
            found: Boolean(item),
        });

        if (!item) {
            return NextResponse.json(
                {
                    error: 'item not found',
                    trace,
                }, {
                status: 404,
            }
            );
        }

        return NextResponse.json(
            {
                method: "GET",
                action: 'READ_ONE',
                data: item,
                durationMs: Date.now() - start,
                trace,
            }
        );
    }

    const items = prisma.httpLabItem.findMany({
        orderBy: {
            createdAt: 'desc'
        },
    });

    trace.push({
        step: "database_query",
        type: 'REAL',
        tool: 'prisma',
        operation: 'prisma.httpLabItem.findMany()',
        rows: items.length,

    });

    return NextResponse.json({
        method: "GET",
        action: 'READ_ALL',
        data: items,
        durationMs: Date.now() - start,
        trace,
    });


}

export async function POST(request: NextRequest) {
    const trace: any[] = [
        {
            step: 'request_received',
            type: 'REAL',
            method: 'POST',
        },
    ];
    try {
        const body = await request.json()
        if (!body.name) {
            
        }
    }const {

    }
}

