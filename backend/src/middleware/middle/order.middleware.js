export function orderA(req, res, next) {
    if (!req.executionOrder) {
        req.executionOrder = [];
    }
    req.executionOrder.push('MiddleWare A');
    next();
}
export function orderB(req, res, next) {
    req.executionOrder.push('MiddleWare B');
    next();
}

export function orderC(req, res, next) {
    req.executionOrder.push('MiddleWare C');
    next();
}

export function orderControllerMarker(req, res, next) {
    req.executionOrder.push("Controller");
    next(); 
}