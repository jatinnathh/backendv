type Props = {
    trace: any[];
    loading: boolean;
};

export default function MiddlewareTrace({
    trace,
    loading,
}: Props) {

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

            <div className="flex justify-between items-start">

                <div>

                    <div className="text-xs text-zinc-600">
                        RAW BACKEND TRACE
                    </div>

                    <h3 className="text-xl font-medium mt-1">
                        What Express Actually Reported
                    </h3>

                </div>

            </div>


            {loading && (

                <div className="mt-5 p-4 rounded-lg bg-black border border-zinc-800 text-sm text-zinc-500">
                    Waiting for real backend response...
                </div>

            )}


            {!loading &&
                trace.length === 0 && (

                    <div className="mt-5 p-8 rounded-lg border border-dashed border-zinc-800 text-center text-sm text-zinc-600">

                        Send the request to see actual
                        middleware execution data.

                    </div>

                )}


            {trace.length > 0 && (

                <div className="mt-5">

                    <pre className="bg-black border border-zinc-800 rounded-lg p-5 text-xs text-zinc-400 overflow-auto max-h-[500px]">
{JSON.stringify(
    trace,
    null,
    2
)}
                    </pre>

                </div>

            )}

        </div>
    );
}
