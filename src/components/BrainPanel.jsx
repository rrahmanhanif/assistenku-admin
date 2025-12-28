import React, { useEffect, useMemo, useState } from "react";
import {
  getRecommendations,
  scoreHealth,
  loadRecommendationHistory,
  summarizePipeline,
} from "../services/analyticsEngine";

/**
 * Default dataset hanya untuk demo/preview UI.
 * Jika Anda sudah punya data asli dari backend, kirim via prop `rawData`.
 */
const defaultRawData = {
  orders: [
    {
      id: "ORD-1001",
      status: "completed",
      total_price: 125000,
      customer_id: "CUS-1",
      created_at: "2024-08-01T08:00:00Z",
      fulfilled_at: "2024-08-01T08:50:00Z",
    },
    {
      id: "ORD-1002",
      status: "cancelled",
      total_price: 98000,
      customer_id: "CUS-2",
      created_at: "2024-08-02T09:10:00Z",
      updated_at: "2024-08-02T09:20:00Z",
    },
    {
      id: "ORD-1003",
      status: "completed",
      total_price: 157000,
      customer_id: "CUS-1",
      created_at: "2024-08-02T11:05:00Z",
      fulfilled_at: "2024-08-02T12:00:00Z",
    },
    {
      id: "ORD-1004",
      status: "fulfilled",
      total_price: 88000,
      customer_id: "CUS-3",
      created_at: "2024-08-03T13:00:00Z",
      fulfilled_at: "2024-08-03T13:35:00Z",
    },
  ],
  feedback: [
    { id: "FB-1", orderId: "ORD-1002", score: 0.4, comment: "Pengiriman terlambat" },
    { id: "FB-2", orderId: "ORD-1003", score: 0.68, comment: "Paket sesuai" },
  ],
  customerEvents: [
    { type: "app_login", customerId: "CUS-1", timestamp: "2024-08-02T10:00:00Z" },
    { type: "app_login", customerId: "CUS-2", timestamp: "2024-08-02T10:05:00Z" },
  ],
};

function RecommendationCard({ item }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{item.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.positive ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-700"
          }`}
          title="Confidence score"
        >
          {Math.round(item.confidence * 100)}% confidence
        </span>
      </div>

      <p className="text-sm text-slate-600">{item.summary}</p>

      <ul className="list-disc text-sm text-slate-700 ml-4 flex flex-col gap-1">
        {item.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </div>
  );
}

export default function BrainPanel({ rawData }) {
  const [recommendations, setRecommendations] = useState([]);
  const [healthScore, setHealthScore] = useState(100);
  const [history, setHistory] = useState([]);
  const [pipeline, setPipeline] = useState(null);

  // Pastikan dataset stabil untuk mencegah efek terpanggil berulang karena object identity berubah.
  // Jika parent mengirim object baru tiap render, idealnya distabilkan di parent.
  const dataset = useMemo(() => rawData ?? defaultRawData, [rawData]);

  useEffect(() => {
    const recs = getRecommendations(dataset);
    setRecommendations(recs);
    setHealthScore(scoreHealth(dataset));
    setHistory(loadRecommendationHistory());
    setPipeline(summarizePipeline(dataset));
  }, [dataset]);

  return (
    <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Otak Analitik</p>
            <h2 className="text-2xl font-semibold text-slate-900">Rekomendasi & Aksi</h2>
            <p className="text-sm text-slate-600 mt-1">
              Pipeline: input data → normalisasi → analisis → rekomendasi
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Health score</p>
            <p className="text-3xl font-bold text-indigo-600">{healthScore}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
          {recommendations.length === 0 && (
            <p className="text-sm text-slate-600">Tidak ada rekomendasi untuk dataset ini.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Riwayat</p>
          <h3 className="text-lg font-semibold text-slate-900">Snapshot rekomendasi</h3>
          <p className="text-sm text-slate-600">Disimpan di localStorage agar tetap ada saat reload.</p>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-auto pr-2">
          {history.map((entry) => (
            <div key={entry.timestamp} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500">
                {new Date(entry.timestamp).toLocaleString("id-ID")}
              </p>
              <p className="text-sm font-medium text-slate-900">
                {entry.recommendations?.length || 0} rekomendasi | health{" "}
                {entry.snapshot?.healthScore ?? "-"}
              </p>
              <ul className="list-disc text-xs text-slate-600 ml-4 mt-1">
                {(entry.recommendations || []).slice(0, 3).map((r) => (
                  <li key={r.id}>{r.title}</li>
                ))}
              </ul>
            </div>
          ))}

          {history.length === 0 && <p className="text-sm text-slate-600">Riwayat belum tersedia.</p>}
        </div>

        {pipeline && (
          <div className="border-t border-slate-200 pt-3 text-sm text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Ringkasan metrik:</p>
            <p>Order: {pipeline.normalized.metrics.totalOrders}</p>
            <p>
              Cancel: {(pipeline.normalized.metrics.cancellationRate * 100).toFixed(1)}% · Repeat:{" "}
              {(pipeline.normalized.metrics.repeatRate * 100).toFixed(1)}%
            </p>
            <p>
              Fulfillment: {pipeline.normalized.metrics.averageFulfillmentMinutes.toFixed(1)} menit ·
              Sentimen: {(pipeline.normalized.metrics.sentimentScore * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
