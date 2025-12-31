import crypto from "node:crypto";
import { ORDER_STATES } from "./stateMachine.js";

const nowIso = () => new Date().toISOString();

const globalStore = globalThis.__assistenkuStore || {
  services: new Map(),
  coverageAreas: new Map(),
  pricingVersions: [],
  partnerProfiles: new Map(),
  orders: new Map(),
  invoices: new Map(),
  payouts: new Map(),
  disputes: new Map(),
  evidenceFiles: new Map(),
  ledgerEntries: [],
  auditEvents: [],
  idempotency: new Map(),
};

if (!globalThis.__assistenkuStore) {
  globalThis.__assistenkuStore = globalStore;

  // seed minimal service and pricing so endpoints have a sane default
  const defaultService = {
    code: "CLEANING_BASIC",
    name: "Basic Cleaning",
    description: "Basic residential cleaning",
    coverageAreas: ["JKT"],
    createdAt: nowIso(),
  };
  globalStore.services.set(defaultService.code, defaultService);

  const defaultPricing = {
    versionId: generateId("prv"),
    status: "ACTIVE",
    effectiveFrom: nowIso(),
    rules: [
      {
        serviceCode: defaultService.code,
        currency: "IDR",
        basePrice: 150000,
        rule: "flat",
      },
    ],
    publishedBy: "system",
    publishedAt: nowIso(),
  };
  globalStore.pricingVersions.push(defaultPricing);
}

export function getStore() {
  return globalStore;
}

export function generateId(prefix) {
  const random = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

// Services & Pricing
export function upsertService(service) {
  const payload = { ...service, createdAt: service.createdAt || nowIso() };
  globalStore.services.set(payload.code, payload);
  return payload;
}

export function listServices() {
  return Array.from(globalStore.services.values());
}

export function publishPricingVersion({ effectiveFrom, rules, actorId }) {
  const version = {
    versionId: generateId("prv"),
    status: "ACTIVE",
    effectiveFrom,
    rules,
    publishedBy: actorId,
    publishedAt: nowIso(),
  };
  globalStore.pricingVersions.push(version);
  globalStore.pricingVersions.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
  return version;
}

export function getActivePricingVersion(asOf = new Date()) {
  const target = typeof asOf === "string" ? new Date(asOf) : asOf;
  return (
    globalStore.pricingVersions.find(
      (version) => version.status === "ACTIVE" && new Date(version.effectiveFrom) <= target,
    ) || null
  );
}

export function getPricingSnapshot(serviceCode) {
  const active = getActivePricingVersion();
  if (!active) return null;

  const rule = active.rules.find((item) => item.serviceCode === serviceCode);
  if (!rule) return null;

  return {
    versionId: active.versionId,
    rule,
  };
}

// Orders & lifecycle
export function createOrder(payload) {
  const order = {
    id: generateId("ord"),
    status: ORDER_STATES.OPEN,
    createdAt: nowIso(),
    assignedMitraId: null,
    evidenceHash: null,
    pricingSnapshot: payload.pricingSnapshot,
    ...payload,
  };
  globalStore.orders.set(order.id, order);
  return order;
}

export function updateOrder(orderId, updates) {
  const current = globalStore.orders.get(orderId);
  if (!current) return null;

  const next = { ...current, ...updates };
  globalStore.orders.set(orderId, next);
  return next;
}

export function getOrder(orderId) {
  return globalStore.orders.get(orderId) || null;
}

export function listOrders({ role, actorId, status } = {}) {
  const statuses = status ? new Set(status) : null;
  return Array.from(globalStore.orders.values()).filter((order) => {
    if (statuses && !statuses.has(order.status)) return false;
    if (role === "customer") return order.customerId === actorId;
    if (role === "mitra") return order.assignedMitraId === actorId;
    return true;
  });
}

// Evidence
export function createEvidenceFile(payload) {
  const evidence = {
    id: generateId("evi"),
    uploadedAt: nowIso(),
    ...payload,
  };
  globalStore.evidenceFiles.set(evidence.id, evidence);
  return evidence;
}

// Invoices & payments
export function createInvoice(payload) {
  const invoice = {
    id: generateId("inv"),
    status: "PENDING",
    createdAt: nowIso(),
    ...payload,
  };
  globalStore.invoices.set(invoice.id, invoice);
  return invoice;
}

export function updateInvoice(invoiceId, updates) {
  const current = globalStore.invoices.get(invoiceId);
  if (!current) return null;

  const next = { ...current, ...updates };
  globalStore.invoices.set(invoiceId, next);
  return next;
}

export function getInvoice(invoiceId) {
  return globalStore.invoices.get(invoiceId) || null;
}

export function listInvoices({ role, actorId, customerId } = {}) {
  return Array.from(globalStore.invoices.values()).filter((invoice) => {
    if (customerId && invoice.customerId !== customerId) return false;
    if (role === "customer") return invoice.customerId === actorId;
    return true;
  });
}

// Payouts
export function createPayout(payload) {
  const payout = {
    id: generateId("po"),
    status: "REQUESTED",
    createdAt: nowIso(),
    ...payload,
  };
  globalStore.payouts.set(payout.id, payout);
  return payout;
}

export function updatePayout(payoutId, updates) {
  const current = globalStore.payouts.get(payoutId);
  if (!current) return null;

  const next = { ...current, ...updates };
  globalStore.payouts.set(payoutId, next);
  return next;
}

export function getPayout(payoutId) {
  return globalStore.payouts.get(payoutId) || null;
}

// Disputes
export function createDispute(payload) {
  const dispute = {
    id: generateId("dsp"),
    status: "OPEN",
    createdAt: nowIso(),
    ...payload,
  };
  globalStore.disputes.set(dispute.id, dispute);
  return dispute;
}

export function updateDispute(disputeId, updates) {
  const current = globalStore.disputes.get(disputeId);
  if (!current) return null;

  const next = { ...current, ...updates };
  globalStore.disputes.set(disputeId, next);
  return next;
}

export function getDispute(disputeId) {
  return globalStore.disputes.get(disputeId) || null;
}

// Ledger
export function recordLedgerEntry(entry) {
  const payload = {
    id: generateId("led"),
    createdAt: nowIso(),
    ...entry,
  };
  globalStore.ledgerEntries.push(payload);
  return payload;
}

// Audit helpers
export function listAuditEvents(filters = {}) {
  const { entityId, entityType, eventType } = filters;
  return globalStore.auditEvents.filter((event) => {
    if (entityId && event.entity_id !== entityId) return false;
    if (entityType && event.entity_type !== entityType) return false;
    if (eventType && event.event_type !== eventType) return false;
    return true;
  });
}

export function appendAuditEvent(event) {
  globalStore.auditEvents.push(event);
  return event;
}

// Idempotency
export function findIdempotentResponse(key) {
  return globalStore.idempotency.get(key);
}

export function saveIdempotentResponse(key, response) {
  globalStore.idempotency.set(key, response);
  return response;
}
