import jwt from 'jsonwebtoken'

export function authorization(req, res, next) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    
    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
        req.middlewareTrace.push({ step: "auth", layer: "middleware", event: "blocked", success: false, status: 401, details: { reason: 'missing bearer token' } });
        return res.status(401).json({
            error: "Authentication required",
            trace: req.middlewareTrace,
        });
    }

    const token = authorizationHeader.slice(7);

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = payload;
        req.middlewareTrace.push({ step: "auth", layer: "middleware", event: "completed", success: true });
        next();
    } catch (error) {
        req.middlewareTrace.push({ step: "auth", layer: "middleware", event: "blocked", success: false, status: 401, details: { reason: 'JWT verification failed' } });
        return res.status(401).json({
            error: 'Invalid or expired Token',
            trace: req.middlewareTrace,
        });
    }
}