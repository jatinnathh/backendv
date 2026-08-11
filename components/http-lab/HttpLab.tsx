import React, { useState, useEffect } from "react";
import { HTTP_LABS } from "../../lib/http/labs";
import { sendHttpRequest, HttpRequestOptions, HttpResponse } from "../../lib/http/api";

import { CurriculumSidebar } from "./curriculum/CurriculumSidebar";
import { RequestBuilder } from "./experiment/RequestBuilder";
import { SendButton } from "./experiment/SendButton";
import { TraceTimeline } from "./visualize/TraceTimeline";
import { RawHttpViewer } from "./inspect/RawHttpViewer";

type Tab = "LEARN" | "EXPERIMENT" | "INSPECT" | "NOTES";

export const HttpLab = () => {
    const [activeLabId, setActiveLabId] = useState(HTTP_LABS[0].id);
    const activeLab = HTTP_LABS.find(l => l.id === activeLabId) || HTTP_LABS[0];

    const [activeTab, setActiveTab] = useState<Tab>("LEARN");

    const [request, setRequest] = useState<HttpRequestOptions>({
        method: activeLab.experiment.defaultMethod,
        path: activeLab.experiment.endpoint,
        query: activeLab.experiment.defaultQuery || {},
        headers: activeLab.experiment.defaultHeaders || {},
        body: activeLab.experiment.defaultBody || "",
    });

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<HttpResponse | null>(null);

    // Reset request when switching labs
    useEffect(() => {
        setRequest({
            method: activeLab.experiment.defaultMethod,
            path: activeLab.experiment.endpoint,
            query: activeLab.experiment.defaultQuery || {},
            headers: activeLab.experiment.defaultHeaders || {},
            body: activeLab.experiment.defaultBody || "",
        });
        setResponse(null);
        setActiveTab("LEARN"); // Go back to learn when switching labs
    }, [activeLabId]);

    const handleSend = async () => {
        setLoading(true);
        try {
            const res = await sendHttpRequest(request);
            setResponse(res);
            // Automatically switch to Inspect tab to see the result
            setActiveTab("INSPECT");
        } catch (error) {
            console.error("Failed to send request:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <CurriculumSidebar 
                activeLab={activeLabId} 
                onSelect={setActiveLabId} 
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
                {/* Top Navigation */}
                <div className="flex items-center space-x-1 p-4 border-b border-neutral-800 bg-neutral-950">
                    {(["LEARN", "EXPERIMENT", "INSPECT", "NOTES"] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 text-sm font-bold tracking-widest rounded transition-colors ${
                                activeTab === tab 
                                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" 
                                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 border border-transparent"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto w-full">
                        
                        {/* LEARN TAB */}
                        {activeTab === "LEARN" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase mb-2">
                                        {activeLab.categoryId.replace("-", " ")}
                                    </h2>
                                    <h1 className="text-4xl font-bold text-white mb-4">{activeLab.learn.title}</h1>
                                    <p className="text-xl text-neutral-400">{activeLab.learn.description}</p>
                                </div>

                                <div className="prose prose-invert prose-lg max-w-none text-neutral-300">
                                    {activeLab.learn.explanation.split('\n').map((line, i) => {
                                        if (line.startsWith('### ')) return <h3 key={i} className="text-white font-semibold mt-8 mb-4">{line.replace('### ', '')}</h3>;
                                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-neutral-600">{line.replace('- ', '')}</li>;
                                        if (line.trim() === '') return <br key={i} />;
                                        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
                                        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="mb-4 leading-relaxed" />;
                                    })}
                                </div>

                                {activeLab.learn.commonMistakes && (
                                    <div className="mt-12 bg-red-950/20 border border-red-900/50 rounded-xl p-6">
                                        <h3 className="flex items-center text-red-400 font-bold mb-4 tracking-widest uppercase text-sm">
                                            <span className="mr-2">⚠</span> Common Mistakes
                                        </h3>
                                        <ul className="space-y-3">
                                            {activeLab.learn.commonMistakes.map((mistake, i) => (
                                                <li key={i} className="text-red-200/80 flex items-start">
                                                    <span className="text-red-500 mr-3 mt-1">✕</span>
                                                    {mistake}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EXPERIMENT TAB */}
                        {activeTab === "EXPERIMENT" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Experiment</h1>
                                    <p className="text-neutral-400">Configure your HTTP request below.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                                        <RequestBuilder 
                                            request={request} 
                                            setRequest={setRequest} 
                                            lab={activeLab.experiment} 
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-6">
                                            <h3 className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-4">Try It</h3>
                                            <ol className="space-y-3 text-sm text-blue-200/80">
                                                {activeLab.experiment.tryItSteps.map((step, i) => (
                                                    <li key={i} className="flex">
                                                        <span className="text-blue-500 font-mono mr-2">{i+1}.</span>
                                                        {step}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        <SendButton 
                                            loading={loading} 
                                            onClick={handleSend} 
                                            method={request.method} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INSPECT TAB */}
                        {activeTab === "INSPECT" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Inspect Execution</h1>
                                    <p className="text-neutral-400">See exactly how your request was handled.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h2 className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Request Lifecycle</h2>
                                        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-[500px] overflow-y-auto">
                                            {response ? (
                                                <TraceTimeline trace={response.trace || []} />
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-neutral-500 italic">
                                                    Send a request to see the execution trace
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-sm font-bold text-neutral-500 tracking-widest uppercase">Raw HTTP</h2>
                                        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-[500px] overflow-y-auto">
                                            <RawHttpViewer request={request} response={response} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NOTES TAB */}
                        {activeTab === "NOTES" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Study Notes</h1>
                                    <p className="text-neutral-400">{activeLab.notes.summary}</p>
                                </div>

                                {activeLab.notes.sections.map((section, idx) => (
                                    <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">{section.title}</h2>
                                        <pre className="text-neutral-300 font-mono text-sm whitespace-pre-wrap">{section.content}</pre>
                                    </div>
                                ))}

                                <div className="mt-12">
                                    <h3 className="text-sm font-bold text-neutral-500 tracking-widest uppercase mb-4">Interview Questions</h3>
                                    <div className="space-y-4">
                                        {activeLab.notes.interviewQuestions.map((q, i) => (
                                            <div key={i} className="flex items-start bg-neutral-900/50 p-4 rounded-lg">
                                                <span className="text-neutral-500 font-bold mr-4">Q.</span>
                                                <span className="text-neutral-200">{q}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};
