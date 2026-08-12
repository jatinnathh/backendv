export function traceMiddleware(name) {

    return function (req, res, next) {

        if (!req.middlewareTrace) {
            req.middlewareTrace = [];
        }

        const start = performance.now();

        const traceEvent = {
            step: name,
            layer: "middleware",
            event: "entered",
            timestamp: new Date().toISOString(),
        };
        req.middlewareTrace.push(traceEvent);

        res.on("finish", () => {
            const duration = performance.now() - start;
            req.middlewareTrace.push({
                step: name,
                layer: "middleware",
                event: "completed",
                success: true,
                durationMs: Number(duration.toFixed(2)),
            });
        });

        next();
    };
}