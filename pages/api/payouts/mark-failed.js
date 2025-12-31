import { getPayout, updatePayout } from "../../../shared/dataStore.js";
import { recordAuditEvent } from "../../../shared/audit.js";
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

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== "POST") {
    return failure(res, requestId, "Method not allowed", 405);
  }

  try {
    const actor = getActor(req);
    requireActor(actor.actorId);
    requireRole(actor.actorRole, [ROLES.ADMIN, ROLES.FINANCE]);
    requirePayloadFields(req.body || {}, ["payoutId", "reason"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const payout = getPayout(req.body.payoutId);
    if (!payout) throw new Error("Payout tidak ditemukan");

    const updated = updatePayout(payout.id, {
      status: "FAILED",
      failedAt: new Date().toISOString(),
      failureReason: req.body.reason,
    });

    recordAuditEvent({
      event_type: "PAYOUT_MARK_FAILED",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "PAYOUT",
      entity_id: payout.id,
      before_state: payout.status,
      after_state: updated.status,
      metadata: { reason: req.body.reason },
      request_id: requestId,
    });

    const response = { payout: updated };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
