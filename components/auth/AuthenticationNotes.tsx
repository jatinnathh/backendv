// components\auth\AuthenticationNotes.tsx

"use client";

import { useState } from "react";

type NoteSection = {
    title: string;
    content: React.ReactNode;
};

export default function AuthenticationNotes() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const sections: NoteSection[] = [
        {
            title: "Authentication vs Authorization",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        <strong className="text-white">Authentication</strong> answers <em>"Who are you?"</em>. It is the mechanism to assign an identity to a subject in a given context (e.g., verifying an email and password).
                    </p>
                    <p>
                        <strong className="text-white">Authorization</strong> answers <em>"What can you do?"</em>. It defines your permissions and access level after you are authenticated (e.g., RBAC - Role Based Access Control).
                    </p>
                </div>
            )
        },
        {
            title: "Why HTTP is Stateless",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        HTTP is fundamentally stateless, meaning each request is independent and has no idea of previous requests.
                    </p>
                    <p>
                        As web applications became more complex, this became a bottleneck because they required persistent states (like keeping a user logged in or remembering a shopping cart). This marked the need for stateful mechanisms on top of HTTP.
                    </p>
                </div>
            )
        },
        {
            title: "Stateful Authentication (Sessions)",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        A way to establish a temporary server-side context for each user. The server has some kind of memory about the user.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Session Creation:</strong> A unique session ID is created upon login and stored with user data in a persistent store (e.g., Redis).</li>
                        <li><strong>Cookies:</strong> The session ID is sent to the client as a cookie and automatically included in subsequent requests.</li>
                    </ul>
                    <p>
                        <strong>Problems:</strong> Retaining session data creates overhead, replication issues, and latency when scaling horizontally.
                    </p>
                </div>
            )
        },
        {
            title: "Stateless Authentication (JWT)",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        The server does NOT store session data. Instead, the client stores an authentication token that contains the user information.
                    </p>
                    <p>
                        The server simply validates the token's cryptographic signature on every request, allowing for massive horizontal scalability without needing a shared session store.
                    </p>
                </div>
            )
        },
        {
            title: "How JWT Works",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        <strong>JWT (JSON Web Token)</strong> is a compact, self-contained mechanism for transferring claims statelessly.
                    </p>
                    <div className="bg-black border border-zinc-800 rounded p-4 font-mono text-xs my-4 text-center">
                        HEADER . PAYLOAD . SIGNATURE
                    </div>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Header:</strong> Algorithm and token type (e.g., HS256, JWT).</li>
                        <li><strong>Payload:</strong> The claims or user data (e.g., sub, role, iat, exp).</li>
                        <li><strong>Signature:</strong> Verifies token integrity and authenticity using a secret key.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Cookies vs JWT",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        They are not mutually exclusive. A <strong>Cookie</strong> is a storage mechanism in the browser that automates sending data to the server. A <strong>JWT</strong> is a token format.
                    </p>
                    <p>
                        You can store a session ID in a cookie (stateful), or you can store a JWT in a cookie (stateless). JWTs can also be sent via the <code>Authorization: Bearer</code> header instead of cookies.
                    </p>
                </div>
            )
        },
        {
            title: "Access Token vs Refresh Token",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        <strong>Access Token:</strong> A short-lived token used to access APIs (e.g., expires in 15 minutes). If stolen, the damage is time-limited.
                    </p>
                    <p>
                        <strong>Refresh Token:</strong> A longer-lived token (e.g., expires in 7 days) used ONLY to get new access tokens when they expire, without requiring the user to log in again.
                    </p>
                </div>
            )
        },
        {
            title: "JWT Security",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        Keep authentication failure messages generic (e.g., "Authentication failed"). Do not specify if the user exists, if the password was wrong, or if the token signature specifically failed.
                    </p>
                    <p>
                        Base64 encoding is not encryption. Anyone can decode and read a JWT payload. Do not put sensitive data (like passwords) in a JWT.
                    </p>
                </div>
            )
        },
        {
            title: "Timing Attacks",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        Authentication involves finding a user, checking status, and hashing the password. Hashing takes a measurable amount of time.
                    </p>
                    <p>
                        If a server returns quickly for an unknown user, but slowly for a wrong password, an attacker can use this <strong>timing difference</strong> to discover valid email addresses.
                    </p>
                    <p>
                        <strong>Defense:</strong> Perform a dummy password hash when the account doesn't exist so that the process always takes roughly the same time.
                    </p>
                </div>
            )
        },
        {
            title: "Validation & Transformation",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        Before processing an API request, ensure data is in the expected format to prevent unexpected behavior or injection attacks.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Syntactic Validation:</strong> Does the string follow a structure? (e.g., is it an email?)</li>
                        <li><strong>Semantic Validation:</strong> Does the data make sense? (e.g., DOB is not in the future).</li>
                        <li><strong>Type Validation:</strong> Does the data type match? (e.g., providing an integer instead of a string).</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Hybrid Token Architecture",
            content: (
                <div className="space-y-4 text-sm text-zinc-300">
                    <p>
                        Pure stateless authentication means the server remembers nothing, which makes revoking access before expiration impossible. Most robust systems use a hybrid approach:
                    </p>
                    <div className="bg-black/50 border border-zinc-800 rounded p-4 font-mono text-xs my-4 text-center whitespace-pre overflow-x-auto text-zinc-400">
{`                    LOGIN
                      │
             ┌────────┴────────┐
             ▼                 ▼
       Access Token       Refresh Token
           JWT                 JWT
             │                  │
       short lived         long lived
             │                  │
       Bearer header       HttpOnly Cookie
             │                  │
             ▼                  ▼
      signature check       Session DB
             │                  │
        STATELESS             STATEFUL`}
                    </div>
                    <p>
                        The access token is verified statelessly for high performance. The refresh token is verified against the database, giving you a centralized chokepoint to revoke compromised sessions.
                    </p>
                </div>
            )
        },
    ];

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
            <div className="bg-zinc-900 border-b border-zinc-800 p-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                    <span>📖</span> Authentication Notes
                </h2>
            </div>
            
            <div className="divide-y divide-zinc-800">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-black/20">
                        <button 
                            onClick={() => toggleSection(idx)}
                            className="w-full flex justify-between items-center p-4 hover:bg-zinc-800/50 transition-colors text-left"
                        >
                            <span className="font-medium text-zinc-300 text-sm">{section.title}</span>
                            <span className="text-zinc-500 font-mono">
                                {openIndex === idx ? '[-]' : '[+]'}
                            </span>
                        </button>
                        
                        {openIndex === idx && (
                            <div className="p-4 pt-0 text-zinc-400 bg-black/20">
                                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                    {section.content}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
