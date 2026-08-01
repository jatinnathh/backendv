"use client";

import { useState } from "react";

type TimingResult = {
    email: string;
    exists: boolean;
    duration: number;
};

export default function TimingAttackLab() {
    const [email, setEmail] = useState("existing@example.com");
    const [password, setPassword] = useState("wrongpassword");
    const [protectionOn, setProtectionOn] = useState(false);
    const [results, setResults] = useState<TimingResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        
        setLoading(true);
        
        // Simulate network latency (2-5ms)
        const networkJitter = Math.floor(Math.random() * 4) + 2;
        
        // Simulate DB lookup time (10-15ms)
        const dbLookup = Math.floor(Math.random() * 6) + 10;
        
        // Simulate bcrypt hash time (85-95ms)
        const hashTime = Math.floor(Math.random() * 11) + 85;

        const isExisting = email === "existing@example.com";
        let duration = 0;

        if (protectionOn) {
            // With protection: we always do a dummy hash if user not found
            duration = networkJitter + dbLookup + hashTime;
        } else {
            // Without protection: early exit if user not found
            if (isExisting) {
                duration = networkJitter + dbLookup + hashTime;
            } else {
                duration = networkJitter + dbLookup;
            }
        }

        // Add some random variation (±2ms) to make it look realistic
        duration += (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);

        setTimeout(() => {
            setResults(prev => [
                { email, exists: isExisting, duration },
                ...prev
            ].slice(0, 5)); // keep last 5
            setLoading(false);
        }, 500); // UI visual delay
    };

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-medium">Timing Attack Lab</h2>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    title="What's happening?"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Observe how response times can leak information.</p>

            {showInfo && (
                <div className="absolute inset-0 z-10 bg-zinc-900/95 rounded-xl p-6 overflow-auto backdrop-blur-sm border border-zinc-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Under the Hood: Timing Attacks</h3>
                        <button onClick={() => setShowInfo(false)} className="text-zinc-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-4 text-sm text-zinc-300">
                        <p><strong>What is a Timing Attack?</strong></p>
                        <p>A timing attack is a side-channel vulnerability where an attacker tries to compromise a cryptosystem or extract information by analyzing the time it takes the system to respond to various inputs.</p>
                        
                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                            <p className="font-mono text-zinc-400 mb-2">The Vulnerability</p>
                            <p className="mb-4">Hashing a password using a strong algorithm like <code className="text-purple-400">bcrypt</code> is intentionally slow (often 80ms - 150ms). If a backend checks the database, finds no user, and immediately returns <code className="text-red-400">401</code>, the request might take 15ms. If the user <em>does</em> exist, it takes 15ms + 100ms (bcrypt) = 115ms. An attacker can use this difference to enumerate existing emails.</p>
                            
                            <p className="font-mono text-zinc-400 mb-2">The Solution</p>
                            <p>To prevent this, the backend must always take roughly the same amount of time regardless of whether the user exists. It does this by performing a "dummy" hash comparison against a fake password when a user is not found in the database.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm text-zinc-500 mb-2">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 outline-none"
                    />
                    <div className="text-xs text-zinc-500 mt-2">
                        Try <span className="text-purple-400 cursor-pointer" onClick={() => setEmail("existing@example.com")}>existing@example.com</span> or <span className="text-purple-400 cursor-pointer" onClick={() => setEmail("unknown@example.com")}>unknown@example.com</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-zinc-500 mb-2">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 outline-none"
                    />
                </div>
            </div>

            <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 mb-8"
            >
                {loading ? "Authenticating..." : "LOGIN"}
            </button>

            <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">Result</div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Timing Protection</span>
                    <button 
                        onClick={() => setProtectionOn(false)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${!protectionOn ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-zinc-800 text-zinc-400 border border-transparent'}`}
                    >
                        OFF
                    </button>
                    <button 
                        onClick={() => setProtectionOn(true)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${protectionOn ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-zinc-800 text-zinc-400 border border-transparent'}`}
                    >
                        ON
                    </button>
                </div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-lg p-4 min-h-[150px] flex flex-col justify-end">
                {results.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-8">
                        Try logging in to see response times
                    </div>
                ) : (
                    <div className="flex flex-col-reverse gap-3">
                        {results.map((res, i) => (
                            <div key={i} className={`flex items-center gap-4 ${i !== 0 ? 'opacity-50' : ''}`}>
                                <div className="w-1/3 truncate text-xs text-zinc-400">
                                    {res.email}
                                </div>
                                <div className="flex-1">
                                    <div 
                                        className={`h-2 rounded-full ${res.duration > 50 ? 'bg-purple-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, Math.max(5, (res.duration / 150) * 100))}%` }}
                                    ></div>
                                </div>
                                <div className="w-16 text-right font-mono text-xs">
                                    {res.duration}ms
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <span className="text-lg">⚠</span>
                    <span className="font-medium text-sm">Security Note</span>
                </div>
                {!protectionOn ? (
                    <div className="text-xs text-zinc-400 leading-relaxed">
                        <strong className="text-zinc-300">INFORMATION LEAK:</strong> An attacker observing response times can deduce if an email exists in the database. Fast response = unknown user (early exit). Slow response = existing user (bcrypt comparison).
                    </div>
                ) : (
                    <div className="text-xs text-zinc-400 leading-relaxed">
                        <strong className="text-zinc-300">PROTECTED:</strong> The backend performs a dummy password-hash verification when the account doesn't exist. This ensures both paths take roughly the same amount of time, preventing timing attacks.
                    </div>
                )}
            </div>
        </div>
    );
}
