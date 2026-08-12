export function headersMiddleware(req, res, next) {
    res.setHeader("X-Lab-Server", "Express");
    res.setHeader("X-Lab-Middleware", "enabled");

    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "headers", layer: "middleware", event: "completed", success: true });

    next();
}