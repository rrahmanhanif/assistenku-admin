import {
  getActor,
  requireRole,
  requirePayloadFields,
  getRequestId,
  requireIdempotencyKey,
  getIdempotentResponse,
  persistIdempotentResponse,
  requireActor,
  ROLES,
} from "../../../shared/validation.js";
import { success, failure } from "../../../shared/responses.js";
import { getStore, updatePayout } from "../../../shared/dataStore.js";
import { recordAuditEvent } from "../../../shared/audit.js";

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== "POST") {
    return failure(res, requestId, "Method not allowed", 405);
  }

  try {
    const actor = getActor(req);
    requireActor(actor.actorId);
    requireRole(actor.actorRole, [ROLES.ADMIN, ROLES.FINANCE]);
    requirePayloadFields(req.body || {}, ["payoutId"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const payout = getStore().payouts.get(req.body.payoutId);
    if (!payout) throw new Error("Payout tidak ditemukan");

    if (payout.status === "APPROVED") {
      return success(res, requestId, { payout });
    }

    const updated = updatePayout(payout.id, {
      status: "APPROVED",
      approvedAt: new Date().toISOString(),
      approverId: actor.actorId,
    });

    recordAuditEvent({
      event_type: "PAYOUT_APPROVE",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "PAYOUT",
      entity_id: payout.id,
      before_state: payout.status,
      after_state: updated.status,
      request_id: requestId,
    });

    const response = { payout: updated };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
