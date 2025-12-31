import { createDispute, getOrder, updateOrder } from "../../../shared/dataStore.js";
import { recordAuditEvent } from "../../../shared/audit.js";
import { ORDER_ACTIONS, nextOrderState } from "../../../shared/stateMachine.js";
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
    requireRole(actor.actorRole, [ROLES.CUSTOMER, ROLES.ADMIN]);
    requirePayloadFields(req.body || {}, ["orderId", "reason"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const order = getOrder(req.body.orderId);
    if (!order) throw new Error("Order tidak ditemukan");

    const nextState = nextOrderState(order.status, ORDER_ACTIONS.DISPUTE);
    const updatedOrder = updateOrder(order.id, { status: nextState });

    const dispute = createDispute({
      orderId: order.id,
      createdBy: actor.actorId,
      reason: req.body.reason,
      metadata: req.body.metadata || {},
    });

    recordAuditEvent({
      event_type: "DISPUTE_CREATE",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "DISPUTE",
      entity_id: dispute.id,
      before_state: null,
      after_state: dispute.status,
      metadata: { orderId: order.id },
      request_id: requestId,
    });

    recordAuditEvent({
      event_type: "ORDER_DISPUTED",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "ORDER",
      entity_id: order.id,
      before_state: order.status,
      after_state: nextState,
      metadata: { disputeId: dispute.id },
      request_id: requestId,
    });

    const response = { dispute, order: updatedOrder };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
