import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.js";
import { sheltersRouter } from "./routes/shelters.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      message: "multi-server beží",
    });
  });

  app.use("/health", healthRouter);
  app.use("/api", sheltersRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Nenájdené" });
  });

  return app;
}
