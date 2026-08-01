"use client";

import { useEffect, useState } from "react";

export default function TokenMismatchLab() {
    const [originalToken, setOriginalToken] = useState("");
    const [activeToken, setActiveToken] = useState("");
    const [payload, setPayload] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [response, setResponse] = useState<any>(null);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch("/api/auth/lab/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ expiresIn: "1m" }),
                });
                const data = await res.json();
                if (data.token) {
                    setOriginalToken(data.token);
                    setActiveToken(data.token);
                    const split = data.token.split(".");
                    setPayload(JSON.parse(atob(split[1])));
                }
            } catch (error) {
                console.error("Failed to fetch token", error);
            }
        };
        fetchToken();
    }, []);

    const updateToken = (modifier: (payload: any) => any, corruptSignature = false) => {
        if (!originalToken) return;
        
        const split = originalToken.split(".");
        const originalHeader = split[0];
        const originalPayload = JSON.parse(atob(split[1]));
        const originalSignature = split[2];

        const modifiedPayload = modifier(originalPayload);
        const encodedPayload = btoa(JSON.stringify(modifiedPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
        
        const newSignature = corruptSignature ? originalSignature.substring(0, originalSignature.length - 2) + "xx" : originalSignature;
        
        setActiveToken(`${originalHeader}.${encodedPayload}.${newSignature}`);
        setPayload(modifiedPayload);
        setStatus("idle");
        setResponse(null);
    };

    const handleSend = async () => {
        setStatus("loading");
        try {
            const res = await fetch("/api/auth/protected", {
                headers: {
                    Authorization: `Bearer ${activeToken}`,
                },
            });
            const data = await res.json();
            setResponse({ status: res.status, data });
            setStatus(res.ok ? "success" : "error");
        } catch (err) {
            setStatus("error");
            setResponse({ error: "Network error" });
        }
    };

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-medium">Token Tampering Lab</h2>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    title="What's happening?"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Modify the token payload without the signing secret.</p>

            {showInfo && (
                <div className="absolute inset-0 z-10 bg-zinc-900/95 rounded-xl p-6 overflow-auto backdrop-blur-sm border border-zinc-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Under the Hood: JWT Validation</h3>
                        <button onClick={() => setShowInfo(false)} className="text-zinc-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-4 text-sm text-zinc-300">
                        <p><strong>Can't anyone just change the data?</strong></p>
                        <p>Yes, the payload is only Base64 encoded, not encrypted. Anyone can decode it, change a value (like <code className="bg-zinc-800 px-1 rounded text-purple-400">role: "ADMIN"</code>), and re-encode it.</p>
                        
                        <p><strong>Then how is it secure?</strong></p>
                        <p>The security comes from the third part of the token: the <strong>Signature</strong>. When the backend receives a JWT, it doesn't just trust the payload. It takes the Header and Payload, and runs them through the HMAC SHA-256 algorithm again, using its secret key.</p>
                        
                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                            <p className="font-mono text-zinc-400 mb-2">1. Backend receives token</p>
                            <p className="font-mono text-zinc-400 mb-2">2. Backend recalculates signature</p>
                            <p className="font-mono text-zinc-400 mb-2">3. Backend compares signatures</p>
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                                <p className="text-red-400">If the payload was modified, the new recalculated signature will completely differ from the signature attached to the token. The backend instantly rejects it.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <div className="text-xs text-zinc-500 mb-2">MODIFIED PAYLOAD</div>
                    <pre className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs h-32 overflow-auto text-purple-400">
                        {payload ? JSON.stringify(payload, null, 2) : "Loading..."}
                    </pre>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                    <button 
                        onClick={() => updateToken(() => JSON.parse(atob(originalToken.split(".")[1])))}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 p-2 rounded transition-colors"
                    >
                        Use Original Token
                    </button>
                    <button 
                        onClick={() => updateToken(p => ({ ...p, role: "ADMIN" }))}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 p-2 rounded transition-colors text-purple-400"
                    >
                        Change Role (ADMIN)
                    </button>
                    <button 
                        onClick={() => updateToken(p => ({ ...p, sub: "hacker_999" }))}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 p-2 rounded transition-colors text-purple-400"
                    >
                        Change User ID
                    </button>
                    <button 
                        onClick={() => updateToken(p => ({ ...p, exp: p.exp + 3600 }))}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 p-2 rounded transition-colors text-purple-400"
                    >
                        Extend Expiration (+1h)
                    </button>
                    <button 
                        onClick={() => updateToken(p => p, true)}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 p-2 rounded transition-colors text-blue-400"
                    >
                        Corrupt Signature
                    </button>
                </div>
            </div>

            <button 
                onClick={handleSend}
                disabled={status === "loading" || !activeToken}
                className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 mb-6"
            >
                {status === "loading" ? "Sending..." : "Send Tampered Token"}
            </button>

            {response && (
                <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 h-px bg-zinc-800"></div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Backend Verification</div>
                        <div className="flex-1 h-px bg-zinc-800"></div>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                        <div className="flex flex-col items-center">
                            <div className="text-sm mb-2">Recalculate Signature</div>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="text-xs text-zinc-500 mb-1">Expected</div>
                                    <div className="font-mono text-xs text-green-400">Valid</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-zinc-500 mb-1">Received</div>
                                    <div className={`font-mono text-xs ${activeToken === originalToken ? 'text-green-400' : 'text-red-400'}`}>
                                        {activeToken === originalToken ? 'Match' : 'Mismatch'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`border rounded-lg p-4 ${status === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <div className={`font-medium ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                {status === 'success' ? '200 OK' : `401 Unauthorized`}
                            </div>
                            <div className="text-xs text-zinc-500">
                                {activeToken === originalToken ? 'Signature ✓' : 'Signature ✕'}
                            </div>
                        </div>
                        <pre className="font-mono text-xs text-zinc-400">
                            {JSON.stringify(response.data, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
