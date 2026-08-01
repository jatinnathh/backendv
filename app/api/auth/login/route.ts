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
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                {
                    error: "Email and password are required",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }
        const passwordValid = await verifyPassword(password, user.passwordHash);

        if (!passwordValid) {
            return NextResponse.json(
                {
                    error: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }


        const accessToken = await createAccessToken(user.id, user.role);

        const refreshToken = await createRefreshToken(user.id);

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
        const response = NextResponse.json({
            message: "Login successful",

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
            },
            {
                status: 500,
            }
        );
    }
}