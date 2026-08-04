import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const entries =
        Object.fromEntries(params.entries());

    return NextResponse.json({
        path: request.nextUrl.pathname,

        query: entries,

        examples: {
            search: params.get("search"),
            page: params.get("page"),
            limit: params.get("limit"),
        },

        trace: [
            {
                step: "request_received",
                type: "REAL",
            },
            {
                step: "query_string_parsed",
                type: "REAL",
                count: params.size,
            },
        ],
    });
}