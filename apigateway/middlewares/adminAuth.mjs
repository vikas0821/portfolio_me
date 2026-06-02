"use strict";

import jwt from "jsonwebtoken";
import { loadConfig } from "../config/config.mjs";

const { admin } = loadConfig();

export function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ responseCode: "401", responseMessage: "Authentication required" });
  }

  try {
    req.adminUser = jwt.verify(token, admin.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ responseCode: "401", responseMessage: "Invalid or expired token" });
  }
}

export function signAdminToken(secret) {
  return jwt.sign({ role: "admin" }, secret, { expiresIn: "12h" });
}
