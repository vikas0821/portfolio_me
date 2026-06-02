"use strict";

import { Router } from "express";
import { handleAdminOperation } from "../../domain/controller/handlers.mjs";
import { adminAuth, signAdminToken } from "../../middlewares/adminAuth.mjs";

export function adminApi(_config) {
  const r = Router();

  const act = (subCmd, payload = {}) =>
    handleAdminOperation({ subCmd, ...payload });

  // ── Auth ─────────────────────────────────────────────────────────────────

  r.post("/login", (req, res) => {
    const { password } = req.body;
    if (!password || password !== _config.admin.password) {
      return res.status(401).json({ responseCode: "401", responseMessage: "Invalid password" });
    }
    const token = signAdminToken(_config.admin.jwtSecret);
    res.json({ responseCode: "00", token });
  });

  // All routes below require admin JWT
  r.use(adminAuth);

  // ── Profile ───────────────────────────────────────────────────────────────

  r.get("/profile", async (req, res) => {
    try {
      res.json(await act("getProfile"));
    } catch (e) { handleErr(res, e); }
  });

  r.put("/profile", async (req, res) => {
    try {
      res.json(await act("updateProfile", { data: req.body }));
    } catch (e) { handleErr(res, e); }
  });

  // ── Skills ────────────────────────────────────────────────────────────────

  r.get("/skills", async (req, res) => {
    try { res.json(await act("getSkills")); } catch (e) { handleErr(res, e); }
  });

  r.post("/skills", async (req, res) => {
    try { res.json(await act("saveSkill", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  r.put("/skills/:id", async (req, res) => {
    try { res.json(await act("saveSkill", { data: { _id: req.params.id, ...req.body } })); } catch (e) { handleErr(res, e); }
  });

  r.delete("/skills/:id", async (req, res) => {
    try { res.json(await act("deleteSkill", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  // ── Projects ──────────────────────────────────────────────────────────────

  r.get("/projects", async (req, res) => {
    try { res.json(await act("getProjects")); } catch (e) { handleErr(res, e); }
  });

  r.post("/projects", async (req, res) => {
    try { res.json(await act("saveProject", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  r.put("/projects/:id", async (req, res) => {
    try { res.json(await act("saveProject", { data: { _id: req.params.id, ...req.body } })); } catch (e) { handleErr(res, e); }
  });

  r.delete("/projects/:id", async (req, res) => {
    try { res.json(await act("deleteProject", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  // ── Experience ────────────────────────────────────────────────────────────

  r.get("/experience", async (req, res) => {
    try { res.json(await act("getExperience")); } catch (e) { handleErr(res, e); }
  });

  r.post("/experience", async (req, res) => {
    try { res.json(await act("saveExperience", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  r.put("/experience/:id", async (req, res) => {
    try { res.json(await act("saveExperience", { data: { _id: req.params.id, ...req.body } })); } catch (e) { handleErr(res, e); }
  });

  r.delete("/experience/:id", async (req, res) => {
    try { res.json(await act("deleteExperience", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  // ── Education ─────────────────────────────────────────────────────────────

  r.get("/education", async (req, res) => {
    try { res.json(await act("getEducation")); } catch (e) { handleErr(res, e); }
  });

  r.post("/education", async (req, res) => {
    try { res.json(await act("saveEducation", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  r.put("/education/:id", async (req, res) => {
    try { res.json(await act("saveEducation", { data: { _id: req.params.id, ...req.body } })); } catch (e) { handleErr(res, e); }
  });

  r.delete("/education/:id", async (req, res) => {
    try { res.json(await act("deleteEducation", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  // ── Certifications ────────────────────────────────────────────────────────

  r.get("/certifications", async (req, res) => {
    try { res.json(await act("getCertifications")); } catch (e) { handleErr(res, e); }
  });

  r.post("/certifications", async (req, res) => {
    try { res.json(await act("saveCertification", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  r.put("/certifications/:id", async (req, res) => {
    try { res.json(await act("saveCertification", { data: { _id: req.params.id, ...req.body } })); } catch (e) { handleErr(res, e); }
  });

  r.delete("/certifications/:id", async (req, res) => {
    try { res.json(await act("deleteCertification", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  // ── Messages ──────────────────────────────────────────────────────────────

  r.get("/messages", async (req, res) => {
    try { res.json(await act("getMessages")); } catch (e) { handleErr(res, e); }
  });

  r.delete("/messages/:id", async (req, res) => {
    try { res.json(await act("deleteMessage", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  r.patch("/messages/:id/read", async (req, res) => {
    try { res.json(await act("markMessageRead", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  // ── Site Settings ───────────────────────────────────────────────────────────

  r.get("/settings", async (req, res) => {
    try { res.json(await act("getSettings")); } catch (e) { handleErr(res, e); }
  });

  r.put("/settings", async (req, res) => {
    try { res.json(await act("updateSettings", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  // ── Blog ──────────────────────────────────────────────────────────────────

  r.get("/blog", async (req, res) => {
    try { res.json(await act("getBlogPosts")); } catch (e) { handleErr(res, e); }
  });

  r.post("/blog", async (req, res) => {
    try { res.json(await act("saveBlogPost", { data: req.body })); } catch (e) { handleErr(res, e); }
  });

  r.put("/blog/:id", async (req, res) => {
    try { res.json(await act("saveBlogPost", { data: { _id: req.params.id, ...req.body } })); } catch (e) { handleErr(res, e); }
  });

  r.delete("/blog/:id", async (req, res) => {
    try { res.json(await act("deleteBlogPost", { id: req.params.id })); } catch (e) { handleErr(res, e); }
  });

  return r;
}

function handleErr(res, err) {
  console.error("[admin_api]", err?.message || err);
  res.status(500).json({ responseCode: "99", responseMessage: "Internal server error" });
}
