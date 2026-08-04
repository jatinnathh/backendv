import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
    const email = "timing-demo@backendvisualizer.dev";
    const password = "timing-demo-password";
    
    const hash = await hashPassword(password);
    
    await prisma.user.upsert({
        where: { email },
        update: { passwordHash: hash },
        create: {
            email,
            name: "Demo User",
            passwordHash: hash,
            role: "USER"
        }
    });

    const dummyHash = await hashPassword("dummy_password");

    return NextResponse.json({ message: "Seeded", dummyHash });
}
