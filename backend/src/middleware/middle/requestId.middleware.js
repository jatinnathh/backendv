import crypto from 'crypto';

export function requestMiddleware(req, res, next) {
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "request_id", layer: "middleware", event: "completed", success: true, details: { requestId } });

    next();
}