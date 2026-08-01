// app\api\auth\protected\route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
    try {
        const authorization = request.headers.get("authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    error: "Authentication failed",
                },
                {
                    status: 401,
                }
            );
        }

        const token = authorization.slice(7);

        const payload = await verifyAccessToken(token);

        return NextResponse.json({
            message: "Protected resource accessed",
            user: {
                id: payload.sub,
                role: payload.role,
            },
        });
    } catch {
        return NextResponse.json(
            {
                error: "Authentication failed",
            },
            {
                status: 401,
            }
        );
    }
}
