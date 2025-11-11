// src/pages/DashboardAdmin.jsx
import React from "react";
import useRealtimeData from "../hooks/useRealtimeData";
import Navbar from "../components/Navbar";

export default function DashboardAdmin() {
  const { mitra, customer, orders, transactions } = useRealtimeData();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Dashboard Realtime</h1>
        <p className="text-gray-500 mb-6">
          Data diperbarui otomatis dari aplikasi Mitra & Customer (tanpa refresh)
        </p>

        {/* Statistik singkat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Mitra Aktif" value={mitra.length} />
          <StatCard title="Customer Aktif" value={customer.length} />
          <StatCard title="Pesanan Berlangsung" value={orders.length} />
          <StatCard title="Transaksi Hari Ini" value={transactions.length} />
        </div>

        {/* Daftar data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DataCard title="Mitra Aktif" data={mitra} />
          <DataCard title="Customer Aktif" data={customer} />
          <DataCard title="Pesanan" data={orders} />
          <DataCard title="Transaksi" data={transactions} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

function DataCard({ title, data }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">{title}</h2>
      <div className="max-h-64 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada data</p>
        ) : (
          <ul className="text-sm text-gray-600 space-y-2">
            {data.map((item) => (
              <li key={item.id} className="border-b border-gray-100 pb-1">
                {JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
