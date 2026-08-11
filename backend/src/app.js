import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import httpRoutes from './routes/http.routes.js';
import notifyRoutes from './routes/notify.routes.js';
import restRoutes from './routes/rest.routes.js';

import { errorHandler } from './middleware/error.middleware.js';
const app = express();

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'backend-visualizer-api'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/http', httpRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/rest/v1', restRoutes);
app.use(errorHandler)

export default app;
