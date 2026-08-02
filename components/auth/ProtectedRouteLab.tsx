"use client";

import { useState } from "react";

type TokenType = "none" | "valid" | "expired" | "tampered" | "random";

export default function ProtectedRouteLab() {
    const [tokenType, setTokenType] = useState<TokenType>("valid");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [response, setResponse] = useState<any>(null);
    const [showInfo, setShowInfo] = useState(false);

    const handleSend = async () => {
        setStatus("loading");
        
        let token = "";
        if (tokenType === "valid") {
            const res = await fetch("/api/auth/lab/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expiresIn: "1m" })
            });
            token = (await res.json()).token;
        } else if (tokenType === "expired") {
            const res = await fetch("/api/auth/lab/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expiresIn: "expired" })
            });
            token = (await res.json()).token;
        } else if (tokenType === "tampered") {
            const res = await fetch("/api/auth/lab/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expiresIn: "1m" })
            });
            token = (await res.json()).token;
            token = token.substring(0, token.length - 5) + "abcde";
        } else if (tokenType === "random") {
            token = "random.string.value";
        }

        const headers: Record<string, string> = {};
        if (tokenType !== "none") {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const res = await fetch("/api/auth/protected", {
                headers
            });
            const data = await res.json();
            setResponse({ status: res.status, data });
            setStatus(res.ok ? "success" : "error");
        } catch (err) {
            setResponse({ error: "Network error" });
            setStatus("error");
        }
    };

    const getSimulatedStepStatus = (step: string) => {
        if (status === "idle" || status === "loading") return "wait";
        
        if (tokenType === "none") {
            if (step === "extract") return "fail";
            return "skip";
        }
        if (tokenType === "random") {
            if (step === "extract") return "pass";
            if (step === "verify") return "fail";
            return "skip";
        }
        if (tokenType === "tampered") {
            if (step === "extract") return "pass";
            if (step === "verify") return "fail";
            return "skip";
        }
        if (tokenType === "expired") {
            if (step === "extract") return "pass";
            if (step === "verify") return "pass";
            if (step === "exp") return "fail";
            return "skip";
        }
        if (tokenType === "valid") {
            return "pass";
        }
        return "wait";
    };

    const StepIcon = ({ state }: { state: string }) => {
        if (state === "pass") return <span className="text-green-500">✓</span>;
        if (state === "fail") return <span className="text-red-500">✕</span>;
        if (state === "skip") return <span className="text-zinc-600">-</span>;
        return <span className="text-zinc-500">○</span>;
    };

    const options: { value: TokenType, label: string }[] = [
        { value: "none", label: "No token" },
        { value: "valid", label: "Valid access token" },
        { value: "expired", label: "Expired token" },
        { value: "tampered", label: "Tampered token" },
        { value: "random", label: "Random string" },
    ];

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-medium">Protected Route Lab</h2>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    title="What's happening?"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Test the GET /api/auth/protected endpoint.</p>

            {showInfo && (
                <div className="absolute inset-0 z-10 bg-zinc-900/95 rounded-xl p-6 overflow-auto backdrop-blur-sm border border-zinc-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Under the Hood: JWT Middleware</h3>
                        <button onClick={() => setShowInfo(false)} className="text-zinc-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-4 text-sm text-zinc-300">
                        <p><strong>How does a backend protect a route?</strong></p>
                        <p>Typically, backends use a piece of middleware that sits in front of the actual route handler. This middleware intercepts the incoming HTTP request and performs a series of validation steps.</p>
                        
                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 space-y-3">
                            <div>
                                <p className="font-mono text-zinc-400 mb-1">1. Extraction</p>
                                <p>It looks for an <code className="text-purple-400 bg-zinc-800 px-1 rounded">Authorization</code> header with the format <code className="text-purple-400 bg-zinc-800 px-1 rounded">Bearer &lt;token&gt;</code>. If missing, it immediately rejects the request.</p>
                            </div>
                            <div>
                                <p className="font-mono text-zinc-400 mb-1">2. Cryptographic Verification</p>
                                <p>It re-hashes the Header + Payload and compares it to the Signature. If it doesn't match, someone tampered with the token.</p>
                            </div>
                            <div>
                                <p className="font-mono text-zinc-400 mb-1">3. Claims Validation</p>
                                <p>It checks the payload claims, most importantly if current time &gt; <code className="text-purple-400 bg-zinc-800 px-1 rounded">exp</code>.</p>
                            </div>
                            <div>
                                <p className="font-mono text-zinc-400 mb-1">4. Context Population</p>
                                <p>If all steps pass, it attaches the decoded payload (like the user ID) to the request object so the actual route handler knows who made the request.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="text-sm text-zinc-500 mb-3">Authorization</div>
                <div className="flex flex-col gap-2">
                    {options.map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="radio" 
                                name="tokenType" 
                                value={opt.value}
                                checked={tokenType === opt.value}
                                onChange={(e) => {
                                    setTokenType(e.target.value as TokenType);
                                    setStatus("idle");
                                    setResponse(null);
                                }}
                                className="accent-white w-4 h-4"
                            />
                            <span className="text-sm">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleSend}
                disabled={status === "loading"}
                className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 mb-8"
            >
                {status === "loading" ? "Sending..." : "SEND REQUEST"}
            </button>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <div className="text-xs text-zinc-500 uppercase mb-4 text-center">Browser</div>
                    <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs">
                        <div className="text-blue-400">GET /protected</div>
                        {tokenType !== "none" && (
                            <div className="mt-2 text-zinc-400">
                                Authorization:<br/>
                                Bearer {
                                    tokenType === 'valid' ? 'eyJhb...' : 
                                    tokenType === 'tampered' ? 'eyJhb...tampered' : 
                                    tokenType === 'expired' ? 'eyJhb...(expired)' : 
                                    'random.string'
                                }
                            </div>
                        )}
                        {tokenType === "none" && (
                            <div className="mt-2 text-zinc-500 italic">No Authorization header</div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="text-xs text-zinc-500 uppercase mb-4 text-center">Backend</div>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-3">
                            <StepIcon state={getSimulatedStepStatus("extract")} />
                            <span className={getSimulatedStepStatus("extract") === "fail" ? "text-red-400" : ""}>Extract Token</span>
                        </div>
                        <div className="ml-2 w-px h-4 bg-zinc-800"></div>
                        <div className="flex items-center gap-3">
                            <StepIcon state={getSimulatedStepStatus("verify")} />
                            <span className={getSimulatedStepStatus("verify") === "fail" ? "text-red-400" : ""}>Verify Signature</span>
                        </div>
                        <div className="ml-2 w-px h-4 bg-zinc-800"></div>
                        <div className="flex items-center gap-3">
                            <StepIcon state={getSimulatedStepStatus("exp")} />
                            <span className={getSimulatedStepStatus("exp") === "fail" ? "text-red-400" : ""}>Check exp</span>
                        </div>
                        <div className="ml-2 w-px h-4 bg-zinc-800"></div>
                        <div className="flex items-center gap-3">
                            <StepIcon state={getSimulatedStepStatus("type")} />
                            <span>Check type</span>
                        </div>
                        <div className="ml-2 w-px h-4 bg-zinc-800"></div>
                        <div className="flex items-center gap-3">
                            <StepIcon state={getSimulatedStepStatus("read")} />
                            <span>Read Claims</span>
                        </div>
                    </div>
                </div>
            </div>

            {response && (
                <div className={`mt-auto border rounded-lg p-4 ${status === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    <div className="text-xs text-zinc-500 uppercase mb-2">Response</div>
                    <div className={`font-medium mb-2 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        HTTP {response.status}
                    </div>
                    <pre className="font-mono text-xs text-zinc-400">
                        {JSON.stringify(response.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
