import { listOrders } from "../../../shared/dataStore.js";
import { success, failure } from "../../../shared/responses.js";
import { getActor, requireRole, getRequestId, requireActor, ROLES } from "../../../shared/validation.js";

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== "GET") {
    return failure(res, requestId, "Method not allowed", 405);
  }

  try {
    const actor = getActor(req);
    requireActor(actor.actorId);
    requireRole(actor.actorRole, [ROLES.ADMIN, ROLES.OPERATOR, ROLES.CUSTOMER, ROLES.MITRA]);

    const statusFilter = req.query.status;
    const orders = listOrders({
      role: actor.actorRole,
      actorId: actor.actorId,
      status: Array.isArray(statusFilter)
        ? statusFilter
        : statusFilter
          ? [statusFilter]
          : undefined,
    });

    return success(res, requestId, { orders });
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
