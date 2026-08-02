import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, createAccessToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
    const trace: any[] = [];
    
    try {
        trace.push({ step: "read_cookie", status: "active" });
        const refreshTokenCookie = request.cookies.get("refreshToken");
        
        if (!refreshTokenCookie) {
            trace.push({ step: "read_cookie", success: false, result: "Missing refresh cookie" });
            return NextResponse.json({ error: "No refresh token provided", trace }, { status: 401 });
        }
        
        const refreshToken = refreshTokenCookie.value;
        trace.push({ step: "read_cookie", success: true, result: "Found refreshToken" });

        trace.push({ step: "verify_jwt", status: "active" });
        let payload;
        try {
            payload = await verifyRefreshToken(refreshToken);
        } catch (error) {
            trace.push({ step: "verify_jwt", success: false, result: "Invalid or expired JWT" });
            return NextResponse.json({ error: "Invalid refresh token", trace }, { status: 401 });
        }
        trace.push({ step: "verify_jwt", success: true, payload });

        trace.push({ step: "find_session", status: "active" });
        const session = await prisma.session.findFirst({
            where: {
                userId: payload.sub
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!session) {
            trace.push({ step: "find_session", success: false, result: "No session found" });
            return NextResponse.json({ error: "Session not found", trace }, { status: 401 });
        }
        trace.push({ step: "find_session", success: true, sessionId: session.id });

        trace.push({ step: "verify_hash", status: "active" });
        const isValid = await verifyPassword(refreshToken, session.refreshTokenHash);
        
        if (!isValid) {
            trace.push({ step: "verify_hash", success: false, result: "Token hash mismatch" });
            return NextResponse.json({ error: "Invalid refresh token", trace }, { status: 401 });
        }
        trace.push({ step: "verify_hash", success: true, result: "Hash matched" });

        trace.push({ step: "generate_access_token", status: "active" });
        const user = await prisma.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user) {
            trace.push({ step: "generate_access_token", success: false, result: "User not found" });
            return NextResponse.json({ error: "User not found", trace }, { status: 401 });
        }

        const accessToken = await createAccessToken(user.id, user.role);
        trace.push({ step: "generate_access_token", success: true, expiresIn: "15m" });

        return NextResponse.json({
            message: "Token refreshed successfully",
            accessToken,
            trace
        }, { status: 200 });

    } catch (error) {
        console.error("Refresh token error:", error);
        return NextResponse.json({ error: "Internal server error", trace }, { status: 500 });
    }
}
