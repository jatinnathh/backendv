import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: NextRequest,
    { params }: Context
) {
    const { id } = await params;

    const trace: any[] = [];

    trace.push({
        step: "request_received",
        method: "GET",
    });

    trace.push({
        step: "path_parameter",
        name: "id",
        value: id,
    });

    const dbStart = Date.now();

    const user = await prisma.httpLabUser.findUnique({
        where: {
            id,
        },
    });

    trace.push({
        step: "database_query",
        operation: "HttpLabUser.findUnique",
        found: Boolean(user),
        durationMs: Date.now() - dbStart,
    });

    if (!user) {
        return NextResponse.json(
            {
                error: "User not found",
                trace,
            },
            {
                status: 404,
            }
        );
    }

    trace.push({
        step: "response_sent",
        status: 200,
    });

    return NextResponse.json({
        data: user,
        trace,
    });
}
export async function PATCH(
    request: NextRequest,
    { params }: Context
) {
    const { id } = await params;

    const trace: any[] = [];

    const body = await request.json();

    trace.push({
        step: "request_received",
        method: "PATCH",
    });

    trace.push({
        step: "path_parameter",
        name: "id",
        value: id,
    });

    trace.push({
        step: "body_parsed",
        body,
    });

    const existingUser =
        await prisma.httpLabUser.findUnique({
            where: {
                id,
            },
        });

    if (!existingUser) {
        trace.push({
            step: "resource_lookup",
            found: false,
        });

        return NextResponse.json(
            {
                error: "User not found",
                trace,
            },
            {
                status: 404,
            }
        );
    }

    trace.push({
        step: "resource_lookup",
        found: true,
    });

    const dbStart = Date.now();

    const user = await prisma.httpLabUser.update({
        where: {
            id,
        },

        data: {
            ...(body.name !== undefined && {
                name: body.name.trim(),
            }),

            ...(body.email !== undefined && {
                email: body.email.trim().toLowerCase(),
            }),
        },
    });

    trace.push({
        step: "database_update",
        operation: "HttpLabUser.update",
        strategy: "partial",
        durationMs: Date.now() - dbStart,
    });

    return NextResponse.json({
        message: "User updated",
        data: user,
        trace,
    });
}
export async function PUT(
    request: NextRequest,
    { params }: Context
) {
    const { id } = await params;

    const trace: any[] = [];

    const body = await request.json();

    trace.push({
        step: "request_received",
        method: "PUT",
    });

    if (!body.name || !body.email) {
        trace.push({
            step: "validation",
            success: false,
            reason: "PUT requires complete resource",
        });

        return NextResponse.json(
            {
                error: "PUT requires name and email",
                trace,
            },
            {
                status: 400,
            }
        );
    }

    const existingUser =
        await prisma.httpLabUser.findUnique({
            where: {
                id,
            },
        });

    if (!existingUser) {
        return NextResponse.json(
            {
                error: "User not found",
                trace,
            },
            {
                status: 404,
            }
        );
    }

    const dbStart = Date.now();

    const user = await prisma.httpLabUser.update({
        where: {
            id,
        },

        data: {
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
        },
    });

    trace.push({
        step: "database_update",
        operation: "HttpLabUser.update",
        strategy: "complete",
        durationMs: Date.now() - dbStart,
    });

    return NextResponse.json({
        message: "User replaced",
        data: user,
        trace,
    });
}
export async function DELETE(
    request: NextRequest,
    { params }: Context
) {
    const { id } = await params;

    const trace: any[] = [];

    trace.push({
        step: "request_received",
        method: "DELETE",
    });

    const existingUser =
        await prisma.httpLabUser.findUnique({
            where: {
                id,
            },
        });

    if (!existingUser) {
        trace.push({
            step: "resource_lookup",
            found: false,
        });

        return NextResponse.json(
            {
                error: "User not found",
                trace,
            },
            {
                status: 404,
            }
        );
    }

    const dbStart = Date.now();

    await prisma.httpLabUser.delete({
        where: {
            id,
        },
    });

    trace.push({
        step: "database_delete",
        operation: "HttpLabUser.delete",
        durationMs: Date.now() - dbStart,
    });

    trace.push({
        step: "response_sent",
        status: 200,
    });

    return NextResponse.json({
        message: "User deleted",
        deletedId: id,
        trace,
    });
}