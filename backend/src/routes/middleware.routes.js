// src/routes/middleware.routes.js

import express from "express";

import {
    basic,
    order,
    nextDemo,
    logger,
    requestId,
    timing,
    headers,
    auth,
    validation,
    conditional,
    params,
    error,
    asyncError,
    chain,
} from "../controllers/middleware.controller.js";


import {
    basicMiddleware,
} from "../middleware/middle/basic.middleware.js";


import {
    orderA,
    orderB,
    orderC,
} from "../middleware/middle/order.middleware.js";


import {
    loggerMiddleware,
} from "../middleware/middle/logger.middleware.js";


import {
    requestMiddleware as requestIdMiddleware,
} from "../middleware/middle/requestId.middleware.js";


import {
    timingMiddleware,
} from "../middleware/middle/timing.middleware.js";


import {
    headersMiddleware,
} from "../middleware/middle/headers.middleware.js";


import {
    authorization as authMiddleware,
} from "../middleware/middle/authorization.middleware.js";


import {
    validationMiddleware,
} from "../middleware/middle/validation.middleware.js";


import {
    conditionalMiddleware,
} from "../middleware/middle/conditional.middleware.js";


import {
    traceMiddleware,
} from "../middleware/middle/trace.middleware.js";


const router =
    express.Router();


// ==========================================
// BASIC
// ==========================================

router.get(
    "/basic",
    basicMiddleware,
    basic
);


// ==========================================
// ORDER
// ==========================================

router.get(
    "/order",
    orderA,
    orderB,
    orderC,
    order
);


// ==========================================
// NEXT
// ==========================================

router.get(
    "/next",
    orderA,
    orderB,
    nextDemo
);


// ==========================================
// LOGGER
// ==========================================

router.get(
    "/logger",
    loggerMiddleware,
    logger
);


// ==========================================
// REQUEST ID
// ==========================================

router.get(
    "/request-id",
    requestIdMiddleware,
    requestId
);


// ==========================================
// TIMING
// ==========================================

router.get(
    "/timing",
    timingMiddleware,
    timing
);


// ==========================================
// HEADERS
// ==========================================

router.get(
    "/headers",
    headersMiddleware,
    headers
);


// ==========================================
// AUTH
// ==========================================

router.get(
    "/auth",
    authMiddleware,
    auth
);


// ==========================================
// VALIDATION
// ==========================================

router.post(
    "/validation",
    validationMiddleware,
    validation
);


// ==========================================
// CONDITIONAL
// ==========================================

router.get(
    "/conditional",
    conditionalMiddleware,
    conditional
);


// ==========================================
// PARAMS
// ==========================================

router.get(
    "/params/:id",
    (req, res, next) => {

        req.middlewareData = {
            paramId: req.params.id,
        };

        next();

    },

    params
);


// ==========================================
// ERROR
// ==========================================

router.get(
    "/error",
    error
);


// ==========================================
// ASYNC ERROR
// ==========================================

router.get(
    "/async-error",
    asyncError
);


// ==========================================
// FULL CHAIN
// ==========================================

router.get(
    "/chain",

    traceMiddleware(
        "request_id"
    ),

    requestIdMiddleware,

    traceMiddleware(
        "logger"
    ),

    loggerMiddleware,

    traceMiddleware(
        "timing"
    ),

    timingMiddleware,

    traceMiddleware(
        "headers"
    ),

    headersMiddleware,

    chain
);


export default router;  