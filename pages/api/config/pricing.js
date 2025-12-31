import { getActivePricingVersion } from "../../../shared/dataStore.js";
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

    const pricing = getActivePricingVersion();
    if (!pricing) {
      return failure(res, requestId, "Tidak ada pricing aktif", 404);
    }

    return success(res, requestId, { pricing });
  } catch (error) {
    return failure(res, requestId, error.message);
  }
}
