"use client";

type Props = {
    experiment: any;
    requestBody: any;
    setRequestBody: (value: any) => void;
    loading: boolean;
    onExecute: () => void;
};

export default function MiddlewareExperiment({
    experiment,
    requestBody,
    setRequestBody,
    loading,
    onExecute,
}: Props) {

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

            <div className="flex items-start justify-between">

                <div>

                    <div className="text-xs text-zinc-600">
                        EXPERIMENT
                    </div>

                    <h3 className="text-xl font-medium mt-1">
                        {experiment.title}
                    </h3>

                </div>


                <div className="flex gap-2">

                    <span className="px-3 py-1 rounded-md bg-zinc-800 text-xs">
                        {experiment.method}
                    </span>

                </div>

            </div>


            {/* URL */}

            <div className="mt-6">

                <div className="text-xs text-zinc-600 mb-2">
                    REQUEST URL
                </div>

                <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs break-all">

                    <span className="text-white">
                        {experiment.method}
                    </span>

                    <span className="text-zinc-500 ml-3">
                        http://localhost:8000
                        {experiment.endpoint}
                    </span>

                </div>

            </div>


            {/* BODY */}

            {experiment.method === "POST" && (

                <div className="mt-6">

                    <div className="text-xs text-zinc-600 mb-2">
                        REQUEST BODY
                    </div>

                    <textarea
                        value={JSON.stringify(
                            requestBody,
                            null,
                            2
                        )}
                        onChange={(e) => {

                            try {

                                setRequestBody(
                                    JSON.parse(
                                        e.target.value
                                    )
                                );

                            } catch {

                                // Keep editing text
                            }

                        }}
                        rows={8}
                        className="w-full bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 outline-none resize-none"
                    />

                </div>

            )}


            {/* WHAT THIS TESTS */}

            <div className="mt-6 border border-zinc-800 rounded-lg p-4">

                <div className="text-xs text-zinc-600">
                    WHAT YOU ARE TESTING
                </div>

                <p className="text-sm text-zinc-400 mt-2 leading-6">
                    {experiment.description}
                </p>

            </div>


            {/* EXECUTE */}

            <button
                onClick={onExecute}
                disabled={loading}
                className="w-full mt-6 bg-white text-black rounded-lg p-3 font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >

                {loading
                    ? "Executing real request..."
                    : "Send Real Request"}

            </button>


            <div className="mt-3 text-center">

                <span className="text-xs text-zinc-600">
                    Request goes to Express — no simulated execution
                </span>

            </div>

        </div>
    );
}
