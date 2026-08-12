// src/services/middleware.service.js

export function createBasicResult(req) {
    return {
        message: "Middleware executed successfully",
        request: {
            method: req.method,
            path: req.originalUrl,
        },
        middleware: req.middlewareData || {},
        trace: req.middlewareTrace || [],
    };
}


export function createOrderResult(req) {
    return {
        message: "Middleware execution order",
        executionOrder: req.executionOrder || [],
        trace: req.middlewareTrace || [],
    };
}


export function createNextResult(req) {
    return {
        message: "next() allowed the request to continue",
        executionOrder: req.executionOrder || [],
        trace: req.middlewareTrace || [],
    };
}


export function createLoggerResult(req) {
    return {
        message: "Request information captured by middleware",
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        },
        trace: req.middlewareTrace || [],
    };
}


export function createRequestIdResult(req) {
    return {
        message: "Request ID generated",
        requestId: req.requestId,
        trace: req.middlewareTrace || [],
    };
}


export function createTimingResult(req) {
    return {
        message: "Request timing captured",
        durationMs: req.durationMs ?? null,
        trace: req.middlewareTrace || [],
    };
}


export function createHeadersResult(req) {
    return {
        message: "Custom response headers were added by middleware",
        headers: {
            "X-Lab-Server": "Express",
            "X-Lab-Middleware": "enabled",
        },
        trace: req.middlewareTrace || [],
    };
}


export function createAuthResult(req) {
    return {
        message: "Authentication middleware allowed the request",
        user: req.user || null,
        trace: req.middlewareTrace || [],
    };
}


export function createValidationResult(req) {
    return {
        message: "Validation middleware passed",
        body: req.body,
        trace: req.middlewareTrace || [],
    };
}


export function createConditionalResult(req) {
    return {
        message: "Conditional middleware allowed the request",
        condition: req.query.admin === "true",
        trace: req.middlewareTrace || [],
    };
}


export function createParamsResult(req) {
    return {
        message: "Middleware accessed route parameters",
        params: req.params,
        trace: req.middlewareTrace || [],
    };
}


export function createChainResult(req) {
    return {
        message: "Full middleware chain completed",
        trace: req.middlewareTrace || [],
    };
}