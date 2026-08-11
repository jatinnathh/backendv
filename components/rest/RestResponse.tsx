interface ResponseState {
    status: number;
    duration: number;
    headers: Record<string, string>;
    body: any;
}

interface Props {
    response: ResponseState | null;
    error: string | null;
}

export default function RestResponse({
    response,
    error,
}: Props) {

    if (error) {

        return (
            <div className="border border-red-900/50 rounded-xl bg-red-950/20 p-6">

                <h2 className="text-xl font-medium text-red-400">
                    Request Failed
                </h2>

                <p className="text-sm text-red-300 mt-2">
                    {error}
                </p>

            </div>
        );

    }


    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

            <div className="flex items-center justify-between">

                <div>

                    <h2 className="text-xl font-medium">
                        Server Response
                    </h2>

                    <p className="text-sm text-zinc-500 mt-1">
                        Raw response received from Express.
                    </p>

                </div>


                {response && (

                    <div className="flex gap-3">

                        <span
                            className={`
                                px-3 py-1 rounded-full text-xs
                                ${
                                    response.status >= 200 &&
                                    response.status < 300
                                        ? "bg-emerald-950 text-emerald-400"
                                        : response.status >= 400
                                            ? "bg-red-950 text-red-400"
                                            : "bg-zinc-800 text-zinc-300"
                                }
                            `}
                        >
                            HTTP {response.status}
                        </span>


                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs">

                            {response.duration} ms

                        </span>

                    </div>

                )}

            </div>


            {!response && (

                <div className="mt-5 bg-black rounded-lg border border-zinc-800 p-8 text-center text-sm text-zinc-600">

                    // Send a request to see the response

                </div>

            )}


            {response && (

                <div className="mt-5 space-y-5">

                    {/* BODY */}

                    <div>

                        <div className="text-xs text-zinc-500 mb-2">
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

                        <div className="text-xs text-zinc-500 mb-2">
                            RESPONSE HEADERS
                        </div>

                        <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-xs text-zinc-500 overflow-auto max-h-[250px]">
{JSON.stringify(
    response.headers,
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