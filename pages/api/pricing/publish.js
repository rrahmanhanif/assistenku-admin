import { publishPricingVersion } from "../../../shared/dataStore.js";
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
    requireRole(actor.actorRole, [ROLES.ADMIN]);
    requirePayloadFields(req.body || {}, ["effectiveFrom", "rules"]);

    const idempotencyKey = requireIdempotencyKey(req);
    const cached = getIdempotentResponse(idempotencyKey, req.url);
    if (cached) return success(res, requestId, cached.data);

    const rules = Array.isArray(req.body.rules) ? req.body.rules : [];
    if (rules.length === 0) {
      throw new Error("rules harus berisi setidaknya satu pricing rule");
    }

    const version = publishPricingVersion({
      effectiveFrom: req.body.effectiveFrom,
      rules,
      actorId: actor.actorId,
    });

    recordAuditEvent({
      event_type: "PRICING_PUBLISH",
      actor_role: actor.actorRole,
      actor_id: actor.actorId,
      entity_type: "PRICING_VERSION",
      entity_id: version.versionId,
      before_state: null,
      after_state: version.status,
      metadata: { effectiveFrom: req.body.effectiveFrom },
      request_id: requestId,
    });

    const response = { pricingVersion: version };
    persistIdempotentResponse(idempotencyKey, req.url, response);

    return success(res, requestId, response);
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
