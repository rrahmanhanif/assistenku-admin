import { listAuditEvents } from "../../../shared/dataStore.js";
import {
  getActor,
  requireRole,
  getRequestId,
  requireActor,
  ROLES,
} from "../../../shared/validation.js";
import { success, failure } from "../../../shared/responses.js";

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== "GET") {
    return failure(res, requestId, "Method not allowed", 405);
  }

  try {
    const actor = getActor(req);
    requireActor(actor.actorId);
    requireRole(actor.actorRole, [ROLES.ADMIN, ROLES.OPERATOR, ROLES.FINANCE]);

    const { entity_id, entity_type, event_type } = req.query;
    const events = listAuditEvents({
      entityId: entity_id,
      entityType: entity_type,
      eventType: event_type,
    });

    return success(res, requestId, { events });
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
