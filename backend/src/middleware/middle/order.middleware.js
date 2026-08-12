export function orderA(req, res, next) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "orderA", layer: "middleware", event: "completed", success: true });
    
    if (!req.executionOrder) {
        req.executionOrder = [];
    }
    req.executionOrder.push("A");
    next();
}

export function orderB(req, res, next) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "orderB", layer: "middleware", event: "completed", success: true });
    req.executionOrder.push("B");
    next();
}

export function orderC(req, res, next) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({ step: "orderC", layer: "middleware", event: "completed", success: true });
    req.executionOrder.push("C");
    next();
}