"use strict";

import jwt from "jsonwebtoken";
import { loadConfig } from "../config/config.mjs";

const { admin } = loadConfig();

function makeAuth(requiredRole) {
  return function (req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ responseCode: "401", responseMessage: "Authentication required" });
    }

    try {
      const decoded = jwt.verify(token, admin.jwtSecret);
      if (decoded.role !== requiredRole) {
        return res.status(401).json({ responseCode: "401", responseMessage: "Invalid token" });
      }
      req.authUser = decoded;
      next();
    } catch {
      return res.status(401).json({ responseCode: "401", responseMessage: "Invalid or expired token" });
    }
  };
}

// Admin dashboard (role: admin)
export const adminAuth = makeAuth("admin");
export function signAdminToken(secret) {
  return jwt.sign({ role: "admin" }, secret, { expiresIn: "12h" });
}

// Private notes workspace (role: notes) — separate password, separate token
export const notesAuth = makeAuth("notes");
export function signNotesToken(secret) {
  return jwt.sign({ role: "notes" }, secret, { expiresIn: "12h" });
}
