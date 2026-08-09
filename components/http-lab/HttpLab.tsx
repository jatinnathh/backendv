import React, { useState, useEffect } from "react";
import { HTTP_LABS } from "../../lib/http/labs";
import { sendHttpRequest, HttpRequestOptions, HttpResponse } from "../../lib/http/api";

import { LabSelector } from "./LabSelector";
import { LabExplanation } from "./LabExplanation";
import { RequestBuilder } from "./RequestBuilder";
import { SendButton } from "./SendButton";
import { TraceTimeline } from "./TraceTimeline";
import { RawHttpViewer } from "./RawHttpViewer";

export const HttpLab = () => {
    const [activeLabId, setActiveLabId] = useState(HTTP_LABS[0].id);
    const activeLab = HTTP_LABS.find(l => l.id === activeLabId) || HTTP_LABS[0];

    const [request, setRequest] = useState<HttpRequestOptions>({
        method: activeLab.defaultMethod,
        path: activeLab.endpoint,
        query: activeLab.defaultQuery || {},
        headers: activeLab.defaultHeaders || {},
        body: activeLab.defaultBody || "",
    });

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<HttpResponse | null>(null);

    // Reset request when switching labs
    useEffect(() => {
        setRequest({
            method: activeLab.defaultMethod,
            path: activeLab.endpoint,
            query: activeLab.defaultQuery || {},
            headers: activeLab.defaultHeaders || {},
            body: activeLab.defaultBody || "",
        });
        setResponse(null);
    }, [activeLabId]);

    const handleSend = async () => {
        setLoading(true);
        try {
            const res = await sendHttpRequest(request);
            setResponse(res);
        } catch (error) {
            console.error("Failed to send request:", error);
            // Optional: set some error response state here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <LabSelector 
                labs={HTTP_LABS} 
                activeLab={activeLabId} 
                onSelect={setActiveLabId} 
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <LabExplanation lab={activeLab} />

                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT PANEL: Request Builder */}
                    <div className="w-1/3 flex flex-col border-r border-neutral-800 bg-neutral-950 p-6 overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Request Builder</h2>
                        </div>
                        
                        <div className="flex-1">
                            <RequestBuilder 
                                request={request} 
                                setRequest={setRequest} 
                                lab={activeLab} 
                            />
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-neutral-800">
                            <SendButton 
                                loading={loading} 
                                onClick={handleSend} 
                                method={request.method} 
                            />
                        </div>
                    </div>

                    {/* MIDDLE PANEL: Lifecycle & Trace */}
                    <div className="w-1/3 flex flex-col border-r border-neutral-800 bg-[#0a0a0a] p-6 overflow-y-auto">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold">Request Lifecycle</h2>
                        </div>
                        
                        <TraceTimeline trace={response?.trace || []} />
                    </div>

                    {/* RIGHT PANEL: RAW */}
                    <div className="w-1/3 flex flex-col bg-[#0a0a0a] p-6 overflow-y-auto">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold">Raw HTTP</h2>
                        </div>

                        <RawHttpViewer request={request} response={response} />
                    </div>
                </div>
            </div>
        </div>
    );
};
