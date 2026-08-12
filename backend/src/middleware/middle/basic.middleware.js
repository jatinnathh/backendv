export function basicMiddleware(req, res, next) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "basic", layer: "middleware", event: "completed", success: true });
    
    try {
        req.middlewareData = {
            executed: true,
            timeStamp: new Date().toISOString(),
        };
    }
    catch(err){
        next(err);
        return;
    }
    next();
}