import { createPayout } from "../../../shared/dataStore.js";
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
    requireRole(actor.actorRole, [ROLES.MITRA]);
    requirePayloadFields(req.body || {}, ["amount"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const payout = createPayout({
      mitraId: actor.actorId,
      amount: req.body.amount,
      currency: req.body.currency || "IDR",
      orderId: req.body.orderId || null,
      metadata: req.body.metadata || {},
    });

    recordAuditEvent({
      event_type: "PAYOUT_REQUEST",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "PAYOUT",
      entity_id: payout.id,
      before_state: null,
      after_state: payout.status,
      metadata: { amount: req.body.amount, orderId: req.body.orderId || null },
      request_id: requestId,
    });

    const response = { payout };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
