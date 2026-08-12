export function timingMiddleware(req, res, next) {
    const start = performance.now();

    res.on('finish', () => {
        const duration = performance.now() - start;
        res.durationMs = Number(duration.toFixed(2));
        console.log(
            `[TIMING] ${req.method} ${req.originalUrl} ${res.durationMs} ms`
        );
    });
    next()
}