import { Router } from 'express';

import {
    register,
    login,
    logout,
    refresh,
    protectedRoute,
    generateLabToken,
    timingLab,
    seedLab
} from "../controllers/auth.controller.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/protected', protectedRoute);

router.post("/lab/token", generateLabToken);
router.post("/lab/timing", timingLab);
router.get("/lab/seed", seedLab);

export default router;