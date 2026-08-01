"use client";

import { useEffect, useState } from "react";

export default function AccessTokenExpiryLab() {
    const [expiresIn, setExpiresIn] = useState("10s");
    const [token, setToken] = useState("");
    const [payload, setPayload] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "valid" | "expired">("idle");
    const [timeLeft, setTimeLeft] = useState(0);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [showInfo, setShowInfo] = useState(false);

    const generateToken = async () => {
        try {
            const res = await fetch("/api/auth/lab/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expiresIn }),
            });
            const data = await res.json();
            if (data.token) {
                setToken(data.token);
                const decoded = JSON.parse(atob(data.token.split(".")[1]));
                setPayload(decoded);
                setStatus("valid");
                setApiResponse(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!payload) return;
        
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = payload.exp - now;
            
            if (remaining <= 0) {
                setTimeLeft(0);
                setStatus("expired");
                clearInterval(interval);
            } else {
                setTimeLeft(remaining);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [payload]);

    const callApi = async () => {
        if (!token) return;
        try {
            const res = await fetch("/api/auth/protected", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setApiResponse({ status: res.status, data });
        } catch (err) {
            setApiResponse({ error: "Network error" });
        }
    };

    const durations = [
        { label: "5 sec", value: "5s" },
        { label: "10 sec", value: "10s" },
        { label: "30 sec", value: "30s" },
        { label: "1 min", value: "1m" },
    ];

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 my-6 relative">
            <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-medium">Access Token Lifetime</h2>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    title="What's happening?"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
            </div>
            <p className="text-zinc-400 text-sm mb-6">See what happens when a token expires.</p>

            {showInfo && (
                <div className="absolute inset-0 z-10 bg-zinc-900/95 rounded-xl p-6 overflow-auto backdrop-blur-sm border border-zinc-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Under the Hood: Token Expiration</h3>
                        <button onClick={() => setShowInfo(false)} className="text-zinc-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-4 text-sm text-zinc-300">
                        <p><strong>Why do tokens expire?</strong></p>
                        <p>Unlike sessions stored in a database, JWTs are stateless. The backend does not keep a record of valid JWTs. Once issued, a JWT is valid until it expires. If a token is stolen, the attacker can use it as long as it's valid. Expiration limits this window of vulnerability.</p>
                        
                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                            <p className="font-mono text-zinc-400 mb-2">Payload Claims</p>
                            <p className="mb-2"><code className="text-purple-400 bg-zinc-800 px-1 rounded">iat</code> (Issued At): Timestamp when the token was created.</p>
                            <p className="mb-4"><code className="text-purple-400 bg-zinc-800 px-1 rounded">exp</code> (Expiration Time): Timestamp when the token becomes invalid.</p>
                            
                            <p className="font-mono text-zinc-400 mb-2">Backend Validation</p>
                            <p className="text-zinc-400">When the backend receives the token, it simply checks if the current server time is greater than the <code className="text-purple-400">exp</code> timestamp. If it is, it returns <code className="text-red-400">401 Unauthorized</code>.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="text-sm text-zinc-500 mb-4">How long should this access token live?</div>
                <div className="flex gap-6 mb-6">
                    {durations.map(d => (
                        <label key={d.value} className="flex flex-col items-center gap-2 cursor-pointer">
                            <span className="text-sm">{d.label}</span>
                            <input 
                                type="radio" 
                                name="expiresIn" 
                                value={d.value} 
                                checked={expiresIn === d.value}
                                onChange={(e) => setExpiresIn(e.target.value)}
                                className="accent-white w-4 h-4"
                            />
                        </label>
                    ))}
                </div>
                <button 
                    onClick={generateToken}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                    Generate Token
                </button>
            </div>

            {payload && (
                <div className="border-t border-zinc-800 pt-6">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="text-xs text-zinc-500 uppercase">Token Created</div>
                            <div className="font-mono text-sm mt-1">{new Date(payload.iat * 1000).toLocaleTimeString()}</div>
                        </div>
                        <div className="flex-1 px-8">
                            <div className="text-center text-xs text-zinc-500 uppercase mb-2">Token Lifetime</div>
                            <div className="relative h-2 bg-zinc-800 rounded-full">
                                {status === "valid" ? (
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-100 ease-linear"
                                        style={{ width: `${Math.max(0, (timeLeft / (payload.exp - payload.iat)) * 100)}%` }}
                                    />
                                ) : (
                                    <div className="absolute top-0 left-0 h-full w-full bg-red-500 rounded-full" />
                                )}
                                <div 
                                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-zinc-900 ${status === 'valid' ? 'bg-green-400' : 'bg-red-400'} transition-all duration-100 ease-linear`}
                                    style={{ left: status === 'valid' ? `${Math.max(0, (timeLeft / (payload.exp - payload.iat)) * 100)}%` : '100%', transform: 'translate(-50%, -50%)' }}
                                />
                            </div>
                            <div className="text-center text-xs font-mono mt-2">
                                {status === "valid" ? `${timeLeft}s left` : "0s left"}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-zinc-500 uppercase">Status</div>
                            <div className={`font-medium mt-1 ${status === 'valid' ? 'text-green-500' : 'text-red-500'}`}>
                                {status === 'valid' ? '● VALID' : '○ EXPIRED'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <button 
                            onClick={callApi}
                            className={`px-8 py-3 rounded-lg font-medium transition-colors ${status === 'valid' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                        >
                            Call Protected API
                        </button>

                        {apiResponse && (
                            <div className="w-full mt-6 flex justify-center">
                                <div className="text-center">
                                    <div className="text-zinc-500 mb-2">↓</div>
                                    <div className={`text-xl font-bold mb-1 ${apiResponse.status === 200 ? 'text-green-500' : 'text-red-500'}`}>
                                        {apiResponse.status}
                                    </div>
                                    <div className={`text-sm ${apiResponse.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
                                        {apiResponse.data.error || apiResponse.data.message}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {status === "expired" && (
                        <div className="mt-8 bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                            <div className="font-medium mb-2">Why?</div>
                            <p className="text-sm text-zinc-400 mb-4">The JWT contains:</p>
                            <pre className="font-mono text-sm text-purple-400 mb-4">
{`{
    "iat": ${payload.iat},
    "exp": ${payload.exp}
}`}
                            </pre>
                            <p className="text-sm text-zinc-400">
                                Current time {'>'} exp. Therefore the server rejects the token.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
