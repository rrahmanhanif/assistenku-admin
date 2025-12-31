import crypto from "node:crypto";
import { appendAuditEvent } from "./dataStore.js";

export function recordAuditEvent({
  event_type,
  actor_role,
  actor_id,
  entity_type,
  entity_id,
  before_state,
  after_state,
  metadata = {},
  request_id,
  evidence_hash = null,
}) {
  const event = {
    event_id: crypto.randomUUID(),
    event_type,
    actor_role,
    actor_id,
    timestamp: new Date().toISOString(),
    entity_type,
    entity_id,
    before_state,
    after_state,
    metadata,
    request_id,
    evidence_hash,
  };

  return appendAuditEvent(event);
}
