export function conditionalMiddleware(
    req,
    res,
    next
) {

    const isAdmin = req.body.admin === 'true';

    if (!isAdmin) {
        return res.status(403).json({
            error: 'conditional middleware blocked the request ',
            trace: [
                {
                    step: 'conditional_middlware',
                    success: false,
                    result: 'blocked',
                },
            ],
        });
    }

    req.middlewareData = {
        condition: 'admin===true',
        result: 'passed',
    };

    next();
}