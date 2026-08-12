export function errorMiddleware(
    err,
    req,
    res,
    next
) {
    console.error("[ERROR]", err);
    const status = err.status || 500;
    const trace = req.middlewareTrace || [];
    trace.push({
        step: "error",
        layer: "middleware",
        event: "completed",
        success: false,
        error: true,
        message: err.message,
        status,
    });

    res.status(status).json({
        error: err.message || "Internal server error",
        trace,
    });
}