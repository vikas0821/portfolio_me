import { portfolioApi } from "./api/portfolio.mjs";
import { adminApi } from "./api/admin.mjs";
import { notesApi } from "./api/notes.mjs";
import { Router } from "express";

export async function mountRoutes(app, config) {
  const r = Router();

  r.use("/api/v1/portfolio", portfolioApi(config));
  r.use("/api/v1/admin", adminApi(config));
  r.use("/api/v1/notes", notesApi(config));

  r.get("/health", (_req, res) => res.json({ ok: true, service: "portfolio-gateway", ts: new Date().toISOString() }));
  r.get("/", (_req, res) => res.json({ ok: true, service: "portfolio-gateway" }));

  app.use(r);
}
