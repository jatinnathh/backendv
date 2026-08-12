// src/controllers/middleware.controller.js

import {
    createBasicResult,
    createOrderResult,
    createNextResult,
    createLoggerResult,
    createRequestIdResult,
    createTimingResult,
    createHeadersResult,
    createAuthResult,
    createValidationResult,
    createConditionalResult,
    createParamsResult,
    createChainResult,
} from "../services/middleware.service.js";

function addControllerTrace(req) {
    if (!req.middlewareTrace) req.middlewareTrace = [];
    req.middlewareTrace.push({
        step: "controller",
        layer: "controller",
        event: "completed",
        success: true
    });
}


export function basic(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createBasicResult(req)
    );
}


export function order(req, res) {
    req.executionOrder.push("Controller");
    addControllerTrace(req);
    res.status(200).json(
        createOrderResult(req)
    );
}


export function nextDemo(req, res) {
    req.executionOrder.push("Controller");
    addControllerTrace(req);
    res.status(200).json(
        createNextResult(req)
    );
}


export function logger(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createLoggerResult(req)
    );
}


export function requestId(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createRequestIdResult(req)
    );
}


export function timing(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createTimingResult(req)
    );
}


export function headers(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createHeadersResult(req)
    );
}


export function auth(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createAuthResult(req)
    );
}


export function validation(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createValidationResult(req)
    );
}


export function conditional(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createConditionalResult(req)
    );
}


export function params(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createParamsResult(req)
    );
}


export function error(req, res) {
    addControllerTrace(req);
    const err = new Error("Intentional middleware lab error");
    err.status = 500;
    throw err;
}


export async function asyncError(req, res, next) {
    addControllerTrace(req);
    try {
        await Promise.reject(new Error("Intentional async error"));
    } catch (error) {
        next(error);
    }
}


export function chain(req, res) {
    addControllerTrace(req);
    res.status(200).json(
        createChainResult(req)
    );
}