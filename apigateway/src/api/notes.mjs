"use strict";

import { Router } from "express";
import { notesAuth, signNotesToken } from "../../middlewares/adminAuth.mjs";
import * as sections from "../../domain/modelservices/notesection.modelservice.mjs";
import * as notes from "../../domain/modelservices/note.modelservice.mjs";

export function notesApi(config) {
  const r = Router();

  const ok = (res, data) => res.json({ responseCode: "00", responseMessage: "SUCCESS", data });
  const fail = (res, e) => {
    console.error("[notes_api]", e?.message || e);
    res.status(e?.status || 500).json({ responseCode: "99", responseMessage: e?.message || "Internal server error" });
  };

  // ── Auth ────────────────────────────────────────────────────────────────
  r.post("/login", (req, res) => {
    const { password } = req.body;
    if (!password || password !== config.notes.password) {
      return res.status(401).json({ responseCode: "401", responseMessage: "Invalid password" });
    }
    res.json({ responseCode: "00", token: signNotesToken(config.admin.jwtSecret) });
  });

  // Everything below requires the notes token
  r.use(notesAuth);

  // ── Sections ──────────────────────────────────────────────────────────────
  r.get("/sections", async (req, res) => { try { ok(res, await sections.listSections()); } catch (e) { fail(res, e); } });
  r.post("/sections", async (req, res) => { try { ok(res, await sections.saveSection(req.body)); } catch (e) { fail(res, e); } });
  r.put("/sections/:id", async (req, res) => { try { ok(res, await sections.saveSection({ _id: req.params.id, ...req.body })); } catch (e) { fail(res, e); } });
  r.delete("/sections/:id", async (req, res) => { try { ok(res, await sections.deleteSection(req.params.id)); } catch (e) { fail(res, e); } });

  // ── Notes (within a section) ────────────────────────────────────────────────
  r.get("/sections/:id/notes", async (req, res) => { try { ok(res, await notes.listNotesBySection(req.params.id)); } catch (e) { fail(res, e); } });
  r.post("/notes", async (req, res) => { try { ok(res, await notes.saveNote(req.body)); } catch (e) { fail(res, e); } });
  r.put("/notes/:id", async (req, res) => { try { ok(res, await notes.saveNote({ _id: req.params.id, ...req.body })); } catch (e) { fail(res, e); } });
  r.delete("/notes/:id", async (req, res) => { try { ok(res, await notes.deleteNote(req.params.id)); } catch (e) { fail(res, e); } });

  return r;
}
