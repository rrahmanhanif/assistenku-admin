import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";

export default function DashboardAdmin({ role }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    mitraActive: 0,
    customerTotal: 0,
    incomeToday: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  // ==============================
  // LOAD STATISTIK INTI ADMIN
  // ==============================
  const loadStats = async () => {
    try {
      // Orders total
      const qOrders = collection(db, "orders");
      const countOrders = await getCountFromServer(qOrders);

      // Mitra aktif
      const qMitra = query(
        collection(db, "mitra"),
        where("on_duty", "==", true)
      );
      const countMitra = await getCountFromServer(qMitra);

      // Total customer
      const qCustomer = collection(db, "customers");
      const countCustomer = await getCountFromServer(qCustomer);

      // Pendapatan hari ini
      const today = new Date().toISOString().split("T")[0];
      const qIncome = query(
        collection(db, "wallet_transactions"),
        where("tanggal", "==", today),
        where("tipe", "==", "pemasukan")
      );
      const incomeSnap = await getCountFromServer(qIncome);

      setStats({
        totalOrders: countOrders.data().count,
        mitraActive: countMitra.data().count,
        customerTotal: countCustomer.data().count,
        incomeToday: incomeSnap.data().count * 5000, // contoh perhitungan
      });
    } catch (err) {
      console.error("Error load stats:", err);
    }
  };

  return (
    <div className="p-6">
      {/* Judul */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Dashboard Admin
      </h1>
      <p className="text-gray-500 mb-6">
        Selamat datang kembali, Admin. Berikut ringkasan performa hari ini.
      </p>

      {/* === GRID STATISTIK UTAMA === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Mitra Aktif" value={stats.mitraActive} color="green" />
        <StatCard title="Total Customer" value={stats.customerTotal} color="blue" />
        <StatCard title="Pendapatan Hari Ini" value={`Rp ${stats.incomeToday.toLocaleString()}`} color="purple" />
      </div>

      {/* === SECTION ANALITIK === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Grafik Pesanan (7 Hari)">
          <div className="flex items-end gap-2 h-28">
            {[20, 35, 40, 25, 60, 70, 55].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="w-6 bg-blue-500 rounded"
              ></div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Aktivitas Sistem">
          <ul className="text-gray-600 text-sm leading-7">
            <li>• Realtime Order siap digunakan</li>
            <li>• GPS Mitra aktif pada 5 detik interval</li>
            <li>• Tidak ada error produksi hari ini</li>
            <li>• Database berjalan normal</li>
          </ul>
        </InfoCard>
      </div>
    </div>
  );
}

// ===========================
// COMPONENT CARD STATISTIK
// ===========================
function StatCard({ title, value, color = "gray" }) {
  const colorClass = {
    gray: "bg-gray-100",
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
  }[color];

  return (
    <div className={`p-4 rounded-xl shadow ${colorClass}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

// ===========================
// COMPONENT CARD BESAR
// ===========================
function InfoCard({ title, children }) {
  return (
    <div className="p-5 bg-white rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
