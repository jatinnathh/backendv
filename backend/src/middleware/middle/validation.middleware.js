import { type } from "os";

export function validationMiddleware(req, res, next) {
    const { name, age, email } = req.body;
    const errors = []
    if (!name || typeof name !== "string"
        || name.trim() === ''
    ) {
        errors.push("name is required");
    }

    if (age === undefined || typeof age !== Number || age < 0) {
        errors.push("age is required and must be a positive imteger");
    }
    if (errors.lenght>0){
        return res.status(400).json({
            error: 'Validation failes',
            errors,
            trace: [
                {
                    step: 'Validation step ',
                    success: false,
                    errors,
                },
            ],
        });
    }
    req.validateBody = {
        name: name.trim(),
        age,
    };
    next();
}