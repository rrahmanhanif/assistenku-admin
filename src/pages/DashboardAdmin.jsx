// src/pages/DashboardAdmin.jsx
import React from "react";
import MapMonitor from "../components/MapMonitor";
import MitraList from "../components/MitraList";
import CustomerList from "../components/CustomerList";
import OrdersMonitor from "../components/OrdersMonitor";
import Transactions from "./Transactions";

const DashboardAdmin = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Dashboard Admin</h1>
        <p className="text-gray-500">Pantau aktivitas Mitra & Customer</p>
      </header>

      {/* Grid utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 🗺️ Peta Aktivitas */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Peta Aktivitas</h2>
          <MapMonitor />
        </div>

        {/* 👥 Mitra Aktif */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Mitra Aktif</h2>
          <MitraList />
        </div>

        {/* 👤 Customer Aktif */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Customer Aktif</h2>
          <CustomerList />
        </div>

        {/* 🧾 Pesanan Berlangsung */}
        <div className="bg-white p-4 rounded-xl shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Pesanan Berlangsung</h2>
          <OrdersMonitor />
        </div>

        {/* 💰 Transaksi */}
        <div className="bg-white p-4 rounded-xl shadow-sm md:col-span-3">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Transaksi Terbaru</h2>
          <Transactions />
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
