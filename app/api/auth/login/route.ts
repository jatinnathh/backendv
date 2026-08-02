// app\api\auth\login\route.ts

import { NextRequest, NextResponse } from "next/server";

import { users } from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";

import {
    verifyPassword,
    hashPassword,
} from "@/lib/auth/password";

import {
    createAccessToken,
    createRefreshToken,
} from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
    const trace: any[] = [];
    trace.push({ step: "validation", status: "active" });

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            trace.push({ step: "validation", success: false, result: "Missing fields" });
            return NextResponse.json(
                {
                    error: "Email and password are required",
                },
                {
                    status: 400,
                }
            );
        }

        trace.push({ step: "validation", success: true });
        
        trace.push({ step: "normalize_email", status: "active" });
        const normalizedEmail = email.trim().toLowerCase();
        trace.push({ step: "normalize_email", before: email, after: normalizedEmail });

        trace.push({ step: "database_lookup", status: "active" });
        const dbLookupStart = Date.now();
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        const dbLookupEnd = Date.now();

        if (!user) {
            trace.push({ step: "database_lookup", operation: "User.findUnique", found: false, durationMs: dbLookupEnd - dbLookupStart });
            return NextResponse.json(
                {
                    error: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }
        
        trace.push({ step: "database_lookup", operation: "User.findUnique", found: true, durationMs: dbLookupEnd - dbLookupStart });

        trace.push({ step: "password_verification", status: "active" });
        const passVerifyStart = Date.now();
        const passwordValid = await verifyPassword(password, user.passwordHash);
        const passVerifyEnd = Date.now();

        if (!passwordValid) {
            trace.push({ step: "password_verification", algorithm: "bcrypt", matched: false, durationMs: passVerifyEnd - passVerifyStart });
            return NextResponse.json(
                {
                    error: "Invalid email or password",
                    trace,
                },
                {
                    status: 401,
                }
            );
        }

        trace.push({ step: "password_verification", algorithm: "bcrypt", matched: true, durationMs: passVerifyEnd - passVerifyStart });

        trace.push({ step: "access_token_generation", status: "active" });
        const accessToken = await createAccessToken(user.id, user.role);
        trace.push({ step: "access_token_generation", expiresIn: "15m", payload: { sub: user.id, role: user.role, type: "access" } });

        trace.push({ step: "refresh_token_generation", status: "active" });
        const refreshToken = await createRefreshToken(user.id);
        trace.push({ step: "refresh_token_generation", expiresIn: "7d" });

        trace.push({ step: "session_insert", status: "active" });
        const sessionInsertStart = Date.now();

        const refreshTokenHash =
            await hashPassword(refreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(
            expiresAt.getDate() + 7
        );

        await prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash,
                expiresAt,
            },
        });
        const sessionInsertEnd = Date.now();
        trace.push({ step: "session_insert", operation: "Session.create", success: true, durationMs: sessionInsertEnd - sessionInsertStart });

        trace.push({ step: "set_cookie", status: "active" });
        trace.push({ step: "set_cookie", attributes: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 604800 } });

        const response = NextResponse.json({
            message: "Login successful",
            trace,
            accessToken,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        response.cookies.set({
            name: "refreshToken",
            value: refreshToken,

            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite: "strict",

            maxAge: 60 * 60 * 24 * 7,

            path: "/",
        });

        return response;

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
                trace
            },
            {
                status: 500,
            }
        );
    }
}