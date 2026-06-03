"use strict";

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "../../.env"), quiet: true });

export function loadConfig() {
  return {
    env: str("NODE_ENV", "development"),
    hostName: str("HOST_NAME", "0.0.0.0"),
    httpPort: int("HTTP_PORT", 3000),

    admin: {
      password: str("ADMIN_PASSWORD", "admin123"),
      jwtSecret: str("ADMIN_JWT_SECRET", "change-me-admin-secret"),
    },

    notes: {
      password: str("NOTES_PASSWORD", "notes123"),
    },

    mongo: {
      uri: str("MONGO_URI", "mongodb://localhost:27017/portfolio"),
      options: {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      },
    },

    resumePath: str("RESUME_PATH", ""),
  };
}

function str(k, d) {
  const v = process.env[k];
  return v == null || v === "" ? d : v;
}

function int(k, d) {
  const n = Number(process.env[k]);
  return Number.isFinite(n) ? n : d;
}
