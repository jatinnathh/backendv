export function validateCreateUser(req, res, next) {

    const { name, email, age, role } = req.body;

    const errors = [];

    if (!name || typeof name !== "string") {
        errors.push({
            field: "name",
            message: "name is required and must be a string",
        });
    }

    if (!email || typeof email !== "string") {
        errors.push({
            field: "email",
            message: "email is required and must be a string",
        });
    } else if (!email.includes("@")) {
        errors.push({
            field: "email",
            message: "email must be valid",
        });
    }

    if (age !== undefined && age !== null) {
        if (!Number.isInteger(age)) {
            errors.push({
                field: "age",
                message: "age must be an integer",
            });
        }

        if (age < 0 || age > 150) {
            errors.push({
                field: "age",
                message: "age must be between 0 and 150",
            });
        }
    }

    if (
        role !== undefined &&
        !["USER", "ADMIN", "MODERATOR"].includes(role)
    ) {
        errors.push({
            field: "role",
            message: "invalid role",
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: "Validation failed",
            errors,
        });
    }

    next();
}


export function validatePutUser(req, res, next) {

    const { name, email, age, role } = req.body;

    const errors = [];

    if (!name) {
        errors.push({
            field: "name",
            message: "name is required for PUT",
        });
    }

    if (!email) {
        errors.push({
            field: "email",
            message: "email is required for PUT",
        });
    }

    if (age !== undefined && !Number.isInteger(age)) {
        errors.push({
            field: "age",
            message: "age must be an integer",
        });
    }

    if (!role) {
        errors.push({
            field: "role",
            message: "role is required for PUT",
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: "Validation failed",
            errors,
        });
    }

    next();
}


export function validatePatchUser(req, res, next) {

    const allowedFields = [
        "name",
        "email",
        "age",
        "role",
    ];

    const keys = Object.keys(req.body);

    const invalidFields = keys.filter(
        key => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            error: "Invalid fields",
            invalidFields,
        });
    }

    if (keys.length === 0) {
        return res.status(400).json({
            error: "PATCH body cannot be empty",
        });
    }

    next();
}