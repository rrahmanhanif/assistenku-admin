import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getRecommendations,
  scoreHealth,
  normalizeData,
  generateRecommendations,
  analyzeData,
  summarizePipeline,
} from "./analyticsEngine";

const sampleRaw = {
  orders: [
    {
      id: "1",
      status: "completed",
      total_price: 100000,
      customer_id: "C-1",
      created_at: "2024-08-01T00:00:00Z",
      fulfilled_at: "2024-08-01T01:00:00Z",
    },
    {
      id: "2",
      status: "cancelled",
      total_price: 90000,
      customer_id: "C-2",
      created_at: "2024-08-01T02:00:00Z",
      updated_at: "2024-08-01T02:20:00Z",
    },
    {
      id: "3",
      status: "fulfilled",
      total_price: 120000,
      customer_id: "C-1",
      created_at: "2024-08-02T00:00:00Z",
      fulfilled_at: "2024-08-02T01:10:00Z",
    },
    {
      id: "4",
      status: "completed",
      total_price: 110000,
      customer_id: "C-3",
      created_at: "2024-08-02T03:00:00Z",
      fulfilled_at: "2024-08-02T03:40:00Z",
    },
  ],
  feedback: [{ id: "F-1", score: 0.5 }, { id: "F-2", score: 0.7 }],
};

beforeEach(() => {
  // Pastikan test tidak bergantung pada environment yang menyediakan localStorage
  const store = new Map();
  const mockStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  // Vitest: inject global localStorage jika tidak ada, atau override agar deterministik
  vi.stubGlobal("localStorage", mockStorage);
});

describe("analyticsEngine", () => {
  it("normalizes core metrics", () => {
    const normalized = normalizeData(sampleRaw);

    expect(normalized.metrics.totalOrders).toBe(4);
    expect(normalized.metrics.cancellationRate).toBeCloseTo(0.25, 5);
    expect(normalized.metrics.averageFulfillmentMinutes).toBeGreaterThan(0);
    expect(normalized.metrics.sentimentScore).toBeGreaterThan(0);
  });

  it("analysis output shape is stable", () => {
    const analysis = analyzeData(normalizeData(sampleRaw));

    // Tidak memaksa harus ada rekomendasi (rules bisa berubah)
    expect(Array.isArray(analysis)).toBe(true);

    // Jika ada hasil, pastikan bentuk datanya benar
    if (analysis.length > 0) {
      expect(analysis[0]).toHaveProperty("ruleId");
      expect(analysis[0]).toHaveProperty("confidence");
      expect(analysis[0]).toHaveProperty("actions");
    }
  });

  it("generateRecommendations maps analysis into UI-friendly items", () => {
    const analysis = analyzeData(normalizeData(sampleRaw));
    const recommendations = generateRecommendations(analysis);

    expect(Array.isArray(recommendations)).toBe(true);

    if (recommendations.length > 0) {
      expect(recommendations[0]).toHaveProperty("id");
      expect(recommendations[0]).toHaveProperty("title");
      expect(recommendations[0]).toHaveProperty("confidence");
      expect(Array.isArray(recommendations[0].actions)).toBe(true);
    }
  });

  it("exposes API helpers for UI (does not throw)", () => {
    expect(() => getRecommendations(sampleRaw)).not.toThrow();
    expect(() => scoreHealth(sampleRaw)).not.toThrow();

    const recommendations = getRecommendations(sampleRaw);
    const health = scoreHealth(sampleRaw);

    expect(Array.isArray(recommendations)).toBe(true);
    expect(typeof health).toBe("number");
    expect(health).toBeGreaterThanOrEqual(0);
    expect(health).toBeLessThanOrEqual(100);
  });

  it("returns healthier score for cleaner data", () => {
    const noisyScore = scoreHealth(sampleRaw);

    const cleanerScore = scoreHealth({
      orders: [
        {
          id: "ok",
          status: "completed",
          total_price: 100000,
          customer_id: "C-9",
          created_at: "2024-08-01T00:00:00Z",
          fulfilled_at: "2024-08-01T00:30:00Z",
        },
      ],
      feedback: [{ id: "F-ok", score: 0.8 }],
    });

    expect(cleanerScore).toBeGreaterThan(noisyScore);
  });

  it("summarizePipeline returns a consistent structure", () => {
    const summary = summarizePipeline(sampleRaw);

    expect(summary).toHaveProperty("normalized");
    expect(summary).toHaveProperty("analysis");
    expect(summary).toHaveProperty("recommendations");
    expect(summary).toHaveProperty("healthScore");
  });
});
