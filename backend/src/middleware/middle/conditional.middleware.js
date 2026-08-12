export function conditionalMiddleware(
    req,
    res,
    next
) {
    if (!req.middlewareTrace) req.middlewareTrace = [];

    if (req.query.admin === "true") {
        req.middlewareTrace.push({ step: "conditional", layer: "middleware", event: "completed", success: true });
        next();
    } else {
        req.middlewareTrace.push({ step: "conditional", layer: "middleware", event: "blocked", success: false, status: 403, details: { reason: "admin=true required" } });
        res.status(403).json({
            error: "Forbidden. Admin access required.",
            trace: req.middlewareTrace,
        });
    }
}