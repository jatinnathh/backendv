import { Router } from "express";

import {
  echo,
  methods,
  query,
  params,
  body,
  headers,
  status,
  cookies,
  contentType,
  redirect,
  delay,
  cache,
  corsLab,
  getHttpUsers,
  createHttpUser,
  getHttpUser,
  patchHttpUser,
  putHttpUser,
  deleteHttpUser,
} from "../controllers/http.controller.js";

const router = Router();

router.all("/echo", echo);
router.all("/methods", methods);
router.get("/query", query);
router.get("/params/:id", params);
router.post("/body", body);
router.all("/headers", headers);
router.get("/status/:code", status);
router.all("/cookies", cookies);
router.all("/content-type", contentType);
router.get("/redirect", redirect);
router.get("/delay", delay);
router.get("/cache", cache);

router.options("/cors", corsLab);
router.get("/cors", corsLab);
router.post("/cors", corsLab);

router.get("/users", getHttpUsers);
router.post("/users", createHttpUser);

router.get("/users/:id", getHttpUser);
router.patch("/users/:id", patchHttpUser);
router.put("/users/:id", putHttpUser);
router.delete("/users/:id", deleteHttpUser);

export default router;