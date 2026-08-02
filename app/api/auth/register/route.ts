// app\api\auth\register\route.ts

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { users } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
    const trace: any[] = [];
    trace.push({ step: "validation", status: "active" });

    try {
        const body = await request.json();

        const { name, email, password } = body;
        
        if (!name || !email || !password) {
            trace.push({ step: "validation", success: false, result: "Missing fields" });
            return NextResponse.json(
                {
                    error: "name , email and password are required",
                }, {
                status: 400,
            }
            );
        }
        if (password.length < 8) {
            trace.push({ step: "validation", success: false, result: "Password too short" });
            return NextResponse.json(
                {
                    error: 'password len must be more than 8 '
                }, {
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
        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        const dbLookupEnd = Date.now();

        if (existingUser) {
            trace.push({ 
                step: "database_lookup", 
                operation: "User.findUnique", 
                found: true, 
                durationMs: dbLookupEnd - dbLookupStart 
            });
            return NextResponse.json({
                error: 'user already exits',
            }, {
                status: 409,
            }
            );
        }

        trace.push({ 
            step: "database_lookup", 
            operation: "User.findUnique", 
            found: false, 
            durationMs: dbLookupEnd - dbLookupStart 
        });

        trace.push({ step: "password_hash", status: "active" });
        const hashStart = Date.now();
        const passwordHash = await hashPassword(password);
        const hashEnd = Date.now();
        trace.push({ 
            step: "password_hash", 
            algorithm: "bcrypt", 
            cost: 12, 
            durationMs: hashEnd - hashStart 
        });

        trace.push({ step: "database_insert", status: "active" });
        const insertStart = Date.now();

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                passwordHash,
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        const insertEnd = Date.now();
        trace.push({ 
            step: "database_insert", 
            operation: "User.create", 
            success: true,
            durationMs: insertEnd - insertStart
        });

        return NextResponse.json(
            {
                message: "User created successfully",
                user,
                trace,
            }, {
            status: 201,
        }
        );
    } catch (error) {
        console.error("register error ", error);

        return NextResponse.json(
            {
                error:
                    "internal server error",
                trace
            },
            {
                status: 500,
            }
        );
    }


}
