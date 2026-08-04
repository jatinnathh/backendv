import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

const DUMMY_HASH = "$2b$12$GCRGqNKKjJMGPpC.eZ3eC.5dd.zuMQ.LBgIW9fjq.qYrGXFvrUciO";

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

        // Ensure the lab demo user exists in the actual database
        if (!user && email === "timing-demo@backendvisualizer.dev") {
            user = await prisma.user.create({
                data: {
                    email: "timing-demo@backendvisualizer.dev",
                    passwordHash: DUMMY_HASH,
                    name: "Demo User",
                    role: "USER"
                }
            });
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
