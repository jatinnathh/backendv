import React from "react";
import { CheckCircle2, XCircle, Clock, Database, Code, Search, Settings } from "lucide-react";

interface TraceStep {
    step: string;
    type?: "REAL" | "MOCK";
    status?: "active" | "completed" | "failed";
    operation?: string;
    success?: boolean;
    durationMs?: number;
    [key: string]: any;
}

export const TraceTimeline = ({ trace = [] }: { trace: TraceStep[] }) => {
    if (!trace || trace.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-neutral-500 border border-neutral-800 rounded-lg bg-neutral-900/50">
                <Clock className="w-8 h-8 mb-3 opacity-50" />
                <p>No trace data available.</p>
                <p className="text-sm opacity-70">Send a request to see the execution trace.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4 p-4 border border-neutral-800 rounded-lg bg-neutral-900/50 font-mono text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
                <span className="text-neutral-400 font-semibold tracking-wider text-xs">EXECUTION TRACE</span>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Real Backend Execution</span>
            </div>

            {trace.map((step, index) => {
                const isError = step.success === false || step.status === "failed";
                const Icon = isError ? XCircle : CheckCircle2;
                
                return (
                    <div key={index} className="flex flex-col pb-4 relative">
                        {/* Connecting line */}
                        {index < trace.length - 1 && (
                            <div className="absolute left-2 top-6 bottom-[-16px] w-0.5 bg-neutral-800 z-0"></div>
                        )}
                        
                        <div className="flex items-start z-10">
                            <div className="mt-0.5 mr-3 bg-neutral-900 rounded-full">
                                <Icon className={`w-4 h-4 ${isError ? "text-red-500" : "text-green-500"}`} />
                            </div>
                            
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium capitalize ${isError ? "text-red-400" : "text-neutral-200"}`}>
                                        {step.step.replace(/_/g, " ")}
                                    </span>
                                    {step.durationMs !== undefined && (
                                        <span className="text-xs text-neutral-500">{step.durationMs}ms</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center space-x-2 mt-1 text-xs text-neutral-500">
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                        {step.type || "REAL"}
                                    </span>
                                    
                                    {step.operation && (
                                        <span className="flex items-center space-x-1">
                                            <Database className="w-3 h-3" />
                                            <span>{step.operation}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Extra metadata payload */}
                                {Object.keys(step).filter(k => !["step", "type", "status", "success", "durationMs", "operation", "timestamp"].includes(k)).length > 0 && (
                                    <div className="mt-2 p-2 bg-neutral-950 rounded border border-neutral-800 text-xs overflow-x-auto text-neutral-400">
                                        <pre>{JSON.stringify(Object.fromEntries(
                                            Object.entries(step).filter(([k]) => !["step", "type", "status", "success", "durationMs", "operation", "timestamp"].includes(k))
                                        ), null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
