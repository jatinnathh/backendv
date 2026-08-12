// src/services/middleware.service.js

export function createBasicResult(req) {
    return {
        message: "Middleware executed successfully",
        request: {
            method: req.method,
            path: req.originalUrl,
        },
        middleware: req.middlewareData || {},
    };
}


export function createOrderResult(req) {
    return {
        message: "Middleware execution order",
        executionOrder: req.executionOrder || [],
    };
}


export function createNextResult(req) {
    return {
        message: "next() allowed the request to continue",
        executionOrder: req.executionOrder || [],
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
    };
}


export function createRequestIdResult(req) {
    return {
        message: "Request ID generated",
        requestId: req.requestId,
    };
}


export function createTimingResult(req) {
    return {
        message: "Request timing captured",
        durationMs: req.durationMs ?? null,
    };
}


export function createHeadersResult(req) {
    return {
        message: "Custom response headers were added by middleware",
        headers: {
            "X-Lab-Server": "Express",
            "X-Lab-Middleware": "enabled",
        },
    };
}


export function createAuthResult(req) {
    return {
        message: "Authentication middleware allowed the request",
        user: req.user || null,
    };
}


export function createValidationResult(req) {
    return {
        message: "Validation middleware passed",
        body: req.body,
    };
}


export function createConditionalResult(req) {
    return {
        message: "Conditional middleware allowed the request",
        condition: req.query.admin === "true",
    };
}


export function createParamsResult(req) {
    return {
        message: "Middleware accessed route parameters",
        params: req.params,
    };
}


export function createChainResult(req) {
    return {
        message: "Full middleware chain completed",
        trace: req.middlewareTrace || [],
    };
}