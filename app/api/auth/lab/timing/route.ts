import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const DUMMY_HASH = "$2b$12$QHh9TqZl1h5P5jO9W1Jd4e0e5j8c9m0v2a5b6c7d8e9f0a1b2c3d4";

export async function POST(request: NextRequest) {
    try {
        const { email, protectionOn, password = "wrongpassword" } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const start = Date.now();

        // Step 1: Database Lookup
        const dbLookupStart = Date.now();
        let user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() }
        });

        // Use a dynamic dummy user for the lab existing user if it's not in the DB
        if (!user && email === "existing@example.com") {
            user = {
                id: "dummy-id",
                email: "existing@example.com",
                passwordHash: DUMMY_HASH,
                name: "Demo User",
                role: "USER",
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        const dbLookupDuration = Date.now() - dbLookupStart;

        // Step 2: Password Verification
        const hashStart = Date.now();
        let hashDuration = 0;

        if (user) {
            await verifyPassword(password, user.passwordHash);
            hashDuration = Date.now() - hashStart;
        } else if (protectionOn) {
            // Protection ON: Dummy verify
            await verifyPassword(password, DUMMY_HASH);
            hashDuration = Date.now() - hashStart;
        } else {
            // Protection OFF: Early return, no hash computation
            hashDuration = 0;
        }

        const totalDuration = Date.now() - start;

        return NextResponse.json({
            email,
            exists: !!user,
            dbLookupDuration,
            hashDuration,
            totalDuration,
            protectionOn
        });

    } catch (error) {
        console.error("Timing lab error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
