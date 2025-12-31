import { listServices } from "../../../shared/dataStore.js";
import { getActor, requireRole, getRequestId, ROLES } from "../../../shared/validation.js";
import { success, failure } from "../../../shared/responses.js";

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== "GET") {
    return failure(res, requestId, "Method not allowed", 405);
  }

  try {
    const actor = getActor(req);
    requireRole(actor.actorRole, [ROLES.ADMIN, ROLES.OPERATOR, ROLES.CUSTOMER, ROLES.MITRA]);

    const services = listServices();
    return success(res, requestId, { services });
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
