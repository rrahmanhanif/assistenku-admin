import { getOrder, updateOrder } from "../../../shared/dataStore.js";
import { recordAuditEvent } from "../../../shared/audit.js";
import { ORDER_ACTIONS, ORDER_STATES, nextOrderState } from "../../../shared/stateMachine.js";
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
    requireRole(actor.actorRole, [ROLES.ADMIN, ROLES.CUSTOMER]);
    requirePayloadFields(req.body || {}, ["orderId", "decision"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const order = getOrder(req.body.orderId);
    if (!order) throw new Error("Order tidak ditemukan");

    if (![ORDER_STATES.COMPLETED, ORDER_STATES.EVIDENCE_REJECTED].includes(order.status)) {
      throw new Error("Order belum siap untuk keputusan evidence");
    }

    const isApprove = req.body.decision === "approve";
    const action = isApprove ? ORDER_ACTIONS.EVIDENCE_DECISION : ORDER_ACTIONS.REJECT_EVIDENCE;
    const nextState = nextOrderState(order.status, action);

    const updated = updateOrder(order.id, {
      status: nextState,
      evidenceDecision: {
        decision: req.body.decision,
        reason: req.body.reason || null,
        decidedBy: actor.actorId,
        decidedAt: new Date().toISOString(),
      },
    });

    recordAuditEvent({
      event_type: "EVIDENCE_DECISION",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "ORDER",
      entity_id: order.id,
      before_state: order.status,
      after_state: nextState,
      metadata: { decision: req.body.decision, reason: req.body.reason || null },
      request_id: requestId,
    });

    const response = { order: updated };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
