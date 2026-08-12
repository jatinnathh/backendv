export function loggerMiddleware(req, res, next) {
    req.requestLog = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
    };
    console.log(`[LOGGER] Request ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
}