// src/pages/DashboardAdmin.jsx
import React from "react";
import useRealtimeData from "../hooks/useRealtimeData";
import Navbar from "../components/Navbar";
import { buatPesanan } from "../core/orderFlow"; // ✅ integrasi smart order Tahap 25

export default function DashboardAdmin() {
  const { mitra, customer, orders, transactions } = useRealtimeData();

  // 🔹 Fungsi simulasi order baru
  const handleSimulasiOrder = async () => {
    try {
      await buatPesanan("cust001", "mitra001", {
        tipe: "harian",
        durasi: 1,
        isRamai: true,
        isLembur: false,
        isCancel: false,
        baseRate: 150000,
      });
      alert("✅ Simulasi order berhasil dibuat dan tersimpan di Firestore!");
    } catch (error) {
      console.error(error);
      alert("❌ Gagal membuat simulasi order: " + error.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-6">
        {/* Judul utama */}
        <h1 className="text-2xl font-bold text-blue-700 mb-2">
          Dashboard Realtime Assistenku-Core
        </h1>
        <p className="text-gray-500 mb-6">
          Memantau data otomatis dari aplikasi Mitra & Customer (tanpa refresh)
        </p>

        {/* Tombol simulasi order */}
        <div className="mb-6">
          <button
            onClick={handleSimulasiOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            🔹 Simulasi Pesanan Baru
          </button>
        </div>

        {/* Statistik singkat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Mitra Aktif" value={mitra.length} />
          <StatCard title="Customer Aktif" value={customer.length} />
          <StatCard title="Pesanan Aktif" value={orders.length} />
          <StatCard title="Transaksi Hari Ini" value={transactions.length} />
        </div>

        {/* Data realtime */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DataCard title="📍 Mitra Aktif" data={mitra} />
          <DataCard title="👤 Customer Aktif" data={customer} />
          <DataCard title="🧾 Pesanan Berlangsung" data={orders} />
          <DataCard title="💰 Transaksi Terbaru" data={transactions} />
        </div>
      </div>
    </div>
  );
}

/* ======================== */
/* 🔸 Komponen kartu kecil */
/* ======================== */
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

/* ======================== */
/* 🔸 Komponen daftar data */
/* ======================== */
function DataCard({ title, data }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">{title}</h2>
      <div className="max-h-64 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Belum ada data</p>
        ) : (
          <ul className="text-sm text-gray-600 space-y-2">
            {data.map((item, index) => (
              <li
                key={item.id || index}
                className="border-b border-gray-100 pb-1 break-words"
              >
                {JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  }
