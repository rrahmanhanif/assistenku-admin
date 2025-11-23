// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function DashboardAdmin({ role }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalMitra: 0,
    totalCustomer: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const ordersSnap = await getDocs(collection(db, "orders"));
      const mitraSnap = await getDocs(collection(db, "mitra"));
      const customerSnap = await getDocs(collection(db, "customers"));

      let totalRevenue = 0;
      ordersSnap.forEach((o) => {
        totalRevenue += o.data().total_bayar || 0;
      });

      setStats({
        totalOrders: ordersSnap.size,
        totalMitra: mitraSnap.size,
        totalCustomer: customerSnap.size,
        revenue: totalRevenue,
      });
    } catch (e) {
      console.error("Gagal load statistik:", e);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Dashboard Admin
      </h1>

      {/* GRID STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <StatBox 
          label="Total Pesanan"
          value={stats.totalOrders}
          icon="📦"
        />

        <StatBox
          label="Total Mitra Terdaftar"
          value={stats.totalMitra}
          icon="🧑‍🔧"
        />

        <StatBox
          label="Total Customer"
          value={stats.totalCustomer}
          icon="👥"
        />

        <StatBox
          label="Pendapatan (Gross)"
          value={"Rp " + stats.revenue.toLocaleString("id-ID")}
          icon="💰"
        />
      </div>

      {/* ROLE INFORMATION */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 font-medium">
          Anda login sebagai: <b>{role.toUpperCase()}</b>
        </p>
      </div>
    </div>
  );
}

/* COMPONENT */
function StatBox({ label, value, icon }) {
  return (
    <div className="bg-white shadow rounded-lg p-5 border flex items-center gap-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
