import { getInvoice, updateInvoice, recordLedgerEntry } from "../../../shared/dataStore.js";
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
    requirePayloadFields(req.body || {}, ["invoiceId"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const invoice = getInvoice(req.body.invoiceId);
    if (!invoice) throw new Error("Invoice tidak ditemukan");

    if (invoice.status === "PAID") {
      return success(res, requestId, { invoice });
    }

    const updated = updateInvoice(invoice.id, {
      status: "PAID",
      paidAt: new Date().toISOString(),
      paymentReference: req.body.paymentReference,
    });

    recordLedgerEntry({
      entryType: "INVOICE_PAID",
      entityType: "INVOICE",
      entityId: updated.id,
      debit: updated.amount,
      credit: 0,
      currency: updated.currency,
      description: `Payment received for invoice ${updated.id}`,
      requestId,
    });

    recordAuditEvent({
      event_type: "INVOICE_MARK_PAID",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "INVOICE",
      entity_id: updated.id,
      before_state: invoice.status,
      after_state: updated.status,
      metadata: { paymentReference: req.body.paymentReference },
      request_id: requestId,
    });

    const response = { invoice: updated };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
