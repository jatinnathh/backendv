// src/middleware/validation.middleware.js

export function validationMiddleware(
    req,
    res,
    next
) {

    const {
        name,
        age,
    } = req.body;

    const errors = [];


    if (
        !name ||
        typeof name !== "string" ||
        name.trim() === ""
    ) {
        errors.push(
            "name is required"
        );
    }


    if (
        age === undefined ||
        typeof age !== "number" ||
        age < 0
    ) {
        errors.push(
            "age must be a positive number"
        );
    }


    if (errors.length > 0) {

        return res.status(400).json({

            error: "Validation failed",

            errors,

            trace: [
                {
                    step: "validation_middleware",
                    success: false,
                    errors,
                },
            ],

        });
    }


    req.validatedBody = {
        name: name.trim(),
        age,
    };


    next();
}