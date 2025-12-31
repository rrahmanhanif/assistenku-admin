import { createOrder, getPricingSnapshot, listServices } from "../../../shared/dataStore.js";
import { recordAuditEvent } from "../../../shared/audit.js";
import { ORDER_STATES } from "../../../shared/stateMachine.js";
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
    requireRole(actor.actorRole, [ROLES.CUSTOMER, ROLES.ADMIN, ROLES.OPERATOR]);
    requirePayloadFields(req.body || {}, ["serviceCode"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const serviceExists = listServices().some((svc) => svc.code === req.body.serviceCode);
    if (!serviceExists) {
      throw new Error("Service tidak ditemukan atau tidak aktif");
    }

    const pricingSnapshot = getPricingSnapshot(req.body.serviceCode);
    if (!pricingSnapshot) {
      throw new Error("Pricing aktif tidak ditemukan untuk service ini, publish pricing terlebih dahulu");
    }

    const quantity = Number(req.body.quantity || 1);
    const calculatedPrice = pricingSnapshot.rule.basePrice * quantity;

    const order = createOrder({
      customerId: req.body.customerId || actor.actorId,
      serviceCode: req.body.serviceCode,
      quantity,
      price: calculatedPrice,
      pricingSnapshot,
      metadata: req.body.metadata || {},
    });

    recordAuditEvent({
      event_type: "ORDER_CREATE",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "ORDER",
      entity_id: order.id,
      before_state: null,
      after_state: ORDER_STATES.OPEN,
      metadata: { serviceCode: req.body.serviceCode, pricingSnapshot },
      request_id: requestId,
    });

    const response = { order };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
