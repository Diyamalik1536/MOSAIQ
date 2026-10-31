import express from "express";
import process from "node:process";
import analyticsRouter from "./routes/analytics.js";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set((process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",").map((origin) => origin.trim()).filter(Boolean));
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ error: "This application origin is not allowed." });
    if (origin) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "64kb", strict: true }));
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/analytics", analyticsRouter);
  app.use((_req, res) => res.status(404).json({ error: "API route not found." }));
  app.use((error, _req, res, next) => {
    void next;
    if (error?.type === "entity.too.large") return res.status(413).json({ error: "Request body is too large." });
    if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "Request body must contain valid JSON." });
    return res.status(500).json({ error: "The request could not be completed." });
  });
  return app;
}
