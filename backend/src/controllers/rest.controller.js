import { RestService } from "../services/rest.service";
import { createTrace } from "../utils/trace";

// GET /api/rest/v1/users

export async function getUsers(req, res, next) {
    const { trace, add } = createTrace();


    const start = Date.now();

    try {
        add('request received', {
            type: 'SERVER',
            method: req.method,
            path: req.OriginalUrl,
        });

        const page = Math.max(parseInt(req.query.page) || 1, 1);

        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

        const search = req.query.search || undefined;

        const allowedSortFields = [
            'createdAt',
            "name",
            "email",
            'age',

        ];

    } catch {

    }

}