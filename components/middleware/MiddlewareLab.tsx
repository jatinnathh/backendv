"use client";

import { useState } from "react";

import MiddlewareExperiment from "./MiddlewareExperiment";
import MiddlewarePipeline from "./MiddlewarePipeline";
import MiddlewareTrace from "./MiddlewareTrace";
import MiddlewareResponse from "./MiddlewareResponse";
import MiddlewareNotes from "./MiddlewareNotes";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

type Experiment = {
    id: string;
    title: string;
    description: string;
    method: string;
    endpoint: string;
    category: string;
    explanation: string;
};

const experiments: Experiment[] = [
    {
        id: "basic",
        title: "Basic Middleware",
        description:
            "See the simplest Express middleware request pipeline.",
        method: "GET",
        endpoint: "/api/middleware/basic",
        category: "Fundamentals",
        explanation:
            "Middleware receives the request and calls next() so execution continues.",
    },

    {
        id: "order",
        title: "Execution Order",
        description:
            "Observe the exact order in which multiple middleware functions execute.",
        method: "GET",
        endpoint: "/api/middleware/order",
        category: "Fundamentals",
        explanation:
            "Express executes middleware in the order in which it is registered.",
    },

    {
        id: "next",
        title: "next()",
        description:
            "Understand how next() transfers control to the next middleware.",
        method: "GET",
        endpoint: "/api/middleware/next",
        category: "Fundamentals",
        explanation:
            "Calling next() allows Express to continue through the middleware stack.",
    },

    {
        id: "logger",
        title: "Request Logger",
        description:
            "Inspect method, URL, IP and User-Agent captured by middleware.",
        method: "GET",
        endpoint: "/api/middleware/logger",
        category: "Request Processing",
        explanation:
            "Logger middleware can inspect incoming requests before the controller executes.",
    },

    {
        id: "request-id",
        title: "Request ID",
        description:
            "Generate a unique identifier for a request.",
        method: "GET",
        endpoint: "/api/middleware/request-id",
        category: "Request Processing",
        explanation:
            "Request IDs allow logs belonging to the same request to be correlated.",
    },

    {
        id: "timing",
        title: "Request Timing",
        description:
            "Measure how long the request takes to complete.",
        method: "GET",
        endpoint: "/api/middleware/timing",
        category: "Request Processing",
        explanation:
            "Timing middleware can start a timer before the request continues and observe response completion.",
    },

    {
        id: "headers",
        title: "Response Headers",
        description:
            "Watch middleware add headers to the HTTP response.",
        method: "GET",
        endpoint: "/api/middleware/headers",
        category: "Request Processing",
        explanation:
            "Middleware can modify response headers before the response is sent.",
    },

    {
        id: "auth",
        title: "Authentication Middleware",
        description:
            "See middleware protect a route using authentication.",
        method: "GET",
        endpoint: "/api/middleware/auth",
        category: "Protection",
        explanation:
            "Authentication middleware can reject a request before the controller executes.",
    },

    {
        id: "validation",
        title: "Validation Middleware",
        description:
            "Send invalid data and observe middleware reject it.",
        method: "POST",
        endpoint: "/api/middleware/validation",
        category: "Protection",
        explanation:
            "Validation middleware prevents invalid data from reaching application logic.",
    },

    {
        id: "conditional",
        title: "Conditional Middleware",
        description:
            "Change a condition and observe whether the request continues.",
        method: "GET",
        endpoint: "/api/middleware/conditional?admin=true",
        category: "Protection",
        explanation:
            "Middleware can decide whether a request should continue based on request data.",
    },

    {
        id: "params",
        title: "Route Parameters",
        description:
            "See middleware access values from /:id.",
        method: "GET",
        endpoint: "/api/middleware/params/123",
        category: "Request Processing",
        explanation:
            "Middleware has access to req.params, req.query, req.body and req.headers.",
    },

    {
        id: "error",
        title: "Error Middleware",
        description:
            "Trigger a real Express error and watch it reach error middleware.",
        method: "GET",
        endpoint: "/api/middleware/error",
        category: "Errors",
        explanation:
            "Express error middleware uses the special (err, req, res, next) signature.",
    },

    {
        id: "async-error",
        title: "Async Error",
        description:
            "Observe an asynchronous error being forwarded to error handling.",
        method: "GET",
        endpoint: "/api/middleware/async-error",
        category: "Errors",
        explanation:
            "Asynchronous failures must be properly propagated to Express error handling.",
    },

    {
        id: "chain",
        title: "Complete Pipeline",
        description:
            "Observe several real middleware layers working together.",
        method: "GET",
        endpoint: "/api/middleware/chain",
        category: "Advanced",
        explanation:
            "This experiment combines request ID, logging, timing, headers and controller execution.",
    },
];

export default function MiddlewareLab() {

    const [selectedId, setSelectedId] =
        useState("basic");

    const [trace, setTrace] =
        useState<any[]>([]);

    const [response, setResponse] =
        useState<any>(null);

    const [responseHeaders, setResponseHeaders] =
        useState<Record<string, string>>({});

    const [duration, setDuration] =
        useState<number | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [requestBody, setRequestBody] =
        useState<any>({
            name: "Jatin",
            age: 21,
        });

    const selected =
        experiments.find(
            item => item.id === selectedId
        )!;


    async function executeExperiment() {

        setLoading(true);
        setError(null);
        setTrace([]);
        setResponse(null);
        setResponseHeaders({});
        setDuration(null);

        const start =
            performance.now();


        try {

            const options: RequestInit = {
                method: selected.method,

                headers: {
                    "Content-Type":
                        "application/json",
                },

            };


            if (
                selected.method === "POST"
            ) {

                options.body =
                    JSON.stringify(
                        requestBody
                    );

            }


            const res =
                await fetch(
                    `${API_URL}${selected.endpoint}`,
                    options
                );


            const elapsed =
                Math.round(
                    performance.now() - start
                );


            setDuration(elapsed);


            const headers:
                Record<string, string> = {};


            res.headers.forEach(
                (value, key) => {
                    headers[key] = value;
                }
            );


            setResponseHeaders(headers);


            const contentType =
                res.headers.get(
                    "content-type"
                );


            const data =
                contentType?.includes(
                    "application/json"
                )
                    ? await res.json()
                    : await res.text();


            setResponse({
                status: res.status,
                statusText:
                    res.statusText,
                body: data,
            });


            /*
             * IMPORTANT:
             *
             * The visualization ONLY uses
             * trace information returned
             * by the real Express backend.
             */

            if (
                data &&
                Array.isArray(data.trace)
            ) {

                setTrace(data.trace);

            }


        } catch (err) {

            console.error(err);

            setError(
                "Could not connect to the Express backend."
            );

        } finally {

            setLoading(false);

        }
    }


    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            <div className="max-w-[1500px] mx-auto px-6 py-8">

                {/* HEADER */}

                <div className="mb-8">

                    <div className="text-xs uppercase tracking-wider text-zinc-600">
                        Backend Visualizer
                    </div>

                    <h1 className="text-3xl font-semibold mt-2">
                        Middleware Lab
                    </h1>

                    <p className="text-zinc-400 mt-2 max-w-3xl">
                        Learn how Express middleware intercepts,
                        modifies, validates and controls HTTP requests.
                    </p>

                </div>


                {/* EXPERIMENT SELECTOR */}

                <div className="border-b border-zinc-800 mb-8">

                    <div className="flex gap-2 overflow-x-auto pb-3">

                        {experiments.map(
                            experiment => (

                                <button
                                    key={experiment.id}
                                    onClick={() => {
                                        setSelectedId(
                                            experiment.id
                                        );

                                        setTrace([]);
                                        setResponse(null);
                                    }}
                                    className={`
                                        whitespace-nowrap
                                        px-4
                                        py-2
                                        rounded-lg
                                        text-sm
                                        border
                                        transition
                                        ${
                                            selectedId ===
                                            experiment.id
                                                ? "bg-white text-black border-white"
                                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                        }
                                    `}
                                >
                                    {experiment.title}
                                </button>

                            )
                        )}

                    </div>

                </div>


                {/* EXPERIMENT INFO */}

                <div className="mb-6">

                    <div className="text-xs text-zinc-600 uppercase">
                        {selected.category}
                    </div>

                    <h2 className="text-2xl font-medium mt-1">
                        {selected.title}
                    </h2>

                    <p className="text-zinc-500 mt-2">
                        {selected.explanation}
                    </p>

                </div>


                {/* REQUEST + PIPELINE */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <MiddlewareExperiment
                        experiment={selected}
                        requestBody={requestBody}
                        setRequestBody={setRequestBody}
                        loading={loading}
                        onExecute={executeExperiment}
                    />


                    <MiddlewarePipeline
                        trace={trace}
                        loading={loading}
                    />

                </div>


                {/* TRACE */}

                <div className="mt-6">

                    <MiddlewareTrace
                        trace={trace}
                        loading={loading}
                    />

                </div>


                {/* RESPONSE */}

                <div className="mt-6">

                    <MiddlewareResponse
                        response={response}
                        headers={responseHeaders}
                        duration={duration}
                        error={error}
                    />

                </div>


                {/* NOTES */}

                <div className="mt-8">

                    <MiddlewareNotes
                        experiment={selected}
                    />

                </div>

            </div>

        </div>
    );
}
