import { getDispute, updateDispute, getOrder, updateOrder } from "../../../shared/dataStore.js";
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
    requireRole(actor.actorRole, [ROLES.ADMIN]);
    requirePayloadFields(req.body || {}, ["disputeId", "resolution"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const dispute = getDispute(req.body.disputeId);
    if (!dispute) throw new Error("Dispute tidak ditemukan");
    if (dispute.status === "RESOLVED") {
      return success(res, requestId, { dispute });
    }

    const resolved = updateDispute(dispute.id, {
      status: "RESOLVED",
      resolution: req.body.resolution,
      resolvedBy: actor.actorId,
      resolvedAt: new Date().toISOString(),
    });

    const order = getOrder(dispute.orderId);
    let updatedOrder = order;

    if (order && order.status === ORDER_STATES.DISPUTED) {
      const nextState = nextOrderState(order.status, ORDER_ACTIONS.CLOSE);
      updatedOrder = updateOrder(order.id, { status: nextState });

      recordAuditEvent({
        event_type: "ORDER_DISPUTE_RESOLVED",
        actor_role: actor.actorRole,
        actor_id: actor.actorId,
        entity_type: "ORDER",
        entity_id: order.id,
        before_state: order.status,
        after_state: nextState,
        metadata: { disputeId: dispute.id },
        request_id: requestId,
      });
    }

    recordAuditEvent({
      event_type: "DISPUTE_RESOLVE",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "DISPUTE",
      entity_id: dispute.id,
      before_state: dispute.status,
      after_state: resolved.status,
      metadata: { resolution: req.body.resolution },
      request_id: requestId,
    });

    const response = { dispute: resolved, order: updatedOrder };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
