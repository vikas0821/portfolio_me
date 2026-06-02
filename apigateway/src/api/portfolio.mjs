"use strict";

import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { buildHandlers } from "../../domain/controller/handlers.mjs";

export function portfolioApi(config) {
  const r = Router();
  const handlers = buildHandlers(config);

  r.get("/getPortfolio", async (req, res) => {
    try {
      const out = await handlers.getPortfolio({}, config);
      res.status(out.responseCode === "00" ? 200 : 404).json(out);
    } catch (err) {
      handleErr(req, res, err);
    }
  });

  r.post("/sendContactMessage", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const out = await handlers.sendContactMessage({ name, email, message }, config);
      res.status(out.responseCode === "00" ? 200 : 400).json(out);
    } catch (err) {
      handleErr(req, res, err);
    }
  });

  r.get("/getCertificates", async (req, res) => {
    try {
      const out = await handlers.getCertificates({}, config);
      res.status(out.responseCode === "00" ? 200 : 404).json(out);
    } catch (err) {
      handleErr(req, res, err);
    }
  });

  r.get("/getBlogPosts", async (req, res) => {
    try {
      const out = await handlers.getBlogPosts({}, config);
      res.status(out.responseCode === "00" ? 200 : 404).json(out);
    } catch (err) {
      handleErr(req, res, err);
    }
  });

  r.get("/getBlogPost/:slug", async (req, res) => {
    try {
      const out = await handlers.getBlogPost({ slug: req.params.slug }, config);
      res.status(out.responseCode === "00" ? 200 : 404).json(out);
    } catch (err) {
      handleErr(req, res, err);
    }
  });

  r.get("/getNotes", async (req, res) => {
    try {
      const out = await handlers.getNotes({}, config);
      res.status(out.responseCode === "00" ? 200 : 404).json(out);
    } catch (err) {
      handleErr(req, res, err);
    }
  });

  r.get("/downloadResume", (req, res) => {
    const resumePath = config.resumePath
      ? path.resolve(config.resumePath)
      : fileURLToPath(new URL("../../../resume/Vikas_Kannaujiya_Resume.pdf", import.meta.url));

    res.download(resumePath, "Vikas_Kannaujiya_Resume.pdf", (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ responseCode: "99", responseMessage: "Resume not found" });
      }
    });
  });

  return r;
}

function handleErr(req, res, err) {
  console.error("portfolio_api_error", err);
  res.status(500).json({ responseCode: "99", responseMessage: "Internal server error" });
}
