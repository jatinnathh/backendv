import { HttpService } from "../services/http.service.js";
import { createTrace } from "../utils/trace.js";

// ─── /api/http/echo — ALL METHODS ───────────────────────────────────────────
export const echo = (req, res) => {
    const { trace, add } = createTrace();
    const start = Date.now();

    add("request_received", { type: "REAL", method: req.method });

    const query = { ...req.query };

    add("query_parsed", { type: "REAL", path: req.path, query });

    const headers = {
        contentType: req.headers["content-type"] || null,
        accept: req.headers["accept"] || null,
        userAgent: req.headers["user-agent"] || null,
        authorization: req.headers["authorization"] ? "[REDACTED]" : null,
        xLabHeader: !!req.headers["x-lab-header"],
    };

    add("headers_read", { type: "REAL" });

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
        body = req.body;
        const contentType = req.headers["content-type"];
        add("body_parsed", {
            type: "REAL",
            parser: contentType?.includes("application/json") ? "express.json()" : "express.text()",
        });
    }

    add("response_created", { type: "REAL", status: 200 });

    res.json({
        request: {
            method: req.method,
            path: req.path,
            query,
            headers,
            body,
        },
        meta: {
            durationMs: Date.now() - start,
        },
        trace,
    });
};

// ─── /api/http/methods ──────────────────────────────────────────────────────
export const methods = async (req, res, next) => {
    const { trace, add } = createTrace();
    const start = Date.now();
    const id = req.query.id;

    add("request_received", { type: "REAL", method: req.method });

    try {
        if (req.method === "GET") {
            if (id) {
                const item = await HttpService.getMethodsUserById(id);
                add("database_query", { type: "REAL", tool: "Prisma", operation: "HttpLabItem.findUnique", found: Boolean(item) });
                if (!item) return res.status(404).json({ error: "Item not found", trace });
                
                return res.json({ method: "GET", action: "READ_ONE", data: item, durationMs: Date.now() - start, trace });
            }

            const items = await HttpService.getMethodsUsers();
            add("database_query", { type: "REAL", tool: "Prisma", operation: "HttpLabItem.findMany", rows: items.length });
            
            return res.json({ method: "GET", action: "READ", data: items, durationMs: Date.now() - start, trace });
        }

        if (req.method === "POST") {
            const body = req.body;
            if (!body.name) return res.status(400).json({ error: "name is required", trace });
            
            add("body_parsed", { type: "REAL" });
            const item = await HttpService.createMethodsUser({ name: body.name, description: body.description });
            
            add("database_insert", { type: "REAL", tool: "Prisma", operation: "HttpLabItem.create" });
            return res.status(201).json({ method: "POST", action: "CREATE", data: item, trace });
        }

        if (req.method === "PUT") {
            if (!id) return res.status(400).json({ error: "id query parameter is required" });
            const body = req.body;
            if (!body.name || body.description === undefined) return res.status(400).json({ error: "PUT requires the complete editable representation" });

            const existing = await HttpService.getMethodsUserById(id);
            if (!existing) return res.status(404).json({ error: "Item not found" });

            const item = await HttpService.updateMethodsUser(id, { name: body.name, description: body.description });
            add("database_update", { type: "REAL", tool: "Prisma", operation: "HttpLabItem.update", strategy: "complete" });
            
            return res.json({ method: "PUT", action: "REPLACE", data: item, trace });
        }

        if (req.method === "PATCH") {
            if (!id) return res.status(400).json({ error: "id query parameter is required" });
            const body = req.body;

            const existing = await HttpService.getMethodsUserById(id);
            if (!existing) return res.status(404).json({ error: "Item not found" });

            const dataToUpdate = {};
            if (body.name !== undefined) dataToUpdate.name = body.name;
            if (body.description !== undefined) dataToUpdate.description = body.description;

            const item = await HttpService.updateMethodsUser(id, dataToUpdate);
            add("database_update", { type: "REAL", tool: "Prisma", operation: "HttpLabItem.update", strategy: "partial" });
            
            return res.json({ method: "PATCH", action: "PARTIAL_UPDATE", data: item, trace });
        }

        if (req.method === "DELETE") {
            if (!id) return res.status(400).json({ error: "id query parameter is required" });

            const existing = await HttpService.getMethodsUserById(id);
            if (!existing) return res.status(404).json({ error: "Item not found" });

            await HttpService.deleteMethodsUser(id);
            add("database_delete", { type: "REAL", tool: "Prisma", operation: "HttpLabItem.delete" });
            
            return res.json({ method: "DELETE", action: "DELETE", deletedId: id, trace });
        }
    } catch (error) {
        next(error);
    }
};

// ─── /api/http/query ──────────────────────────────────────────────────────
export const query = (req, res) => {
    const queryObj = { ...req.query };

    res.json({
        path: req.path,
        query: queryObj,
        examples: {
            search: req.query.search || null,
            page: req.query.page || null,
            limit: req.query.limit || null,
        },
        trace: [
            { step: "request_received", type: "REAL" },
            { step: "query_string_parsed", type: "REAL", count: Object.keys(queryObj).length },
        ],
    });
};

// ─── Placeholder Lab Endpoints ──────────────────────────────────────────────
export const params = (req, res) => {
    res.json({ params: req.params, trace: [{ step: "request_received", type: "REAL" }] });
};

export const body = (req, res) => {
    res.json({ body: req.body, trace: [{ step: "request_received", type: "REAL" }] });
};

export const headers = (req, res) => {
    res.json({ headers: req.headers, trace: [{ step: "request_received", type: "REAL" }] });
};

export const status = (req, res) => {
    const code = parseInt(req.params.code) || 200;
    res.status(code).json({ code, trace: [{ step: "request_received", type: "REAL" }] });
};

export const cookies = (req, res) => {
    res.json({ cookies: req.cookies, trace: [{ step: "request_received", type: "REAL" }] });
};

export const contentType = (req, res) => {
    res.json({ contentType: req.headers["content-type"], trace: [{ step: "request_received", type: "REAL" }] });
};

export const redirect = (req, res) => {
    res.redirect(302, "/api/http/echo");
};

export const delay = (req, res) => {
    setTimeout(() => {
        res.json({ delayed: true, trace: [{ step: "request_received", type: "REAL" }] });
    }, 1000);
};

export const cache = (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({ cached: true, trace: [{ step: "request_received", type: "REAL" }] });
};

export const corsLab = (req, res) => {
    res.json({ cors: "enabled", trace: [{ step: "request_received", type: "REAL" }] });
};

// ─── /api/http/users ────────────────────────────────────────────────────────

export const getHttpUsers = async (req, res, next) => {
    const { trace, add } = createTrace();
    const requestStart = Date.now();

    add("request_received", { method: "GET", path: req.path });
    add("route_matched", { handler: "GET /api/http/users" });
    add("database_query", { status: "active", operation: "HttpLabUser.findMany" });

    try {
        const dbStart = Date.now();
        const users = await HttpService.getHttpUsers();
        const dbDuration = Date.now() - dbStart;

        add("database_query", { operation: "HttpLabUser.findMany", success: true, rowsReturned: users.length, durationMs: dbDuration });
        add("serialization", { format: "JSON" });
        add("response_sent", { status: 200 });

        res.json({ data: users, meta: { count: users.length, durationMs: Date.now() - requestStart }, trace });
    } catch (error) {
        next(error);
    }
};

export const createHttpUser = async (req, res, next) => {
    const { trace, add } = createTrace();
    const requestStart = Date.now();

    try {
        add("request_received", { method: "POST", path: req.path });
        add("headers_parsed", { contentType: req.headers["content-type"] });
        
        const bodyObj = req.body;
        add("body_parsed", { body: bodyObj });

        if (!bodyObj.name || !bodyObj.email) {
            add("validation", { success: false, reason: "name and email are required" });
            return res.status(400).json({ error: "name and email are required", trace });
        }

        add("validation", { success: true });
        const normalizedEmail = bodyObj.email.trim().toLowerCase();

        add("database_query", { status: "active", operation: "HttpLabUser.create" });
        
        const dbStart = Date.now();
        const user = await HttpService.createHttpUser({ name: bodyObj.name.trim(), email: normalizedEmail });
        const dbDuration = Date.now() - dbStart;

        add("database_query", { operation: "HttpLabUser.create", success: true, durationMs: dbDuration });
        add("response_sent", { status: 201 });

        res.status(201).json({ message: "User created", data: user, trace, meta: { durationMs: Date.now() - requestStart } });
    } catch (error) {
        add("error", { message: "Request failed" });
        res.status(500).json({ error: "Request failed", trace });
    }
};

// ─── /api/http/users/:id ────────────────────────────────────────────────────

export const getHttpUser = async (req, res, next) => {
    const { trace, add } = createTrace();
    const id = req.params.id;

    add("request_received", { method: "GET" });
    add("path_parameter", { name: "id", value: id });

    try {
        const dbStart = Date.now();
        const user = await HttpService.getHttpUserById(id);
        add("database_query", { operation: "HttpLabUser.findUnique", found: Boolean(user), durationMs: Date.now() - dbStart });

        if (!user) return res.status(404).json({ error: "User not found", trace });

        add("response_sent", { status: 200 });
        res.json({ data: user, trace });
    } catch (error) {
        next(error);
    }
};

export const patchHttpUser = async (req, res, next) => {
    const { trace, add } = createTrace();
    const id = req.params.id;
    const bodyObj = req.body;

    add("request_received", { method: "PATCH" });
    add("path_parameter", { name: "id", value: id });
    add("body_parsed", { body: bodyObj });

    try {
        const existingUser = await HttpService.getHttpUserById(id);

        if (!existingUser) {
            add("resource_lookup", { found: false });
            return res.status(404).json({ error: "User not found", trace });
        }

        add("resource_lookup", { found: true });
        const dbStart = Date.now();

        const dataToUpdate = {};
        if (bodyObj.name !== undefined) dataToUpdate.name = bodyObj.name.trim();
        if (bodyObj.email !== undefined) dataToUpdate.email = bodyObj.email.trim().toLowerCase();

        const user = await HttpService.updateHttpUser(id, dataToUpdate);
        add("database_update", { operation: "HttpLabUser.update", strategy: "partial", durationMs: Date.now() - dbStart });

        res.json({ message: "User updated", data: user, trace });
    } catch (error) {
        next(error);
    }
};

export const putHttpUser = async (req, res, next) => {
    const { trace, add } = createTrace();
    const id = req.params.id;
    const bodyObj = req.body;

    add("request_received", { method: "PUT" });

    try {
        if (!bodyObj.name || !bodyObj.email) {
            add("validation", { success: false, reason: "PUT requires complete resource" });
            return res.status(400).json({ error: "PUT requires name and email", trace });
        }

        const existingUser = await HttpService.getHttpUserById(id);
        if (!existingUser) return res.status(404).json({ error: "User not found", trace });

        const dbStart = Date.now();
        const user = await HttpService.updateHttpUser(id, { name: bodyObj.name.trim(), email: bodyObj.email.trim().toLowerCase() });
        
        add("database_update", { operation: "HttpLabUser.update", strategy: "complete", durationMs: Date.now() - dbStart });
        res.json({ message: "User replaced", data: user, trace });
    } catch (error) {
        next(error);
    }
};

export const deleteHttpUser = async (req, res, next) => {
    const { trace, add } = createTrace();
    const id = req.params.id;

    add("request_received", { method: "DELETE" });

    try {
        const existingUser = await HttpService.getHttpUserById(id);

        if (!existingUser) {
            add("resource_lookup", { found: false });
            return res.status(404).json({ error: "User not found", trace });
        }

        const dbStart = Date.now();
        await HttpService.deleteHttpUser(id);
        
        add("database_delete", { operation: "HttpLabUser.delete", durationMs: Date.now() - dbStart });
        add("response_sent", { status: 200 });

        res.json({ message: "User deleted", deletedId: id, trace });
    } catch (error) {
        next(error);
    }
};
