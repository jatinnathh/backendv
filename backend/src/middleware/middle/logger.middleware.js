export function loggerMiddleware(req, res, next) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "logger", layer: "middleware", event: "completed", success: true });

    console.log(
        `[LOGGER] ${req.method} ${req.originalUrl}`
    );
    next();
}