import React from "react";

export const RawHttpViewer = ({ request, response }: { request: any, response: any }) => {
    
    // Construct RAW Request String
    const url = new URL(`http://localhost:8000${request.path || "/api/http/echo"}`);
    Object.entries(request.query || {}).forEach(([k, v]) => url.searchParams.set(k, v as string));
    
    const requestLines = [
        `${request.method || "GET"} ${url.pathname}${url.search} HTTP/1.1`,
        `Host: localhost:8000`,
    ];

    const reqHeaders = { ...request.headers };
    if (request.body && !reqHeaders["Content-Type"]) {
        reqHeaders["Content-Type"] = "application/json";
    }

    Object.entries(reqHeaders).forEach(([k, v]) => {
        if (v) requestLines.push(`${k}: ${v}`);
    });

    requestLines.push(""); // empty line before body
    if (request.body) {
        requestLines.push(request.body);
    }

    // Construct RAW Response String
    const responseLines = [];
    if (response) {
        responseLines.push(`HTTP/1.1 ${response.status} ${response.statusText}`);
        Object.entries(response.headers || {}).forEach(([k, v]) => {
            responseLines.push(`${k}: ${v}`);
        });
        responseLines.push("");
        if (response.data) {
            responseLines.push(typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data);
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-sm">
                <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 text-neutral-400 text-xs font-semibold tracking-wider flex justify-between">
                    <span>RAW REQUEST</span>
                </div>
                <div className="p-4 overflow-x-auto text-neutral-300">
                    <pre className="whitespace-pre-wrap break-all">{requestLines.join("\n")}</pre>
                </div>
            </div>

            {response && (
                <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-sm">
                    <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 text-neutral-400 text-xs font-semibold tracking-wider flex justify-between">
                        <span>RAW RESPONSE</span>
                        <span className={`${response.status < 400 ? 'text-green-400' : 'text-red-400'}`}>
                            {response.duration}ms
                        </span>
                    </div>
                    <div className="p-4 overflow-x-auto text-neutral-300">
                        <pre className="whitespace-pre-wrap break-all">{responseLines.join("\n")}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};
