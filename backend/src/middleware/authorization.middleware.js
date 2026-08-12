import jwt from 'jsonwebtoken'

export function authorization(req, res, next) {
    const authorization = req.heards.authorization
    if (!authorization || !authorization.startswith("Bearer")) {
        return res.status(401).json({
            error: "Authentication required",
            trace: [
                {
                    step: 'Authorization step ',
                    success: false,
                    reason: 'missing bearer token '
                },
            ],
        });

    }

    const toke = authorization.slice(7);

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = payload;
        next();

    } catch (error) {

        return res.status(401).json({
            error: 'Invalid or expired Token ',
            trace: [
                {
                    step: 'auth_middleware',
                    success: false,
                    reason: 'JWT berification Failed'

                },
            ],
        });
    }
}