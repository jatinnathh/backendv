import { Router } from "express";
import { notifyVisitor } from "../controllers/notify.controller.js";

const router = Router();

router.post("/", notifyVisitor);

export default router;
