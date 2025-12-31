import { createInvoice, getOrder, recordLedgerEntry } from "../../../shared/dataStore.js";
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
    requirePayloadFields(req.body || {}, ["orderId"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const order = getOrder(req.body.orderId);
    if (!order) throw new Error("Order tidak ditemukan");

    const invoice = createInvoice({
      orderId: order.id,
      customerId: order.customerId,
      amount: order.price,
      currency: order.pricingSnapshot?.rule?.currency || req.body.currency || "IDR",
      status: "PENDING",
      metadata: {
        pricingSnapshot: order.pricingSnapshot,
        ...req.body.metadata,
      },
    });

    recordLedgerEntry({
      entryType: "INVOICE_ISSUED",
      entityType: "INVOICE",
      entityId: invoice.id,
      debit: 0,
      credit: invoice.amount,
      currency: invoice.currency,
      description: `Invoice for order ${order.id}`,
      requestId,
    });

    recordAuditEvent({
      event_type: "INVOICE_CREATED",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "INVOICE",
      entity_id: invoice.id,
      before_state: null,
      after_state: invoice.status,
      metadata: { orderId: order.id, amount: invoice.amount },
      request_id: requestId,
    });

    const response = { invoice };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
