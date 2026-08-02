import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const trace: any[] = [];

    const requestStart = Date.now();

    trace.push({
        step: "request_received",
        method: "GET",
        path: "/api/http-lab/users",
    });

    trace.push({
        step: "route_matched",
        handler: "GET /api/http-lab/users",
    });

    trace.push({
        step: "database_query",
        status: "active",
        operation: "HttpLabUser.findMany",
    });

    const dbStart = Date.now();

    const users = await prisma.httpLabUser.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    const dbDuration = Date.now() - dbStart;

    trace.push({
        step: "database_query",
        operation: "HttpLabUser.findMany",
        success: true,
        rowsReturned: users.length,
        durationMs: dbDuration,
    });

    trace.push({
        step: "serialization",
        format: "JSON",
    });

    trace.push({
        step: "response_sent",
        status: 200,
    });

    return NextResponse.json({
        data: users,

        meta: {
            count: users.length,
            durationMs: Date.now() - requestStart,
        },

        trace,
    });
}

export async function POST(request: NextRequest) {
    const trace: any[] = [];

    const requestStart = Date.now();

    try {
        trace.push({
            step: "request_received",
            method: "POST",
            path: "/api/http-lab/users",
        });

        const contentType =
            request.headers.get("content-type");

        trace.push({
            step: "headers_parsed",
            contentType,
        });

        const body = await request.json();

        trace.push({
            step: "body_parsed",
            body,
        });

        if (!body.name || !body.email) {
            trace.push({
                step: "validation",
                success: false,
                reason: "name and email are required",
            });

            return NextResponse.json(
                {
                    error: "name and email are required",
                    trace,
                },
                {
                    status: 400,
                }
            );
        }

        trace.push({
            step: "validation",
            success: true,
        });

        const normalizedEmail =
            body.email.trim().toLowerCase();

        trace.push({
            step: "database_query",
            status: "active",
            operation: "HttpLabUser.create",
        });

        const dbStart = Date.now();

        const user = await prisma.httpLabUser.create({
            data: {
                name: body.name.trim(),
                email: normalizedEmail,
            },
        });

        const dbDuration = Date.now() - dbStart;

        trace.push({
            step: "database_query",
            operation: "HttpLabUser.create",
            success: true,
            durationMs: dbDuration,
        });

        trace.push({
            step: "response_sent",
            status: 201,
        });

        return NextResponse.json(
            {
                message: "User created",
                data: user,
                trace,

                meta: {
                    durationMs: Date.now() - requestStart,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("HTTP LAB POST ERROR:", error);

        trace.push({
            step: "error",
            message: "Request failed",
        });

        return NextResponse.json(
            {
                error: "Request failed",
                trace,
            },
            {
                status: 500,
            }
        );
    }
}