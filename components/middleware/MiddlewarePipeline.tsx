type Props = {
    trace: any[];
    loading: boolean;
};

export default function MiddlewarePipeline({
    trace,
    loading,
}: Props) {

    const steps =
        trace.length > 0
            ? trace
            : [
                {
                    step: "Request",
                    event: "waiting",
                },
            ];


    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

            <div className="mb-5">

                <div className="text-xs text-zinc-600">
                    LIVE PIPELINE
                </div>

                <h3 className="text-xl font-medium mt-1">
                    Express Execution
                </h3>

                <p className="text-sm text-zinc-500 mt-1">
                    Only backend-reported events are displayed.
                </p>

            </div>


            <div className="space-y-3">

                {steps.map(
                    (item, index) => {

                        const completed =
                            item.event ===
                            "completed";

                        const failed =
                            item.success ===
                            false ||
                            item.error ===
                            true;


                        return (

                            <div
                                key={index}
                                className="relative"
                            >

                                {index <
                                    steps.length - 1 && (

                                    <div className="absolute left-4 top-10 bottom-[-12px] w-px bg-zinc-800" />

                                )}


                                <div className="flex gap-4">

                                    <div
                                        className={`
                                            relative
                                            z-10
                                            w-8
                                            h-8
                                            rounded-full
                                            border
                                            flex
                                            items-center
                                            justify-center
                                            text-xs
                                            ${
                                                failed
                                                    ? "border-red-700 text-red-400 bg-red-950"
                                                    : completed
                                                        ? "border-emerald-700 text-emerald-400 bg-emerald-950"
                                                        : "border-zinc-700 text-zinc-400 bg-zinc-950"
                                            }
                                        `}
                                    >
                                        {failed
                                            ? "!"
                                            : index + 1}
                                    </div>


                                    <div className="flex-1 border border-zinc-800 rounded-lg bg-zinc-950 p-3">

                                        <div className="flex justify-between">

                                            <span className="text-sm font-medium">
                                                {formatStep(
                                                    item.step
                                                )}
                                            </span>

                                            {item.durationMs !== undefined && (

                                                <span className="text-xs text-zinc-600">
                                                    {item.durationMs} ms
                                                </span>

                                            )}

                                        </div>


                                        {item.event && (

                                            <div className="text-xs text-zinc-600 mt-1">
                                                {item.event}
                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                        );
                    }
                )}

            </div>


            {loading && (

                <div className="mt-5 text-xs text-zinc-500">
                    Waiting for Express response...
                </div>

            )}

        </div>
    );
}


function formatStep(
    value?: string
) {

    if (!value) {
        return "Unknown";
    }

    return value
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );
}
