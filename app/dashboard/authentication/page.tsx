"use client";

import { useState } from "react";
import JWTInspector from "@/components/auth/JWTInspector";
import TokenMismatchLab from "@/components/auth/TokenMismatchLab";
import AccessTokenExpiryLab from "@/components/auth/AccessTokenExpiryLab";
import ProtectedRouteLab from "@/components/auth/ProtectedRouteLab";
import TimingAttackLab from "@/components/auth/TimingAttackLab";
import AuthenticationNotes from "@/components/auth/AuthenticationNotes";

type StepStatus = "idle" | "active" | "success" | "error";

interface Step {
    name: string;
    description: string;
    status: StepStatus;
    details?: any;
}

export default function authentication() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const [steps, setSteps] = useState<Step[]>([
        {
            name: "HTTP Request",
            description: "POST /api/auth/register",
            status: "idle",
        },
        {
            name: "Input Validation",
            description: "Validate name, email and password",
            status: "idle",
        },
        {
            name: "Normalize Email",
            description: "Trim and convert email to lowercase",
            status: "idle",
        },
        {
            name: "Database Lookup",
            description: "Check whether the user already exists",
            status: "idle",
        },
        {
            name: "Password Hashing",
            description: "Hash the password before storing it",
            status: "idle",
        },
        {
            name: "Database Insert",
            description: "Create the user with Prisma",
            status: "idle",
        },
        {
            name: "Token Generation",
            description: "Sign a JWT with the user's ID",
            status: "idle",
        },
        {
            name: "HTTP Response",
            description: "Return 201 Created",
            status: "idle",
        },
    ]);

    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

    function resetSteps() {
        setSteps((current) =>
            current.map((step) => ({
                ...step,
                status: "idle",
            }))
        );
    }

    function updateStep(index: number, status: StepStatus, details?: any) {
        setSteps((current) =>
            current.map((step, i) =>
                i === index ? { ...step, status, details: details || step.details } : step
            )
        );
    }

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function register() {
        resetSteps();
        setResponse(null);
        setLoading(true);

        try {
            // Visual step 1: HTTP Request
            updateStep(0, "active");
            await sleep(500);
            updateStep(0, "success", {
                url: "/api/auth/register",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: { name, email, password: password ? "********" : "" }
            });

            // Visual step 2: Input Validation
            updateStep(1, "active");
            await sleep(500);

            if (!name || !email || !password || password.length < 8) {
                updateStep(1, "error", {
                    rules: {
                        name: "Required",
                        email: "Required",
                        password: "Minimum 8 characters"
                    },
                    result: "Failed validation"
                });
                setResponse({
                    status: 400,
                    body: {
                        error: "name, email and password are required",
                    },
                });
                return;
            }

            updateStep(1, "success", {
                rules: {
                    name: "Required",
                    email: "Required",
                    password: "Minimum 8 characters"
                },
                result: "Passed validation"
            });

            // Visual step 3: Normalize Email
            updateStep(2, "active");
            await sleep(500);
            updateStep(2, "success", {
                input: `"${email}"`,
                normalized: `"${email.trim().toLowerCase()}"`
            });

            // The remaining backend operations happen inside this request.
            updateStep(3, "active");

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                updateStep(3, "error", {
                    query: `prisma.user.findUnique({ where: { email: "${email.trim().toLowerCase()}" } })`,
                    result: "User already exists"
                });
                setResponse({
                    status: res.status,
                    body: data,
                });
                return;
            }

            updateStep(3, "success", {
                query: `prisma.user.findUnique({ where: { email: "${email.trim().toLowerCase()}" } })`,
                result: "User not found (Available)"
            });

            // Visual step 4: Password Hashing
            updateStep(4, "active");
            await sleep(500);
            updateStep(4, "success", {
                algorithm: "bcrypt",
                costFactor: 10,
                plaintext: "********",
                hashed: "$2b$10$xyz123mockHashedPassword..."
            });

            // Visual step 5: Database Insert
            updateStep(5, "active");
            await sleep(500);
            updateStep(5, "success", {
                query: `prisma.user.create({
  data: {
    name: "${name.trim()}",
    email: "${email.trim().toLowerCase()}",
    passwordHash: "$2b$10$xyz123..."
  }
})`,
                result: { id: data.user?.id || "usr_123", email: email.trim().toLowerCase() }
            });

            // Visual step 6: Token Generation
            updateStep(6, "active");
            await sleep(500);
            
            // Generate a mock JWT for visualization
            const mockHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const mockPayload = btoa(JSON.stringify({ sub: data.user?.id || "usr_123", iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 3600 }));
            const mockSignature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
            const mockToken = `${mockHeader}.${mockPayload}.${mockSignature}`;
            
            updateStep(6, "success", {
                action: "Sign JWT",
                payload: { sub: data.user?.id || "usr_123", exp: "+1h" },
                token: mockToken
            });

            // Visual step 7: HTTP Response
            updateStep(7, "active");
            await sleep(400);
            updateStep(7, "success", {
                status: 201,
                body: data
            });

            setResponse({
                status: res.status,
                body: data,
            });
        } catch (error) {
            setResponse({
                status: 500,
                body: {
                    error: "Request failed",
                },
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">

            {/* Header */}

            <div className="mb-8">
                <div className="text-sm text-zinc-500 mb-2">
                    Backend Visualizer / Authentication
                </div>

                <h1 className="text-3xl font-semibold">
                    Authentication Lab
                </h1>

                <p className="text-zinc-400 mt-2">
                    See what happens inside the backend when a user registers.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* LEFT SIDE */}

                <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                    <div className="mb-6">
                        <h2 className="text-xl font-medium">
                            Register User
                        </h2>

                        <p className="text-sm text-zinc-500">
                            POST /api/auth/register
                        </p>
                    </div>

                    <div className="space-y-4">

                        <div>
                            <label className="text-sm text-zinc-400">
                                Name
                            </label>

                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 outline-none focus:border-zinc-600"
                                placeholder="Jatin Nath"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-zinc-400">
                                Email
                            </label>

                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 outline-none focus:border-zinc-600"
                                placeholder="jatin@example.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-zinc-400">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 outline-none focus:border-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            onClick={register}
                            disabled={loading}
                            className="w-full bg-white text-black rounded-lg p-3 font-medium disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Create Account"}
                        </button>

                    </div>

                    {/* Request body */}

                    <div className="mt-8">
                        <div className="text-sm text-zinc-500 mb-2">
                            REQUEST BODY
                        </div>

                        <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-sm overflow-auto">
                            {JSON.stringify(
                                {
                                    name,
                                    email,
                                    password: password ? "••••••••" : "",
                                },
                                null,
                                2
                            )}
                        </pre>
                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                    <h2 className="text-xl font-medium">
                        Backend Execution
                    </h2>

                    <p className="text-zinc-500 text-sm mb-6">
                        Follow the request through your backend.
                    </p>

                    <div>
                        {steps.map((step, index) => (
                            <div key={step.name}>
                                <div
                                    onClick={() => setSelectedStepIndex(selectedStepIndex === index ? null : index)}
                                    className={`
                    border rounded-lg p-4 transition-all duration-300 cursor-pointer hover:border-zinc-500
                    ${step.status === "idle"
                                            ? "border-zinc-800"
                                            : ""
                                        }

                    ${step.status === "active"
                                            ? "border-yellow-500 bg-yellow-500/5"
                                            : ""
                                        }

                    ${step.status === "success"
                                            ? "border-green-500 bg-green-500/5"
                                            : ""
                                        }

                    ${step.status === "error"
                                            ? "border-red-500 bg-red-500/5"
                                            : ""
                                        }
                  `}
                                >
                                    <div className="flex justify-between">

                                        <div>
                                            <div className="font-medium">
                                                {step.name}
                                            </div>

                                            <div className="text-sm text-zinc-500 mt-1">
                                                {step.description}
                                            </div>
                                        </div>

                                        <div>
                                            {step.status === "idle" && "○"}
                                            {step.status === "active" && "●"}
                                            {step.status === "success" && "✓"}
                                            {step.status === "error" && "✕"}
                                        </div>

                                    </div>
                                    
                                    {/* Expandable Details Section */}
                                    {selectedStepIndex === index && step.details && (
                                        <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                            <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Internal State</div>
                                            <pre className="bg-black/50 border border-zinc-800/50 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto">
                                                {JSON.stringify(step.details, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="h-6 border-l border-zinc-700 ml-6" />
                                )}

                            </div>
                        ))}
                    </div>

                </div>

            </div>

            {/* RESPONSE */}

            <div className="mt-6 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                <div className="flex justify-between mb-4">

                    <h2 className="text-xl font-medium">
                        Server Response
                    </h2>

                    {response && (
                        <span className="font-mono text-sm">
                            HTTP {response.status}
                        </span>
                    )}

                </div>

                <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-sm overflow-auto min-h-32">
                    {response
                        ? JSON.stringify(response.body, null, 2)
                        : "// Send a request to see the response"}
                </pre>

            </div>

            <div className="mt-10 space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Interactive Labs
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                        Break Authentication
                    </h2>

                    <p className="mt-2 text-zinc-400">
                        Modify tokens, expiration times and credentials to see
                        how the backend reacts.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <JWTInspector />
                    <TokenMismatchLab />
                </div>

                <AccessTokenExpiryLab />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ProtectedRouteLab />
                    <TimingAttackLab />
                </div>

                <AuthenticationNotes />
            </div>

        </div>
    );
}