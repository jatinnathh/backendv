// src/middleware/headers.middleware.js

export function headersMiddleware(req, res, next) {

    res.setHeader(
        "X-Lab-Server",
        "Express"
    );

    res.setHeader(
        "X-Lab-Middleware",
        "enabled"
    );

    res.setHeader(
        "X-Lab-Concept",
        "response-headers"
    );

    next();
}