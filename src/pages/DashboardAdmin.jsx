// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function DashboardAdmin({ role }) {
  const [totalMitra, setTotalMitra] = useState(0);
  const [activeMitra, setActiveMitra] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [latestOrders, setLatestOrders] = useState([]);

  // ================================
  // LOAD DASHBOARD DATA
  // ================================
  useEffect(() => {
    loadMitra();
    loadOrdersToday();
    loadLatestOrders();
  }, []);

  // 🔵 Mitra Data
  const loadMitra = async () => {
    const col = collection(db, "mitra");

    const all = await getDocs(col);
    setTotalMitra(all.size);

    const activeQuery = query(col, where("on_duty", "==", true));
    const active = await getDocs(activeQuery);
    setActiveMitra(active.size);
  };

  // 🟢 Order hari ini + revenue
  const loadOrdersToday = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const col = collection(db, "orders");
    const qToday = query(col, where("created_at", ">=", today));

    const snap = await getDocs(qToday);

    let revenue = 0;
    snap.forEach((d) => {
      revenue += d.data().biaya_total || 0;
    });

    setTodayOrders(snap.size);
    setTodayRevenue(revenue);
  };

  // 🟣 5 Order Terbaru
  const loadLatestOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));

    const arr = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));

    arr.sort((a, b) => b.created_at - a.created_at);

    setLatestOrders(arr.slice(0, 5));
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <h1 className="text-2xl font-bold text-blue-700">
        Dashboard Admin
      </h1>
      <p className="text-gray-600">Selamat datang kembali administrator.</p>

      {/* ================= TOP STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <StatBox
          title="Total Mitra"
          value={totalMitra}
          color="bg-blue-600"
        />

        <StatBox
          title="Mitra Aktif"
          value={activeMitra}
          color="bg-green-600"
        />

        <StatBox
          title="Order Hari Ini"
          value={todayOrders}
          color="bg-indigo-600"
        />

        <StatBox
          title="Pendapatan Hari Ini"
          value={`Rp ${todayRevenue.toLocaleString()}`}
          color="bg-amber-600"
        />

      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Order Terbaru</h2>

        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2">ID</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Layanan</th>
                <th className="p-2">Biaya</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {latestOrders.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2">{o.customer_nama || "-"}</td>
                  <td className="p-2">{o.layanan}</td>
                  <td className="p-2">Rp {o.biaya_total?.toLocaleString()}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        o.status === "selesai"
                          ? "bg-green-600"
                          : o.status === "diterima"
                          ? "bg-blue-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

/* ===============================
   SMALL DASHBOARD BOX COMPONENT
================================= */
function StatBox({ title, value, color }) {
  return (
    <div className={`p-4 text-white rounded-lg shadow ${color}`}>
      <p className="text-sm opacity-80">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}
