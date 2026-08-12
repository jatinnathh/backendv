type Props = {
    response: any;
    headers: Record<string, string>;
    duration: number | null;
    error: string | null;
};

export default function MiddlewareResponse({
    response,
    headers,
    duration,
    error,
}: Props) {

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

            <div className="flex items-center justify-between">

                <div>

                    <div className="text-xs text-zinc-600">
                        HTTP RESPONSE
                    </div>

                    <h3 className="text-xl font-medium mt-1">
                        Server Response
                    </h3>

                </div>


                {response && (

                    <div className="flex gap-2">

                        <span
                            className={`
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                ${
                                    response.status >= 200 &&
                                    response.status < 300
                                        ? "bg-emerald-950 text-emerald-400"
                                        : "bg-red-950 text-red-400"
                                }
                            `}
                        >
                            HTTP {response.status}
                        </span>


                        {duration !== null && (

                            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                                {duration} ms
                            </span>

                        )}

                    </div>

                )}

            </div>


            {error && (

                <div className="mt-5 border border-red-900 bg-red-950/20 rounded-lg p-4">

                    <div className="text-red-400 font-medium">
                        Connection Error
                    </div>

                    <p className="text-sm text-red-300 mt-2">
                        {error}
                    </p>

                </div>

            )}


            {response && (

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* BODY */}

                    <div>

                        <div className="text-xs text-zinc-600 mb-2">
                            RESPONSE BODY
                        </div>

                        <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-auto max-h-[400px]">
{typeof response.body === "string"
    ? response.body
    : JSON.stringify(
        response.body,
        null,
        2
    )}
                        </pre>

                    </div>


                    {/* HEADERS */}

                    <div>

                        <div className="text-xs text-zinc-600 mb-2">
                            RESPONSE HEADERS
                        </div>

                        <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400 overflow-auto max-h-[400px]">
{JSON.stringify(
    headers,
    null,
    2
)}
                        </pre>

                    </div>

                </div>

            )}

        </div>
    );
}
