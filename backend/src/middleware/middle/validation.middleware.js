export function validationMiddleware(
    req,
    res,
    next
) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    
    const { name, age } = req.body || {};

    const errors = [];

    if (!name || typeof name !== "string") {
        errors.push("name is required and must be a string");
    }

    if (!age || typeof age !== "number" || age < 0) {
        errors.push("age is required and must be a positive number");
    }

    if (errors.length > 0) {
        req.middlewareTrace.push({ step: "validation", layer: "middleware", event: "blocked", success: false, status: 400, details: { errors } });
        return res.status(400).json({
            error: "Validation failed",
            details: errors,
            trace: req.middlewareTrace,
        });
    }

    req.middlewareTrace.push({ step: "validation", layer: "middleware", event: "completed", success: true });
    next();
}