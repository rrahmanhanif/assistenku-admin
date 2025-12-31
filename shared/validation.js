import crypto from "node:crypto";
import { findIdempotentResponse, saveIdempotentResponse } from "./dataStore.js";

export const ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  FINANCE: "finance",
  CUSTOMER: "customer",
  MITRA: "mitra",
};

export function getActor(req) {
  const actorId = req.headers["x-user-id"];
  const actorRole = req.headers["x-role"];
  return { actorId, actorRole };
}

export function requireActor(actorId) {
  if (!actorId) {
    throw new Error("Header x-user-id wajib ada untuk audit trail");
  }
}

export function requireRole(actorRole, allowedRoles) {
  if (!actorRole || !allowedRoles.includes(actorRole)) {
    const expected = allowedRoles.join(", ");
    throw new Error(`Akses ditolak untuk role '${actorRole || "unknown"}', butuh: ${expected}`);
  }
}

export function requirePayloadFields(body, fields) {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length) {
    throw new Error(`Field wajib belum lengkap: ${missing.join(", ")}`);
  }
}

export function getRequestId(req) {
  return req.headers["x-request-id"] || crypto.randomUUID();
}

export function requireIdempotencyKey(req) {
  const key = req.headers["x-idempotency-key"];
  if (!key) {
    throw new Error("Header x-idempotency-key wajib ada untuk endpoint ini");
  }
  return key;
}

export function getIdempotentResponse(idempotencyKey, path) {
  const key = `${path}:${idempotencyKey}`;
  return findIdempotentResponse(key);
}

export function persistIdempotentResponse(idempotencyKey, path, response) {
  const key = `${path}:${idempotencyKey}`;
  return saveIdempotentResponse(key, response);
}
