import { NextRequest, NextResponse } from "next/server";
import { createAccessToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
    try {
        const { expiresIn } = await request.json();

        const allowedExpiry = ["5s", "10s", "30s", "1m"];

        if (!allowedExpiry.includes(expiresIn)) {
            return NextResponse.json(
                { error: "Invalid lab configuration" },
                { status: 400 }
            );
        }

        const token = await createAccessToken("demo-user", "USER", expiresIn);

        return NextResponse.json({
            token,
            expiresIn,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}
