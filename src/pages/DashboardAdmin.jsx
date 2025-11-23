// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function DashboardAdmin({ role }) {
  const [stats, setStats] = useState({
    customers: 0,
    mitra: 0,
    ordersTotal: 0,
    ordersToday: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      // CUSTOMER
      const snapCustomer = await getCountFromServer(collection(db, "customer"));

      // MITRA
      const snapMitra = await getCountFromServer(collection(db, "mitra"));

      // ORDER TOTAL
      const snapOrderTotal = await getCountFromServer(collection(db, "orders"));

      // ORDER TODAY
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const qToday = query(
        collection(db, "orders"),
        where("created_at", ">=", today)
      );

      const snapOrderToday = await getCountFromServer(qToday);

      setStats({
        customers: snapCustomer.data().count,
        mitra: snapMitra.data().count,
        ordersTotal: snapOrderTotal.data().count,
        ordersToday: snapOrderToday.data().count,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error load stats:", err);
    }
  };

  useEffect(() => {
    loadStats(); // pertama kali

    // auto-refresh 3 detik seperti sistem enterprise
    const interval = setInterval(loadStats, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="p-5">Memuat statistik...</p>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-500">Mode: {role?.toUpperCase()}</p>
      </div>

      {/* GRID STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <BoxStat
          title="Total Customer"
          value={stats.customers}
          color="bg-blue-600"
        />

        <BoxStat
          title="Total Mitra"
          value={stats.mitra}
          color="bg-green-600"
        />

        <BoxStat
          title="Total Order"
          value={stats.ordersTotal}
          color="bg-indigo-600"
        />

        <BoxStat
          title="Order Hari Ini"
          value={stats.ordersToday}
          color="bg-orange-600"
        />
      </div>

      {/* SECTION TAMBAHAN */}
      <div className="mt-10 p-5 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Aktivitas Sistem</h2>
        <p className="text-gray-600">
          Monitoring status sistem, performa layanan, fraud detection, 
          dan enterprise logs akan muncul pada versi berikutnya.
        </p>
      </div>

    </div>
  );
}

/* COMPONENT CARD */
function BoxStat({ title, value, color }) {
  return (
    <div className="p-5 rounded-xl shadow bg-white border flex flex-col">
      <p className="text-gray-600 text-sm mb-1">{title}</p>

      <p className="text-3xl font-bold text-gray-900">{value}</p>

      <div className={`mt-3 h-2 rounded-full ${color}`} />
    </div>
  );
}
