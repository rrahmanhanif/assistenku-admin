// src/services/analyticsEngine.js
import rulesConfig from "../../config/analyticsRules.json";

const RULES = Array.isArray(rulesConfig?.rules) ? rulesConfig.rules : [];
const HISTORY_KEY = "assistenku_recommendation_history";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function safeAverage(list) {
  if (!Array.isArray(list) || list.length === 0) return 0;
  return list.reduce((acc, value) => acc + value, 0) / list.length;
}

function resolveStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    // ignore
  }
  return null;
}

export function normalizeData(rawData = {}) {
  const orders = Array.isArray(rawData.orders) ? rawData.orders : [];
  const feedback = Array.isArray(rawData.feedback) ? rawData.feedback : [];
  const customerEvents = Array.isArray(rawData.customerEvents) ? rawData.customerEvents : [];
  const operations = Array.isArray(rawData.operations) ? rawData.operations : [];

  const totalOrders = orders.length;

  const cancelledOrders = orders.filter((o) =>
    ["cancelled", "canceled", "refunded", "failed", "fail"].includes(String(o?.status || "").toLowerCase())
  ).length;

  const completedOrders = orders.filter((o) =>
    ["completed", "done", "fulfilled"].includes(String(o?.status || "").toLowerCase())
  );

  const fulfillmentDurations = completedOrders
    .map((o) => {
      const created = new Date(o.created_at || o.createdAt || 0).getTime();
      const completed = new Date(o.fulfilled_at || o.completedAt || o.updated_at || 0).getTime();
      const minutes = (completed - created) / (1000 * 60);
      return Number.isFinite(minutes) ? Math.max(minutes, 0) : null;
    })
    .filter((m) => m !== null);

  // Ticket size: hanya nilai yang valid (>0) supaya tidak bias oleh field kosong
  const orderValues = orders
    .map((o) => Number(o.total_price ?? o.amount ?? 0))
    .filter((v) => Number.isFinite(v) && v > 0);

  // Repeat rate: hitung customer yang order > 1 dibanding total customer aktif
  const repeatCounts = orders.reduce((map, order) => {
    const key = order.customer_id || order.customerId;
    if (!key) return map;
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});
  const totalCustomers = Math.max(Object.keys(repeatCounts).length, 1);
  const repeatCustomers = Object.values(repeatCounts).filter((count) => count > 1).length;

  const sentimentScores = feedback
    .map((item) => Number(item?.score ?? item?.sentimentScore))
    .filter((score) => Number.isFinite(score));

  const sentimentScore = sentimentScores.length > 0 ? safeAverage(sentimentScores) : 0.6;

  return {
    orders,
    feedback,
    customerEvents,
    operations,
    metrics: {
      totalOrders,
      cancellationRate: totalOrders ? cancelledOrders / totalOrders : 0,
      completionRate: totalOrders ? completedOrders.length / totalOrders : 0,
      averageFulfillmentMinutes: safeAverage(fulfillmentDurations),
      averageTicketSize: safeAverage(orderValues),
      repeatRate: repeatCustomers / totalCustomers,
      sentimentScore,
    },
  };
}

function evaluateRule(rule, normalized) {
  const metrics = normalized.metrics || {};
  const thresholds = rule.thresholds || {};

  switch (rule.id) {
    case "high_cancellation_rate": {
      const rate = metrics.cancellationRate || 0;
      const warning = thresholds.warning ?? 0.12;
      const critical = thresholds.critical ?? 0.2;

      const triggered = rate >= warning;
      const confidence = triggered
        ? clamp((rate - warning) / ((critical - warning) || 1), 0.35, 0.95)
        : 0;

      return {
        ruleId: rule.id,
        triggered,
        confidence,
        impact: rule.weight ?? 10,
        summary: `Cancellation rate ${(rate * 100).toFixed(1)}% melampaui batas ${(warning * 100).toFixed(0)}%`,
        actions: Array.isArray(rule.actions) ? rule.actions : [],
      };
    }

    case "slow_fulfillment": {
      const duration = metrics.averageFulfillmentMinutes || 0;
      const warning = thresholds.warning ?? 45;
      const critical = thresholds.critical ?? 60;

      const triggered = duration >= warning;
      const confidence = triggered
        ? clamp((duration - warning) / ((critical - warning) || 1), 0.3, 0.9)
        : 0;

      return {
        ruleId: rule.id,
        triggered,
        confidence,
        impact: rule.weight ?? 10,
        summary: `Rata-rata pemenuhan ${duration.toFixed(1)} menit melebihi target ${warning} menit`,
        actions: Array.isArray(rule.actions) ? rule.actions : [],
      };
    }

    case "repeat_customer_opportunity": {
      const rate = metrics.repeatRate || 0;
      const warning = thresholds.warning ?? 0.15;
      const critical = thresholds.critical ?? 0.25;

      const triggered = rate >= warning;
      const confidence = triggered
        ? clamp((rate - warning) / ((critical - warning) || 1), 0.25, 0.85)
        : 0;

      return {
        ruleId: rule.id,
        triggered,
        confidence,
        positive: true,
        impact: rule.weight ?? 10,
        summary: `Repeat customer ${(rate * 100).toFixed(1)}% membuka peluang retensi`,
        actions: Array.isArray(rule.actions) ? rule.actions : [],
      };
    }

    case "sentiment_drop": {
      const score = metrics.sentimentScore ?? 0.6;
      const warning = thresholds.warning ?? 0.55;
      const critical = thresholds.critical ?? 0.45;

      const triggered = score <= warning;
      const confidence = triggered
        ? clamp((warning - score) / ((warning - critical) || 1), 0.25, 0.9)
        : 0;

      return {
        ruleId: rule.id,
        triggered,
        confidence,
        impact: rule.weight ?? 10,
        summary: `Skor sentimen ${(score * 100).toFixed(0)}% di bawah batas nyaman`,
        actions: Array.isArray(rule.actions) ? rule.actions : [],
      };
    }

    default:
      return { ruleId: rule.id, triggered: false, confidence: 0, actions: [], impact: rule.weight ?? 10 };
  }
}

function calculateHealthScore(analysis) {
  let score = 100;

  analysis.forEach((item) => {
    const weight = item.impact || 10;
    if (item.positive) score += weight * item.confidence * 0.6;
    else score -= weight * item.confidence;
  });

  return clamp(Number(score.toFixed(1)), 0, 100);
}

export function analyzeData(normalized) {
  return RULES.map((rule) => ({ rule, evaluation: evaluateRule(rule, normalized) }))
    .filter(({ evaluation }) => evaluation.triggered)
    .map(({ rule, evaluation }) => ({
      ...evaluation,
      title: rule.title,
      description: rule.description,
    }));
}

export function generateRecommendations(analysis) {
  return analysis.map((item) => ({
    id: item.ruleId,
    title: item.title,
    summary: item.summary,
    description: item.description,
    confidence: Number(item.confidence.toFixed(2)),
    actions: item.actions,
    positive: Boolean(item.positive),
  }));
}

export function loadRecommendationHistory() {
  const storage = resolveStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Gagal membaca riwayat rekomendasi", error);
    return [];
  }
}

function persistHistory(entry) {
  const storage = resolveStorage();
  if (!storage) return;
  const history = loadRecommendationHistory();
  history.unshift(entry);
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  } catch (error) {
    console.warn("Gagal menyimpan riwayat rekomendasi", error);
  }
}

export function scoreHealth(rawData = {}) {
  const normalized = normalizeData(rawData);
  const analysis = analyzeData(normalized);
  return calculateHealthScore(analysis);
}

export function getRecommendations(rawData = {}) {
  const normalized = normalizeData(rawData);
  const analysis = analyzeData(normalized);
  const recommendations = generateRecommendations(analysis);
  const healthScore = calculateHealthScore(analysis);

  persistHistory({
    timestamp: new Date().toISOString(),
    recommendations,
    snapshot: { ...normalized.metrics, healthScore },
  });

  return recommendations;
}

export function summarizePipeline(rawData = {}) {
  const normalized = normalizeData(rawData);
  const analysis = analyzeData(normalized);
  return {
    normalized,
    analysis,
    recommendations: generateRecommendations(analysis),
    healthScore: calculateHealthScore(analysis),
  };
}
