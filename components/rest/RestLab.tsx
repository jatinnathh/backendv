"use client";

import { useMemo, useState } from "react";

import RestRequestBuilder from "./RestRequestBuilder";
import RestExecutionTrace from "./RestExecutionTrace";
import RestResponse from "./RestResponse";
import RestNotes from "./RestNotes";

type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

type TraceEvent = {
    step?: string;
    type?: string;
    timestamp?: string;
    status?: string | number;
    [key: string]: any;
};

type ResponseState = {
    status: number;
    duration: number;
    headers: Record<string, string>;
    body: any;
} | null;

const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

export default function RestLab() {
    const [method, setMethod] =
        useState<HttpMethod>("GET");

    const [id, setId] =
        useState("");

    const [name, setName] =
        useState("Jatin Nath");

    const [email, setEmail] =
        useState("jatin@restlab.com");

    const [age, setAge] =
        useState("21");

    const [role, setRole] =
        useState("USER");

    const [page, setPage] =
        useState("1");

    const [limit, setLimit] =
        useState("5");

    const [search, setSearch] =
        useState("");

    const [filterRole, setFilterRole] =
        useState("");

    const [sortBy, setSortBy] =
        useState("createdAt");

    const [order, setOrder] =
        useState("desc");

    const [response, setResponse] =
        useState<ResponseState>(null);

    const [trace, setTrace] =
        useState<TraceEvent[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [activeSection, setActiveSection] =
        useState<
            "crud" |
            "pagination" |
            "errors" |
            "concepts"
        >("crud");


    const endpoint = useMemo(() => {

        if (
            method === "GET" &&
            !id
        ) {
            const params = new URLSearchParams();

            params.set("page", page);
            params.set("limit", limit);

            if (search) {
                params.set("search", search);
            }

            if (filterRole) {
                params.set("role", filterRole);
            }

            params.set("sortBy", sortBy);
            params.set("order", order);

            return `${API_URL}/api/rest/v1/users?${params.toString()}`;
        }

        if (id && method !== "POST") {
            return `${API_URL}/api/rest/v1/users/${id}`;
        }

        return `${API_URL}/api/rest/v1/users`;
    }, [
        method,
        id,
        page,
        limit,
        search,
        filterRole,
        sortBy,
        order,
    ]);


    async function executeRequest() {

        setLoading(true);
        setError(null);
        setTrace([]);
        setResponse(null);

        const start =
            performance.now();

        const body =
            method === "POST" ||
            method === "PUT" ||
            method === "PATCH"
                ? {
                    name,
                    email,
                    age:
                        age === ""
                            ? undefined
                            : Number(age),
                    role,
                }
                : undefined;


        try {

            const requestHeaders: Record<string, string> = {};

            if (body) {
                requestHeaders[
                    "Content-Type"
                ] = "application/json";
            }


            const res = await fetch(endpoint, {
                method,

                headers:
                    requestHeaders,

                body:
                    body
                        ? JSON.stringify(body)
                        : undefined,

                credentials: "include",
            });


            const duration =
                Math.round(
                    performance.now() - start
                );


            const headers: Record<string, string> = {};

            res.headers.forEach(
                (value, key) => {
                    headers[key] = value;
                }
            );


            let data: any = null;

            const contentType =
                res.headers.get(
                    "content-type"
                );


            if (
                contentType?.includes(
                    "application/json"
                )
            ) {
                data = await res.json();
            } else {
                data = await res.text();
            }


            setResponse({
                status: res.status,
                duration,
                headers,
                body: data,
            });


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
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">

            {/* HEADER */}

            <div className="mb-8">

                <div className="text-sm text-zinc-500 mb-2">
                    Backend Visualizer / REST APIs
                </div>

                <h1 className="text-3xl font-semibold">
                    REST API Lab
                </h1>

                <p className="text-zinc-400 mt-2 max-w-3xl">
                    Build real REST requests and watch them travel
                    through Express, validation, controllers, services,
                    Prisma and PostgreSQL.
                </p>

            </div>


            {/* NAVIGATION */}

            <div className="border-b border-zinc-800 mb-8">

                <div className="flex gap-6 overflow-x-auto">

                    {[
                        ["crud", "CRUD & Resources"],
                        ["pagination", "Pagination"],
                        ["errors", "Errors & Validation"],
                        ["concepts", "REST Concepts"],
                    ].map(([value, label]) => (

                        <button
                            key={value}
                            onClick={() =>
                                setActiveSection(
                                    value as typeof activeSection
                                )
                            }
                            className={`
                                pb-4
                                text-sm
                                whitespace-nowrap
                                relative
                                transition-colors
                                ${
                                    activeSection === value
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                }
                            `}
                        >

                            {label}

                            {activeSection === value && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                            )}

                        </button>

                    ))}

                </div>

            </div>


            {activeSection === "crud" && (

                <>

                    {/* MAIN EXPERIMENT */}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        <RestRequestBuilder
                            method={method}
                            setMethod={setMethod}

                            id={id}
                            setId={setId}

                            name={name}
                            setName={setName}

                            email={email}
                            setEmail={setEmail}

                            age={age}
                            setAge={setAge}

                            role={role}
                            setRole={setRole}

                            page={page}
                            setPage={setPage}

                            limit={limit}
                            setLimit={setLimit}

                            search={search}
                            setSearch={setSearch}

                            filterRole={filterRole}
                            setFilterRole={setFilterRole}

                            sortBy={sortBy}
                            setSortBy={setSortBy}

                            order={order}
                            setOrder={setOrder}

                            endpoint={endpoint}

                            loading={loading}
                            onExecute={executeRequest}
                        />


                        <div className="space-y-6">

                            <RestExecutionTrace
                                trace={trace}
                                loading={loading}
                            />

                            <RestResponse
                                response={response}
                                error={error}
                            />

                        </div>

                    </div>


                    {/* CONCEPT EXPLANATION */}

                    <div className="mt-8 border border-zinc-800 rounded-xl bg-zinc-900/40 p-6">

                        <h2 className="text-xl font-medium">
                            What actually happened?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

                            {[
                                [
                                    "1",
                                    "HTTP Request",
                                    "Your browser sent a real HTTP request to Express."
                                ],
                                [
                                    "2",
                                    "Express",
                                    "Express matched the route and executed middleware."
                                ],
                                [
                                    "3",
                                    "Service + Prisma",
                                    "The controller called the service which queried PostgreSQL through Prisma."
                                ],
                                [
                                    "4",
                                    "HTTP Response",
                                    "Express returned the actual status code and JSON response."
                                ],
                            ].map(([number, title, description]) => (

                                <div
                                    key={number}
                                    className="border border-zinc-800 rounded-lg p-4 bg-zinc-950"
                                >

                                    <div className="text-xs text-zinc-600">
                                        STEP {number}
                                    </div>

                                    <h3 className="font-medium mt-2">
                                        {title}
                                    </h3>

                                    <p className="text-sm text-zinc-500 mt-2 leading-6">
                                        {description}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                </>

            )}


            {activeSection === "pagination" && (

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                        <h2 className="text-xl font-medium">
                            Pagination Experiment
                        </h2>

                        <p className="text-sm text-zinc-500 mt-1">
                            Observe how page and limit change the database query.
                        </p>

                        <div className="mt-6 space-y-4">

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="text-sm text-zinc-400">
                                        Page
                                    </label>

                                    <input
                                        value={page}
                                        onChange={e =>
                                            setPage(e.target.value)
                                        }
                                        type="number"
                                        min="1"
                                        className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-400">
                                        Limit
                                    </label>

                                    <input
                                        value={limit}
                                        onChange={e =>
                                            setLimit(e.target.value)
                                        }
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 outline-none"
                                    />
                                </div>

                            </div>

                            <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm">

                                <div className="text-zinc-500">
                                    Calculated database window
                                </div>

                                <div className="mt-3">

                                    OFFSET{" "}
                                    <span className="text-white">
                                        {Math.max(
                                            (Number(page) - 1) *
                                            Number(limit),
                                            0
                                        )}
                                    </span>

                                </div>

                                <div>

                                    LIMIT{" "}
                                    <span className="text-white">
                                        {limit || 0}
                                    </span>

                                </div>

                            </div>

                            <button
                                onClick={() => {
                                    setMethod("GET");
                                    setId("");
                                    setTimeout(() => {
                                        executeRequest();
                                    }, 0);
                                }}
                                className="w-full bg-white text-black rounded-lg p-3 font-medium"
                            >
                                Run Pagination Query
                            </button>

                        </div>

                    </div>


                    <RestExecutionTrace
                        trace={trace}
                        loading={loading}
                    />

                </div>

            )}


            {activeSection === "errors" && (

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

                        <h2 className="text-xl font-medium">
                            Break the API
                        </h2>

                        <p className="text-zinc-500 text-sm mt-1">
                            Deliberately send invalid requests and observe
                            how the backend responds.
                        </p>


                        <div className="mt-6 space-y-4">

                            {/* EXPERIMENT 1 */}
                            <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
                                <div className="border-b border-zinc-800 bg-zinc-900/50 p-3 px-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Experiment
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="font-medium text-white">
                                        Missing required fields
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-zinc-500 mb-1">What we're testing:</div>
                                            <div className="text-zinc-300">POST validation</div>
                                        </div>
                                        <div>
                                            <div className="text-zinc-500 mb-1">Expected:</div>
                                            <div className="text-zinc-300">400 Bad Request</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMethod("POST");
                                            setName("");
                                            setEmail("");
                                            setAge("");
                                        }}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg p-2.5 text-sm font-medium transition-colors"
                                    >
                                        Load Experiment
                                    </button>
                                </div>
                            </div>

                            {/* EXPERIMENT 2 */}
                            <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
                                <div className="border-b border-zinc-800 bg-zinc-900/50 p-3 px-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Experiment
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="font-medium text-white">
                                        Invalid email
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-zinc-500 mb-1">What we're testing:</div>
                                            <div className="text-zinc-300">Data normalization</div>
                                        </div>
                                        <div>
                                            <div className="text-zinc-500 mb-1">Expected:</div>
                                            <div className="text-zinc-300">validation failure</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMethod("POST");
                                            setName("Test User");
                                            setEmail("not-an-email");
                                            setAge("21");
                                        }}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg p-2.5 text-sm font-medium transition-colors"
                                    >
                                        Load Experiment
                                    </button>
                                </div>
                            </div>

                            {/* EXPERIMENT 3 */}
                            <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
                                <div className="border-b border-zinc-800 bg-zinc-900/50 p-3 px-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Experiment
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="font-medium text-white">
                                        Request non-existent user
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-zinc-500 mb-1">What we're testing:</div>
                                            <div className="text-zinc-300">GET missing resource</div>
                                        </div>
                                        <div>
                                            <div className="text-zinc-500 mb-1">Expected:</div>
                                            <div className="text-zinc-300">404 Not Found</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMethod("GET");
                                            setId("does-not-exist");
                                        }}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg p-2.5 text-sm font-medium transition-colors"
                                    >
                                        Load Experiment
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-sm text-zinc-500 text-center pt-2">
                                Tip: After loading an experiment, scroll up to the Request Builder and click <strong>Send Request</strong>.
                            </div>

                        </div>

                    </div>


                    <RestResponse
                        response={response}
                        error={error}
                    />

                </div>

            )}


            {activeSection === "concepts" && (

                <RestNotes />

            )}

        </div>
    );
}