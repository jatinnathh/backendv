import React from "react";
import { HttpRequestOptions } from "../../../lib/http/api";
import { ExperimentConfig } from "../../../lib/http/labs";

export const RequestBuilder = ({ 
    request, 
    setRequest,
    lab 
}: { 
    request: HttpRequestOptions; 
    setRequest: (req: HttpRequestOptions) => void;
    lab: ExperimentConfig;
}) => {
    
    // Helpers to update specific parts of the request
    const updateRequest = (updates: Partial<HttpRequestOptions>) => {
        setRequest({ ...request, ...updates });
    };

    const handleQueryChange = (key: string, value: string, oldKey?: string) => {
        const newQuery = { ...request.query };
        if (oldKey && oldKey !== key) {
            delete newQuery[oldKey];
        }
        newQuery[key] = value;
        updateRequest({ query: newQuery });
    };

    const handleHeaderChange = (key: string, value: string, oldKey?: string) => {
        const newHeaders = { ...request.headers };
        if (oldKey && oldKey !== key) {
            delete newHeaders[oldKey];
        }
        newHeaders[key] = value;
        updateRequest({ headers: newHeaders });
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
                <select 
                    value={request.method} 
                    onChange={e => updateRequest({ method: e.target.value })}
                    className="bg-neutral-900 border border-neutral-700 text-white rounded px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                >
                    {lab.allowedMethods.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                
                <input 
                    type="text" 
                    value={request.path} 
                    onChange={e => updateRequest({ path: e.target.value })}
                    className="flex-1 bg-neutral-900 border border-neutral-700 text-white rounded px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                    placeholder="/api/..."
                />
            </div>

            <div>
                <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-2 uppercase">Query Parameters</h3>
                <div className="space-y-2">
                    {Object.entries(request.query || {}).map(([key, value], idx) => (
                        <div key={idx} className="flex space-x-2">
                            <input 
                                type="text" 
                                value={key} 
                                onChange={e => handleQueryChange(e.target.value, value, key)}
                                className="w-1/3 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-3 py-1.5 font-mono text-xs outline-none focus:border-blue-500"
                                placeholder="Key"
                            />
                            <input 
                                type="text" 
                                value={value} 
                                onChange={e => handleQueryChange(key, e.target.value)}
                                className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-3 py-1.5 font-mono text-xs outline-none focus:border-blue-500"
                                placeholder="Value"
                            />
                            <button 
                                onClick={() => {
                                    const newQuery = { ...request.query };
                                    delete newQuery[key];
                                    updateRequest({ query: newQuery });
                                }}
                                className="px-2 text-neutral-600 hover:text-red-400"
                            >×</button>
                        </div>
                    ))}
                    <button 
                        onClick={() => handleQueryChange("", "")}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >+ Add Parameter</button>
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-2 uppercase">Headers</h3>
                <div className="space-y-2">
                    {Object.entries(request.headers || {}).map(([key, value], idx) => (
                        <div key={idx} className="flex space-x-2">
                            <input 
                                type="text" 
                                value={key} 
                                onChange={e => handleHeaderChange(e.target.value, value, key)}
                                className="w-1/3 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-3 py-1.5 font-mono text-xs outline-none focus:border-blue-500"
                                placeholder="Header"
                            />
                            <input 
                                type="text" 
                                value={value} 
                                onChange={e => handleHeaderChange(key, e.target.value)}
                                className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-3 py-1.5 font-mono text-xs outline-none focus:border-blue-500"
                                placeholder="Value"
                            />
                            <button 
                                onClick={() => {
                                    const newH = { ...request.headers };
                                    delete newH[key];
                                    updateRequest({ headers: newH });
                                }}
                                className="px-2 text-neutral-600 hover:text-red-400"
                            >×</button>
                        </div>
                    ))}
                    <button 
                        onClick={() => handleHeaderChange("", "")}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >+ Add Header</button>
                </div>
            </div>

            {request.method !== "GET" && request.method !== "HEAD" && (
                <div className="flex-1 flex flex-col min-h-[200px]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-neutral-500 tracking-widest uppercase">Body</h3>
                        <span className="text-xs text-neutral-600 font-mono">application/json</span>
                    </div>
                    <textarea 
                        value={request.body || ""}
                        onChange={e => updateRequest({ body: e.target.value })}
                        className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 resize-none min-h-[150px]"
                        placeholder='{\n  "key": "value"\n}'
                        spellCheck="false"
                    />
                </div>
            )}
        </div>
    );
};
