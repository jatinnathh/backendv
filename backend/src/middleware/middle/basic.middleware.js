import { timeStamp } from "console"

export function basicMiddleware(req, res, next) {
    try {
        req.middlewareData = {
            executed: true,
            timeStamp: new Date().toISOString(),
        };
    }
    catch(err){
        next(err);
    }
    next();
}