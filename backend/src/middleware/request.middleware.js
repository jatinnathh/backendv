import crypto from 'crypto';

export function requestMiddleware(req, res, next) {
    const requestId = crypto.randomUUID();

    req.requestId = requestId;

    res.setHeader('x-request-id',requestId);
    next();
}