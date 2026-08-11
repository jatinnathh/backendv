import React from "react";
import { HttpRequestOptions, HttpResponse } from "../../../lib/http/api";

export const RawHttpViewer = ({ request, response }: { request: HttpRequestOptions, response: HttpResponse | null }) => {
    
    // Construct actual sent request details
    let pathWithQuery = request.path;
    const queryParams = new URLSearchParams();
    Object.entries(request.query || {}).forEach(([k, v]) => {
        if (v) queryParams.set(k, v);
    });
    const queryString = queryParams.toString();
    if (queryString) {
        pathWithQuery += `?${queryString}`;
    }
    
    const requestLines = [
        `${request.method || "GET"} ${pathWithQuery} HTTP/1.1`
    ];

    const reqHeaders = { ...request.headers };
    if (request.body && !reqHeaders["Content-Type"]) {
        reqHeaders["Content-Type"] = "application/json";
    }

    Object.entries(reqHeaders).forEach(([k, v]) => {
        if (v) requestLines.push(`${k}: ${v}`);
    });

    if (request.body) {
        requestLines.push(""); // empty line before body
        requestLines.push(request.body);
    }

    // Construct actual received response details
    const responseLines = [];
    if (response) {
        responseLines.push(`HTTP/1.1 ${response.status} ${response.statusText}`);
        Object.entries(response.headers || {}).forEach(([k, v]) => {
            responseLines.push(`${k}: ${v}`);
        });
        
        if (response.data) {
            responseLines.push("");
            responseLines.push(typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data);
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-sm">
                <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 text-neutral-400 text-xs font-semibold tracking-wider flex justify-between">
                    <span>REQUEST SENT</span>
                </div>
                <div className="p-4 overflow-x-auto text-neutral-300">
                    <pre className="whitespace-pre-wrap break-all">{requestLines.join("\n")}</pre>
                </div>
            </div>

            {response && (
                <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 font-mono text-sm">
                    <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 text-neutral-400 text-xs font-semibold tracking-wider flex justify-between">
                        <span>RESPONSE RECEIVED</span>
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
