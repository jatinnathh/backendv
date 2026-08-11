import React from "react";

interface TraceEvent {
    step?: string;
    type?: string;
    timestamp?: string;
    status?: string | number;
    [key: string]: any;
}

interface Props {
    trace: TraceEvent[];
    loading: boolean;
}

export default function RestExecutionTrace({
    trace,
    loading,
}: Props) {

    if (loading) {
        return (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
                <div className="mb-5">
                    <h2 className="text-xl font-medium">Backend Execution</h2>
                </div>
                <div className="border border-zinc-800 rounded-lg p-4 text-sm text-zinc-400">
                    Express is processing the request...
                </div>
            </div>
        );
    }

    if (trace.length === 0) {
        return (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
                <div className="mb-5">
                    <h2 className="text-xl font-medium">Backend Execution</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        These events come from the actual Express backend.
                    </p>
                </div>
                <div className="border border-dashed border-zinc-800 rounded-lg p-8 text-center text-sm text-zinc-600">
                    Send a request to inspect the backend execution.
                </div>
            </div>
        );
    }

    // --- Data Extraction ---

    const requestReceived = trace.find(t => t.step === "request_received");
    const bodyReceived = trace.find(t => t.step === "body_received" || t.step === "partial_body_received");
    const queryParsed = trace.find(t => t.step === "query_parameters_parsed");
    const pathParsed = trace.find(t => t.step === "path_parameter_parsed");

    const controllerEvents = trace.filter(t => 
        ["validation", "normalization", "pagination_calculated", "query_parameters_parsed", "path_parameter_parsed", "body_received", "partial_body_received"].includes(t.step || "")
    );

    const prismaEvents = trace.filter(t => 
        ["database_query", "database_insert", "database_update", "database_delete"].includes(t.step || "")
    );

    const responseSent = trace.find(t => t.step === "response_sent");

    // Determine Service name conceptually based on path/method
    let serviceMethod = "processRequest()";
    if (requestReceived) {
        const { method, path } = requestReceived;
        if (method === "GET" && path?.includes("?")) serviceMethod = "getUsers()";
        else if (method === "GET") serviceMethod = "getUserById()";
        else if (method === "POST") serviceMethod = "createUser()";
        else if (method === "PUT") serviceMethod = "replaceUser()";
        else if (method === "PATCH") serviceMethod = "updateUser()";
        else if (method === "DELETE") serviceMethod = "deleteUser()";
    }

    // --- Sub-components ---

    const Arrow = () => (
        <div className="flex justify-center py-2 text-zinc-600">
            ↓
        </div>
    );

    const Box = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="border border-zinc-700 bg-zinc-950 p-4 rounded text-sm font-mono relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 to-zinc-700 opacity-30" />
            <div className="text-zinc-500 mb-3 font-semibold tracking-wider text-xs">
                {title}
            </div>
            <div className="space-y-2 text-zinc-300">
                {children}
            </div>
        </div>
    );

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 shadow-xl">
            <div className="mb-5">
                <h2 className="text-xl font-medium text-white">Backend Execution</h2>
                <p className="text-sm text-zinc-400 mt-1">
                    Tracing the request through the Express backend architecture.
                </p>
            </div>

            <div className="flex flex-col">
                
                {/* 1. HTTP REQUEST */}
                {requestReceived && (
                    <Box title="HTTP REQUEST">
                        <div>
                            <span className="text-emerald-400">{requestReceived.method}</span>{" "}
                            <span className="text-white">{requestReceived.path}</span>
                        </div>
                        {bodyReceived && (
                            <div className="mt-2">
                                <div className="text-zinc-500 text-xs">Headers</div>
                                <div>Content-Type: application/json</div>
                                <div className="text-zinc-500 text-xs mt-2">Body</div>
                                <pre className="text-xs text-zinc-400 bg-black p-2 rounded border border-zinc-800 overflow-x-auto">
                                    {JSON.stringify(bodyReceived.body, null, 2)}
                                </pre>
                            </div>
                        )}
                        {!bodyReceived && queryParsed && (
                            <div className="mt-2">
                                <div className="text-zinc-500 text-xs mt-2">Query Parameters</div>
                                <pre className="text-xs text-zinc-400 bg-black p-2 rounded border border-zinc-800 overflow-x-auto">
                                    {JSON.stringify(removeStepField(queryParsed), null, 2)}
                                </pre>
                            </div>
                        )}
                    </Box>
                )}

                <Arrow />

                {/* 2. EXPRESS */}
                {requestReceived && (
                    <Box title="EXPRESS">
                        <div className="flex justify-between">
                            <span>Router matched</span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {requestReceived.method} {requestReceived.path?.split("?")[0]}
                        </div>
                    </Box>
                )}

                <Arrow />

                {/* 3. CONTROLLER */}
                {controllerEvents.length > 0 && (
                    <Box title="CONTROLLER">
                        {controllerEvents.map((evt, idx) => {
                            if (evt.step === "validation" && evt.status === "failed") {
                                return <div key={idx} className="text-red-400">✖ Validation failed: {evt.reason}</div>;
                            }
                            if (evt.step === "validation") return <div key={idx} className="text-emerald-400">✓ validation</div>;
                            if (evt.step === "normalization") return <div key={idx}>• normalization ({evt.field})</div>;
                            if (evt.step === "body_received" || evt.step === "partial_body_received") return <div key={idx}>• req.body parsed</div>;
                            if (evt.step === "query_parameters_parsed") return <div key={idx}>• query params parsed</div>;
                            if (evt.step === "path_parameter_parsed") return <div key={idx}>• path params parsed</div>;
                            if (evt.step === "pagination_calculated") return <div key={idx}>• pagination calculated</div>;
                            return null;
                        })}
                    </Box>
                )}

                <Arrow />

                {/* 4. SERVICE */}
                <Box title="SERVICE">
                    <div className="text-emerald-400">{serviceMethod}</div>
                </Box>

                <Arrow />

                {/* 5. PRISMA */}
                {prismaEvents.length > 0 ? (
                    <Box title="PRISMA">
                        {prismaEvents.map((evt, idx) => {
                            if (evt.status === "active") return null; // Only show completed
                            return (
                                <div key={idx} className="flex justify-between items-start border-l-2 border-indigo-500 pl-3 py-1 mb-2 last:mb-0">
                                    <div>
                                        <div className="text-indigo-400">{evt.operation}</div>
                                        {evt.durationMs !== undefined && (
                                            <div className="text-xs text-zinc-500 mt-1">{evt.durationMs} ms</div>
                                        )}
                                    </div>
                                    <div className="text-xs">
                                        {evt.success !== undefined ? (evt.success ? <span className="text-emerald-500">✓</span> : <span className="text-red-500">✖</span>) : null}
                                        {evt.found !== undefined ? (evt.found ? "found" : "not found") : null}
                                        {evt.rowsReturned !== undefined ? `${evt.rowsReturned} rows` : null}
                                    </div>
                                </div>
                            );
                        })}
                    </Box>
                ) : (
                    <Box title="PRISMA">
                        <div className="text-zinc-600 italic">No database query executed</div>
                    </Box>
                )}

                <Arrow />

                {/* 6. HTTP RESPONSE */}
                {responseSent && (
                    <Box title="HTTP RESPONSE">
                        <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                                String(responseSent.status).startsWith("2") ? "bg-emerald-500/20 text-emerald-400" :
                                String(responseSent.status).startsWith("4") ? "bg-red-500/20 text-red-400" :
                                "bg-zinc-800 text-zinc-300"
                            }`}>
                                {responseSent.status}
                            </div>
                            <span className="text-zinc-400">
                                {responseSent.status === 200 ? "OK" :
                                 responseSent.status === 201 ? "Created" :
                                 responseSent.status === 204 ? "No Content" :
                                 responseSent.status === 400 ? "Bad Request" :
                                 responseSent.status === 404 ? "Not Found" : ""}
                            </span>
                        </div>
                        {responseSent.durationMs !== undefined && (
                            <div className="text-xs text-zinc-500 mt-2">
                                Request duration: {responseSent.durationMs} ms
                            </div>
                        )}
                    </Box>
                )}
            </div>
        </div>
    );
}

function removeStepField(event: TraceEvent) {
    const { step, type, ...rest } = event;
    return rest;
}