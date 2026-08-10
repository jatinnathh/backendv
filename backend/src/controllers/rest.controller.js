import { RestService } from "../services/rest.service.js";
import { createTrace } from "../utils/trace.js";


// GET /api/rest/v1/users

export async function getUsers(req, res, next) {

    const { trace, add } = createTrace();

    const start = Date.now();

    try {

        add("request_received", {
            type: "SERVER",
            method: req.method,
            path: req.originalUrl,
        });


        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit) || 10,
                1
            ),
            100
        );

        const search = req.query.search || undefined;

        const role = req.query.role || undefined;

        const allowedSortFields = [
            "createdAt",
            "name",
            "email",
            "age",
        ];

        const sortBy = allowedSortFields.includes(
            req.query.sortBy
        )
            ? req.query.sortBy
            : "createdAt";

        const order =
            req.query.order === "asc"
                ? "asc"
                : "desc";


        add("query_parameters_parsed", {
            type: "SERVER",
            page,
            limit,
            search,
            role,
            sortBy,
            order,
        });


        add("database_query", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.findMany",
            status: "active",
        });

        const dbStart = Date.now();

        const result =
            await RestService.getUsers({
                page,
                limit,
                search,
                role,
                sortBy,
                order,
            });

        const dbDuration =
            Date.now() - dbStart;


        add("database_query", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.findMany",
            rowsReturned: result.users.length,
            totalRows: result.total,
            durationMs: dbDuration,
        });


        const totalPages =
            Math.ceil(result.total / limit);

        const hasNextPage =
            page < totalPages;

        const hasPreviousPage =
            page > 1;


        add("pagination_calculated", {
            type: "SERVER",
            page,
            limit,
            total: result.total,
            totalPages,
            hasNextPage,
            hasPreviousPage,
        });


        const duration =
            Date.now() - start;


        add("response_sent", {
            type: "SERVER",
            status: 200,
            durationMs: duration,
        });


        return res.status(200).json({

            data: result.users,

            meta: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage,
                hasPreviousPage,

                filters: {
                    search,
                    role,
                },

                sort: {
                    sortBy,
                    order,
                },

                durationMs: duration,
            },

            trace,
        });

    } catch (error) {

        next(error);

    }
}



// GET /api/rest/v1/users/:id

export async function getUserById(req, res, next) {

    const { trace, add } = createTrace();

    try {

        const { id } = req.params;

        add("request_received", {
            type: "SERVER",
            method: "GET",
            path: req.originalUrl,
        });


        add("path_parameter_parsed", {
            type: "SERVER",
            parameter: "id",
            value: id,
        });


        add("database_query", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.findUnique",
            status: "active",
        });


        const dbStart = Date.now();

        const user =
            await RestService.getUserById(id);

        const dbDuration =
            Date.now() - dbStart;


        add("database_query", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.findUnique",
            found: Boolean(user),
            durationMs: dbDuration,
        });


        if (!user) {

            add("response_sent", {
                type: "SERVER",
                status: 404,
            });

            return res.status(404).json({
                error: "User not found",
                trace,
            });
        }


        add("response_sent", {
            type: "SERVER",
            status: 200,
        });


        return res.status(200).json({
            data: user,
            trace,
        });

    } catch (error) {

        next(error);

    }
}



// POST /api/rest/v1/users

export async function createUser(req, res, next) {

    const { trace, add } = createTrace();

    try {

        add("request_received", {
            type: "SERVER",
            method: "POST",
            path: req.originalUrl,
        });


        add("body_received", {
            type: "SERVER",
            body: req.body,
        });


        add("validation", {
            type: "SERVER",
            status: "passed",
        });


        const email =
            req.body.email.trim().toLowerCase();

        add("normalization", {
            type: "SERVER",
            field: "email",
            value: email,
        });


        add("database_insert", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.create",
            status: "active",
        });


        const dbStart = Date.now();

        const user =
            await RestService.createUser({
                name: req.body.name.trim(),
                email,
                age: req.body.age,
                role: req.body.role,
            });

        const dbDuration =
            Date.now() - dbStart;


        add("database_insert", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.create",
            success: true,
            durationMs: dbDuration,
        });


        add("response_sent", {
            type: "SERVER",
            status: 201,
        });


        return res.status(201).json({

            message: "User created",

            data: user,

            trace,

        });

    } catch (error) {

        next(error);

    }
}



// PUT /api/rest/v1/users/:id

export async function replaceUser(req, res, next) {

    const { trace, add } = createTrace();

    try {

        const { id } = req.params;

        add("request_received", {
            type: "SERVER",
            method: "PUT",
            path: req.originalUrl,
        });


        add("path_parameter_parsed", {
            type: "SERVER",
            parameter: "id",
            value: id,
        });


        add("body_received", {
            type: "SERVER",
            body: req.body,
        });


        add("validation", {
            type: "SERVER",
            status: "passed",
            operation: "PUT",
        });


        const existing =
            await RestService.getUserById(id);


        if (!existing) {

            add("response_sent", {
                type: "SERVER",
                status: 404,
            });

            return res.status(404).json({
                error: "User not found",
                trace,
            });
        }


        add("database_update", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.update",
            status: "active",
        });


        const dbStart = Date.now();

        const user =
            await RestService.replaceUser(
                id,
                {
                    name: req.body.name.trim(),
                    email: req.body.email.trim().toLowerCase(),
                    age: req.body.age,
                    role: req.body.role,
                }
            );

        const dbDuration =
            Date.now() - dbStart;


        add("database_update", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.update",
            durationMs: dbDuration,
        });


        add("response_sent", {
            type: "SERVER",
            status: 200,
        });


        return res.status(200).json({
            message: "User replaced",
            data: user,
            trace,
        });

    } catch (error) {

        next(error);

    }
}



// PATCH /api/rest/v1/users/:id

export async function updateUser(req, res, next) {

    const { trace, add } = createTrace();

    try {

        const { id } = req.params;

        add("request_received", {
            type: "SERVER",
            method: "PATCH",
            path: req.originalUrl,
        });


        add("path_parameter_parsed", {
            type: "SERVER",
            parameter: "id",
            value: id,
        });


        add("partial_body_received", {
            type: "SERVER",
            body: req.body,
        });


        const existing =
            await RestService.getUserById(id);


        if (!existing) {

            add("response_sent", {
                type: "SERVER",
                status: 404,
            });

            return res.status(404).json({
                error: "User not found",
                trace,
            });
        }


        const data = {
            ...req.body,
        };


        if (data.email) {
            data.email =
                data.email.trim().toLowerCase();
        }

        if (data.name) {
            data.name =
                data.name.trim();
        }


        add("database_update", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.update",
            status: "active",
        });


        const dbStart = Date.now();

        const user =
            await RestService.updateUser(
                id,
                data
            );

        const dbDuration =
            Date.now() - dbStart;


        add("database_update", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.update",
            durationMs: dbDuration,
        });


        add("response_sent", {
            type: "SERVER",
            status: 200,
        });


        return res.status(200).json({
            message: "User updated",
            data: user,
            trace,
        });

    } catch (error) {

        next(error);

    }
}



// DELETE /api/rest/v1/users/:id
export async function deleteUser(req, res, next) {

    const { trace, add } = createTrace();

    try {

        const { id } = req.params;

        add("request_received", {
            type: "SERVER",
            method: "DELETE",
            path: req.originalUrl,
        });


        add("path_parameter_parsed", {
            type: "SERVER",
            parameter: "id",
            value: id,
        });


        const existing =
            await RestService.getUserById(id);


        if (!existing) {

            add("response_sent", {
                type: "SERVER",
                status: 404,
            });

            return res.status(404).json({
                error: "User not found",
                trace,
            });
        }


        add("database_delete", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.delete",
            status: "active",
        });


        const dbStart = Date.now();

        await RestService.deleteUser(id);

        const dbDuration =
            Date.now() - dbStart;


        add("database_delete", {
            type: "SERVER",
            tool: "Prisma",
            operation: "RestUser.delete",
            durationMs: dbDuration,
        });


        add("response_sent", {
            type: "SERVER",
            status: 204,
        });


        return res.status(204).send();

    } catch (error) {

        next(error);

    }
}