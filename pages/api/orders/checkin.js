import { getOrder, updateOrder } from "../../../shared/dataStore.js";
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
    requireRole(actor.actorRole, [ROLES.MITRA]);
    requirePayloadFields(req.body || {}, ["orderId"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const order = getOrder(req.body.orderId);
    if (!order) throw new Error("Order tidak ditemukan");

    if (order.assignedMitraId && order.assignedMitraId !== actor.actorId) {
      throw new Error("Order tidak ditugaskan ke mitra ini");
    }

    const nextState = nextOrderState(order.status, ORDER_ACTIONS.CHECKIN);
    const updated = updateOrder(order.id, {
      status: nextState,
      checkinAt: new Date().toISOString(),
      assignedMitraId: order.assignedMitraId || actor.actorId,
    });

    recordAuditEvent({
      event_type: "ORDER_CHECKIN",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "ORDER",
      entity_id: order.id,
      before_state: order.status,
      after_state: nextState,
      metadata: { location: req.body.location || null },
      request_id: requestId,
    });

    const response = { order: updated };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
