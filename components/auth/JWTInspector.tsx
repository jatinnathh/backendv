// components\auth\JWTInspector.tsx
"use client";

import { useEffect, useState, useMemo } from "react";

export default function JWTInspector() {
    const [token, setToken] = useState("");
    const [selectedPart, setSelectedPart] = useState<"header" | "payload" | "signature" | null>(null);
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch("/api/auth/lab/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ expiresIn: "1m" }), // Using 1m for demo
                });
                const data = await res.json();
                if (data.token) {
                    setToken(data.token);
                }
            } catch (error) {
                console.error("Failed to fetch token", error);
            }
        };
        fetchToken();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const parts = useMemo(() => {
        if (!token) return null;
        const split = token.split(".");
        if (split.length !== 3) return null;

        try {
            const header = JSON.parse(atob(split[0]));
            const payload = JSON.parse(atob(split[1]));
            return {
                headerString: split[0],
                payloadString: split[1],
                signatureString: split[2],
                header,
                payload,
            };
        } catch {
            return null;
        }
    }, [token]);

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-medium">JWT Inspector</h2>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    title="What's happening?"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Click a segment to inspect it.</p>

            {showInfo && (
                <div className="absolute inset-0 z-10 bg-zinc-900/95 rounded-xl p-6 overflow-auto backdrop-blur-sm border border-zinc-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Under the Hood: JWT Structure</h3>
                        <button onClick={() => setShowInfo(false)} className="text-zinc-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-4 text-sm text-zinc-300">
                        <p><strong>What is happening here?</strong></p>
                        <p>The backend generated a JSON Web Token (JWT) after a successful login or registration. This token acts as a temporary ID card for the user.</p>
                        
                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                            <p className="text-red-400 font-mono mb-1">Header</p>
                            <p className="mb-3 text-zinc-400">Contains metadata about the token, such as the cryptographic algorithm used (e.g., HS256) and token type.</p>
                            
                            <p className="text-purple-400 font-mono mb-1">Payload</p>
                            <p className="mb-3 text-zinc-400">Contains the actual claims (data) we want to store, like user ID (sub), issue time (iat), and expiration time (exp). <em>This is just Base64 encoded, meaning anyone can read it, but nobody can change it without invalidating the signature.</em></p>
                            
                            <p className="text-blue-400 font-mono mb-1">Signature</p>
                            <p className="text-zinc-400">Created by hashing the encoded Header and Payload together with a secret key known only to the backend. This guarantees the token's integrity.</p>
                        </div>
                    </div>
                </div>
            )}

            {parts ? (
                <div>
                    <div className="flex font-mono text-sm break-all mb-4 text-center cursor-pointer">
                        <div 
                            className={`p-2 flex-1 rounded-l-lg transition-colors ${selectedPart === 'header' ? 'bg-red-500/20 text-red-400' : 'text-red-500 hover:bg-red-500/10'}`}
                            onClick={() => setSelectedPart("header")}
                        >
                            {parts.headerString}
                        </div>
                        <div className="text-zinc-600 p-2">.</div>
                        <div 
                            className={`p-2 flex-1 transition-colors ${selectedPart === 'payload' ? 'bg-purple-500/20 text-purple-400' : 'text-purple-500 hover:bg-purple-500/10'}`}
                            onClick={() => setSelectedPart("payload")}
                        >
                            {parts.payloadString}
                        </div>
                        <div className="text-zinc-600 p-2">.</div>
                        <div 
                            className={`p-2 flex-1 rounded-r-lg transition-colors ${selectedPart === 'signature' ? 'bg-blue-500/20 text-blue-400' : 'text-blue-500 hover:bg-blue-500/10'}`}
                            onClick={() => setSelectedPart("signature")}
                        >
                            {parts.signatureString.substring(0, 10)}...
                        </div>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-500 mb-6 font-mono px-4">
                        <div className="text-red-500">──────── HEADER ─────</div>
                        <div className="text-purple-500">─── PAYLOAD ─────</div>
                        <div className="text-blue-500">─ SIGNATURE ─</div>
                    </div>

                    <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm min-h-[160px] flex items-center justify-center">
                        {!selectedPart && <span className="text-zinc-500">Select a part to view its contents</span>}
                        
                        {selectedPart === "header" && (
                            <pre className="text-red-400 w-full whitespace-pre-wrap">
                                {JSON.stringify(parts.header, null, 2)}
                            </pre>
                        )}
                        
                        {selectedPart === "payload" && (
                            <pre className="text-purple-400 w-full whitespace-pre-wrap">
                                {JSON.stringify(parts.payload, null, 2)}
                            </pre>
                        )}
                        
                        {selectedPart === "signature" && (
                            <pre className="text-blue-400 w-full whitespace-pre-wrap">
                                HMACSHA256(
                                  base64UrlEncode(header) + "." +
                                  base64UrlEncode(payload),
                                  SECRET
                                )
                            </pre>
                        )}
                    </div>

                    {parts.payload.exp && parts.payload.iat && (
                        <div className="mt-6 border-t border-zinc-800 pt-6">
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <span className="text-zinc-500">Issued At:</span>
                                    <span className="ml-2 font-mono">{new Date(parts.payload.iat * 1000).toLocaleTimeString()}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Expires At:</span>
                                    <span className="ml-2 font-mono">{new Date(parts.payload.exp * 1000).toLocaleTimeString()}</span>
                                </div>
                            </div>

                            {(() => {
                                const remaining = parts.payload.exp - now;
                                const isExpired = remaining <= 0;
                                const total = parts.payload.exp - parts.payload.iat;
                                const percentage = isExpired ? 0 : Math.max(0, (remaining / total) * 100);

                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-500">Remaining</span>
                                            <span className={`font-mono ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                                                {isExpired ? "Expired" : `${remaining}s`}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${isExpired ? 'bg-red-500' : 'bg-green-500'} transition-all duration-1000 ease-linear`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                    Loading token...
                </div>
            )}
        </div>
    );
}