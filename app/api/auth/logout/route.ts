import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/auth/jwt";

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

        trace.push({ step: "delete_session", status: "active" });
        try {
            await prisma.session.delete({
                where: {
                    id: payload.sid as string
                }
            });
            trace.push({ step: "delete_session", success: true });
        } catch (error) {
            trace.push({ step: "delete_session", success: false, result: "Session not found or already deleted" });
        }

        trace.push({ step: "clear_cookie", status: "active" });
        const response = NextResponse.json({
            message: "Logged out successfully",
            trace
        }, { status: 200 });

        response.cookies.delete("refreshToken");
        trace.push({ step: "clear_cookie", success: true });

        return response;

    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Internal server error", trace }, { status: 500 });
    }
}
