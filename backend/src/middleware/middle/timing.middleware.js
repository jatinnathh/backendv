export function timingMiddleware(req, res, next) {
    const start = performance.now();
    
    if (!req.middlewareTrace) req.middlewareTrace = [];
    const traceEvent = { step: "timing", layer: "middleware", event: "completed", success: true };
    req.middlewareTrace.push(traceEvent);

    res.on('finish', () => {
        const duration = performance.now() - start;
        res.durationMs = Number(duration.toFixed(2));
        traceEvent.durationMs = res.durationMs; // Update the trace with duration when done
        console.log(
            `[TIMING] ${req.method} ${req.originalUrl} ${res.durationMs} ms`
        );
    });
    next();
}