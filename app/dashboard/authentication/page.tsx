"use client";

import { useState, useEffect } from "react";
import JWTInspector from "@/components/auth/JWTInspector";
import TokenMismatchLab from "@/components/auth/TokenMismatchLab";
import AccessTokenExpiryLab from "@/components/auth/AccessTokenExpiryLab";
import ProtectedRouteLab from "@/components/auth/ProtectedRouteLab";
import TimingAttackLab from "@/components/auth/TimingAttackLab";
import AuthenticationNotes from "@/components/auth/AuthenticationNotes";

type StepStatus = "idle" | "active" | "success" | "error";

interface Step {
    id: string;
    name: string;
    description: string;
    status: StepStatus;
    details?: any;
}

const REGISTER_STEPS: Step[] = [
    { id: "http_request", name: "HTTP Request", description: "POST /api/auth/register", status: "idle" },
    { id: "validation", name: "Input Validation", description: "Validate name, email and password", status: "idle" },
    { id: "normalize_email", name: "Normalize Email", description: "Trim and convert email to lowercase", status: "idle" },
    { id: "database_lookup", name: "REAL · Prisma", description: "Check whether the user already exists", status: "idle" },
    { id: "password_hash", name: "REAL · bcrypt", description: "Hash the password before storing it", status: "idle" },
    { id: "database_insert", name: "REAL · Prisma", description: "Create the user with Prisma", status: "idle" },
    { id: "http_response", name: "HTTP Response", description: "Return 201 Created", status: "idle" },
];

const LOGIN_STEPS: Step[] = [
    { id: "http_request", name: "HTTP Request", description: "POST /api/auth/login", status: "idle" },
    { id: "validation", name: "Input Validation", description: "Validate email and password", status: "idle" },
    { id: "normalize_email", name: "Normalize Email", description: "Trim and convert email to lowercase", status: "idle" },
    { id: "database_lookup", name: "REAL · Prisma", description: "Find user by email", status: "idle" },
    { id: "password_verification", name: "REAL · bcrypt", description: "Verify hashed password", status: "idle" },
    { id: "access_token_generation", name: "REAL · jose", description: "Create JWT access token", status: "idle" },
    { id: "refresh_token_generation", name: "REAL · jose", description: "Create refresh token", status: "idle" },
    { id: "session_insert", name: "REAL · Prisma", description: "Store session in database", status: "idle" },
    { id: "set_cookie", name: "Set-Cookie", description: "Set HttpOnly refresh cookie", status: "idle" },
    { id: "http_response", name: "HTTP Response", description: "Return 200 OK", status: "idle" },
];

const REFRESH_STEPS: Step[] = [
    { id: "read_cookie", name: "Read Cookie", description: "Extract refreshToken from HttpOnly cookie", status: "idle" },
    { id: "verify_jwt", name: "REAL · jose", description: "Validate signature and expiration", status: "idle" },
    { id: "find_session", name: "REAL · Prisma", description: "Look up session in database", status: "idle" },
    { id: "verify_hash", name: "REAL · bcrypt", description: "Compare refreshToken with stored hash", status: "idle" },
    { id: "generate_access_token", name: "REAL · jose", description: "Mint new access token", status: "idle" },
    { id: "http_response", name: "HTTP Response", description: "Return 200 OK", status: "idle" },
];

const LOGOUT_STEPS: Step[] = [
    { id: "read_cookie", name: "Read Cookie", description: "Extract refreshToken from HttpOnly cookie", status: "idle" },
    { id: "verify_jwt", name: "REAL · jose", description: "Validate signature and expiration", status: "idle" },
    { id: "delete_session", name: "REAL · Prisma", description: "Delete session from database", status: "idle" },
    { id: "clear_cookie", name: "Clear-Cookie", description: "Clear HttpOnly refresh cookie", status: "idle" },
    { id: "http_response", name: "HTTP Response", description: "Return 200 OK", status: "idle" },
];

export default function authentication() {
    const [activeTab, setActiveTab] = useState<"register" | "login" | "jwt" | "protected" | "refresh">("register");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const [steps, setSteps] = useState<Step[]>(REGISTER_STEPS);
    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

    // Refresh Flow State
    const [refreshFlowState, setRefreshFlowState] = useState(0); 
    const [accessToken, setAccessToken] = useState("");
    const [protectedResponse, setProtectedResponse] = useState<any>(null);

    useEffect(() => {
        if (activeTab === "register") setSteps(REGISTER_STEPS);
        else if (activeTab === "login") setSteps(LOGIN_STEPS);
        else setSteps(REFRESH_STEPS);
        
        setResponse(null);
        setSelectedStepIndex(null);
        setRefreshFlowState(0);
        setProtectedResponse(null);
    }, [activeTab]);

    function resetSteps() {
        setSteps((current) =>
            current.map((step) => ({
                ...step,
                status: "idle",
                details: undefined
            }))
        );
    }

    function updateStep(id: string, status: StepStatus, details?: any) {
        setSteps((current) =>
            current.map((step) =>
                step.id === id ? { ...step, status, details: details || step.details } : step
            )
        );
    }

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function processTrace(trace: any[], responseData: any, responseStatus: number, successCode: number) {
        for (const t of trace) {
            updateStep(t.step, "active");
            await sleep(300);
            
            // Determine status based on step metadata
            let status: StepStatus = "success";
            if (t.success === false || t.found === false || t.matched === false) {
                if (t.step === "database_lookup" && activeTab === "register") {
                    status = "success"; // In register, not found is success
                } else if (t.step === "database_lookup" && activeTab === "login") {
                    status = "error";
                } else {
                    status = "error";
                }
            } else if (t.found === true && activeTab === "register") {
                 status = "error"; // In register, finding user is an error
            }

            // Exclude the 'step' property from details to keep it clean
            const { step: _, ...details } = t;
            updateStep(t.step, status, details);
            
            if (status === "error") {
                break; // Stop animating on error
            }
        }

        // Final HTTP Response step
        updateStep("http_response", "active");
        await sleep(300);
        updateStep("http_response", responseStatus === successCode ? "success" : "error", {
            status: responseStatus,
            body: responseData
        });
    }

    async function handleAuth() {
        resetSteps();
        setResponse(null);
        setLoading(true);

        const endpoint = activeTab === "register" ? "/api/auth/register" : "/api/auth/login";
        const successCode = activeTab === "register" ? 201 : 200;
        const body = activeTab === "register" 
            ? { name, email, password }
            : { email, password };
            
        const displayBody = activeTab === "register" 
            ? { name, email, password: password ? "••••••••" : "" }
            : { email, password: password ? "••••••••" : "" };

        try {
            // Visual step 1: HTTP Request
            updateStep("http_request", "active");
            await sleep(500);
            updateStep("http_request", "success", {
                url: endpoint,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: displayBody
            });

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            
            if (data.trace && Array.isArray(data.trace)) {
                 await processTrace(data.trace, data, res.status, successCode);
                 // Remove trace from final response block display so it isn't cluttered
                 const { trace, ...displayData } = data;
                 setResponse({
                     status: res.status,
                     body: displayData,
                 });
            } else {
                 setResponse({
                     status: res.status,
                     body: data,
                 });
            }

        } catch (error) {
            setResponse({
                status: 500,
                body: {
                    error: "Request failed",
                },
            });
            updateStep("http_response", "error", { error: "Request failed" });
        } finally {
            setLoading(false);
        }
    }

    async function handleRefreshFlowLogin() {
        setSteps(LOGIN_STEPS);
        resetSteps();
        setLoading(true);
        try {
            updateStep("http_request", "active");
            await sleep(500);
            updateStep("http_request", "success", { url: "/api/auth/login", method: "POST" });
            
            const creds = { email: email || "refresh@example.com", password: password || "password123" };
            
            let res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(creds)
            });
            
            // If user doesn't exist, auto-register them seamlessly for the lab
            if (res.status === 401) {
                await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: "Refresh Demo", ...creds })
                });
                // Try login again
                res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(creds)
                });
            }

            const data = await res.json();
            if (data.trace) await processTrace(data.trace, data, res.status, 200);
            if (res.ok) {
                setAccessToken(data.accessToken);
                setRefreshFlowState(1);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleRefreshFlowProtected(expectedStatus: number, nextState: number) {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/protected", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setProtectedResponse({ status: res.status, data });
            if (res.status === expectedStatus) {
                setRefreshFlowState(nextState);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleRefreshFlowExpire() {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/lab/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expiresIn: "expired" })
            });
            const data = await res.json();
            setAccessToken(data.token);
            setRefreshFlowState(3);
            setProtectedResponse(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleRefreshFlowRefresh() {
        setSteps(REFRESH_STEPS);
        resetSteps();
        setLoading(true);
        try {
            updateStep("http_request", "active"); // Let's just rely on trace
            const res = await fetch("/api/auth/refresh", {
                method: "POST"
            });
            const data = await res.json();
            if (data.trace) await processTrace(data.trace, data, res.status, 200);
            if (res.ok) {
                setAccessToken(data.accessToken);
                setRefreshFlowState(5);
                setProtectedResponse(null);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleRefreshFlowLogout() {
        setSteps(LOGOUT_STEPS);
        resetSteps();
        setLoading(true);
        try {
            updateStep("http_request", "active"); // Let's just rely on trace
            const res = await fetch("/api/auth/logout", {
                method: "POST"
            });
            const data = await res.json();
            if (data.trace) await processTrace(data.trace, data, res.status, 200);
            if (res.ok) {
                setAccessToken("");
                setRefreshFlowState(6);
                setProtectedResponse(null);
            }
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
                    See what happens inside the backend when a user interacts with authentication.
                </p>
            </div>
            
            {/* Tabs */}
            <div className="mb-8 border-b border-zinc-800">
                <div className="flex gap-6">
                    {(["register", "login", "jwt", "protected", "refresh"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-medium transition-colors relative capitalize ${
                                activeTab === tab 
                                    ? "text-white" 
                                    : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "jwt" ? (
                <div className="mt-8">
                    <JWTInspector />
                </div>
            ) : activeTab === "protected" ? (
                <div className="mt-8">
                    <ProtectedRouteLab />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* LEFT SIDE */}

                <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                    <div className="mb-6">
                        <h2 className="text-xl font-medium">
                            {activeTab === "register" ? "Register User" : "Login User"}
                        </h2>

                        <p className="text-sm text-zinc-500">
                            POST /api/auth/{activeTab}
                        </p>
                    </div>

                    {activeTab !== "refresh" ? (
                        <div className="space-y-4">
                            
                            {activeTab === "register" && (
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
                            )}

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
                                onClick={handleAuth}
                                disabled={loading}
                                className="w-full bg-white text-black rounded-lg p-3 font-medium disabled:opacity-50"
                            >
                                {loading ? "Processing..." : (activeTab === "register" ? "Create Account" : "Login")}
                            </button>

                            <div className="mt-8">
                                <div className="text-sm text-zinc-500 mb-2">
                                    REQUEST BODY
                                </div>
                                <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-sm overflow-auto">
                                    {JSON.stringify(
                                        activeTab === "register" ? {
                                            name,
                                            email,
                                            password: password ? "••••••••" : "",
                                        } : {
                                            email,
                                            password: password ? "••••••••" : "",
                                        },
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-zinc-400 mb-6">
                                Experience the complete lifecycle of a refresh token. Follow the steps below in order.
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-black/50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs">1</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Login</div>
                                        <div className="text-xs text-zinc-500">Get Access Token & Refresh Cookie</div>
                                    </div>
                                    <button onClick={handleRefreshFlowLogin} disabled={loading || refreshFlowState > 0} className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg disabled:opacity-30">
                                        {refreshFlowState > 0 ? "Done ✓" : "Run"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-black/50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs">2</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Call Protected API</div>
                                        <div className="text-xs text-zinc-500">Test the valid Access Token</div>
                                    </div>
                                    <button onClick={() => handleRefreshFlowProtected(200, 2)} disabled={loading || refreshFlowState !== 1} className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg disabled:opacity-30">
                                        {refreshFlowState > 1 ? "Done ✓" : "Run"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-black/50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs">3</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Issue an already-expired access token</div>
                                        <div className="text-xs text-zinc-500">LAB INPUT · Fast-forward expiration</div>
                                    </div>
                                    <button onClick={handleRefreshFlowExpire} disabled={loading || refreshFlowState !== 2} className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg disabled:opacity-30">
                                        {refreshFlowState > 2 ? "Done ✓" : "Run"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-black/50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs">4</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Call Protected API</div>
                                        <div className="text-xs text-zinc-500">Should fail with 401</div>
                                    </div>
                                    <button onClick={() => handleRefreshFlowProtected(401, 4)} disabled={loading || refreshFlowState !== 3} className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg disabled:opacity-30">
                                        {refreshFlowState > 3 ? "Done ✓" : "Run"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-black/50 border-purple-500/30 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-medium text-xs">5</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-purple-400">Refresh Token</div>
                                        <div className="text-xs text-zinc-500">POST /api/auth/refresh</div>
                                    </div>
                                    <button onClick={handleRefreshFlowRefresh} disabled={loading || refreshFlowState !== 4} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg disabled:opacity-30 transition-colors">
                                        {refreshFlowState > 4 ? "Done ✓" : "Run"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-black/50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs">6</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Retry API</div>
                                        <div className="text-xs text-zinc-500">Test the newly minted Access Token</div>
                                    </div>
                                    <button onClick={() => handleRefreshFlowProtected(200, 6)} disabled={loading || refreshFlowState !== 5} className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg disabled:opacity-30">
                                        {refreshFlowState > 5 ? "Done ✓" : "Run"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-3 border border-zinc-800 rounded-lg bg-red-500/5 border-red-500/30 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-medium text-xs">7</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-red-400">Logout</div>
                                        <div className="text-xs text-zinc-500">Revoke session & clear cookie</div>
                                    </div>
                                    <button onClick={handleRefreshFlowLogout} disabled={loading || refreshFlowState !== 6} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg disabled:opacity-30 transition-colors">
                                        {refreshFlowState > 6 ? "Done ✓" : "Run"}
                                    </button>
                                </div>
                            </div>

                            {protectedResponse && (
                                <div className={`mt-4 border rounded-lg p-4 text-sm ${protectedResponse.status === 200 ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-zinc-400">API Response</span>
                                        <span className={protectedResponse.status === 200 ? "text-green-400" : "text-red-400"}>HTTP {protectedResponse.status}</span>
                                    </div>
                                    <pre className="font-mono text-xs">{JSON.stringify(protectedResponse.data, null, 2)}</pre>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* RIGHT SIDE */}

                <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                    <h2 className="text-xl font-medium">
                        Backend Execution
                    </h2>

                    <p className="text-zinc-500 text-sm mb-2">
                        Follow the request through your backend.
                    </p>
                    <p className="text-zinc-500 text-xs mb-6 italic border-l-2 border-zinc-700 pl-3">
                        <strong className="text-zinc-400">Execution Replay</strong> — The operations shown are real backend operations. The VISUAL REPLAY animation runs from execution telemetry after the request completes.
                    </p>

                    <div>
                        {steps.map((step, index) => (
                            <div key={step.id}>
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
                                            <pre className="bg-black/50 border border-zinc-800/50 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap break-words">
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

                <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-sm overflow-auto min-h-32 whitespace-pre-wrap break-words">
                    {response
                        ? JSON.stringify(response.body, null, 2)
                        : "// Send a request to see the response"}
                </pre>

            </div>
            
            </>
            )}

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
                    {activeTab !== "jwt" && <JWTInspector />}
                    <TokenMismatchLab />
                </div>

                <AccessTokenExpiryLab />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {activeTab !== "protected" && <ProtectedRouteLab />}
                    <TimingAttackLab />
                </div>

                <AuthenticationNotes />
            </div>

        </div>
    );
}