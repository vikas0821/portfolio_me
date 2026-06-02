/* services/users/src/utils/logger.mjs */
"use strict";

import pino from "pino";

const ENV = process.env.NODE_ENV || "development";
const SERVICE = process.env.SERVICE_NAME || "svc-users";
const PRETTY = ENV !== "production";

const baseOptions = {
  name: SERVICE,
  level: process.env.LOG_LEVEL || (PRETTY ? "debug" : "info"),
  messageKey: "msg",
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    req: reqSerializer,
    res: resSerializer,
  },
  // Redact common secrets from logs
  redact: [
    "password",
    "token",
    "secret",
    "client_secret",
    "authorization",
    "headers.authorization",
    "req.headers.authorization",
    "req.body.password",
    "req.body.token",
    "res.headers['set-cookie']",
  ],
};

// Pretty transport only in non-production for readability
const transport = PRETTY
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    }
  : undefined;

export const logger = pino({
  ...baseOptions,
  transport,
});

/**
 * Create a child logger with fixed bindings (context).
 * Example: const log = childLogger({ svc: "users", usecase: "signup" })
 */
export function childLogger(bindings = {}) {
  return logger.child(bindings || {});
}

/**
 * Create a request-scoped logger (safe if req is undefined).
 * Binds reqId (x-request-id), method, and path.
 */
export function requestLogger(req) {
  if (!req) return logger;
  const reqId =
    req.headers?.["x-request-id"] ||
    req.headers?.["X-Request-Id"] ||
    req.id ||
    undefined;

  return logger.child({
    reqId,
    method: req.method,
    path: req.originalUrl || req.url || req.path,
  });
}

/**
 * Optional Express-style middleware to attach req.log
 * (Use in gateway or HTTP microservices; for Seneca, call requestLogger(msg.ctx) if you pass context.)
 */
export function bindRequestLogger() {
  return (req, _res, next) => {
    req.log = requestLogger(req);
    next();
  };
}

/* -------------------- serializers -------------------- */

function reqSerializer(req) {
  if (!req) return req;
  return {
    id: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    ip: req.ip,
    headers: safeHeaders(req.headers),
    // Avoid logging body by default to prevent PII leaks
    // body: req.body,
  };
}

function resSerializer(res) {
  if (!res) return res;
  return {
    statusCode: res.statusCode,
    // headers: res.getHeaders ? res.getHeaders() : undefined,
  };
}

function safeHeaders(headers) {
  if (!headers) return headers;
  const clone = { ...headers };
  for (const k of Object.keys(clone)) {
    if (k.toLowerCase() === "authorization") {
      clone[k] = "<redacted>";
    }
  }
  return clone;
}
