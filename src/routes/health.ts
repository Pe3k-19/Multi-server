import { Router } from "express";
import { env } from "../config/env.js";
import { databaseStatus } from "../db/connection.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "multi-server",
    environment: env.nodeEnv,
    database: databaseStatus(),
  });
});
