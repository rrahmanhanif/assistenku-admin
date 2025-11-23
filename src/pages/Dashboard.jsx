import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [mitraOnline, setMitraOnline] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);
  const [loading, setLoading] = useState(true);

  // =============================
  // 1. Hitung total mitra online
  // =============================
  const loadMitra = async () => {
    const { data } = await supabase
      .from("mitra")
      .select("id, on_duty");

    if (data) {
      const online = data.filter((m) => m.on_duty === true).length;
      setMitraOnline(online);
    }
  };

  // =============================
  // 2. Hitung total orders
  // =============================
  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*");

    if (data) {
      setTotalOrders(data.length);

      const today = new Date().toISOString().split("T")[0];
      const todayOrders = data.filter((o) => o.created_at.startsWith(today));
      setOrdersToday(todayOrders.length);
    }
  };

  // =============================
  // 3. Listener realtime orders
  // =============================
  const listenOrderRealtime = () => {
    supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadOrders();
        }
      )
      .subscribe();
  };

  // =============================
  // 4. Listener realtime mitra
  // =============================
  const listenMitraRealtime = () => {
    supabase
      .channel("mitra-admin")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mitra" },
        () => {
          loadMitra();
        }
      )
      .subscribe();
  };

  // =============================
  // Lifecycle
  // =============================
  useEffect(() => {
    Promise.all([loadMitra(), loadOrders()]).then(() => {
      setLoading(false);
    });

    listenOrderRealtime();
    listenMitraRealtime();
  }, []);

  if (loading) return <div className="p-5">Memuat dashboard...</div>;

  // =============================
  // UI Dashboard Admin
  // =============================
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold text-blue-600 mb-5">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="p-5 bg-white shadow rounded-lg">
          <p className="text-gray-500">Mitra Online</p>
          <h2 className="text-3xl font-bold text-green-600">{mitraOnline}</h2>
        </div>

        <div className="p-5 bg-white shadow rounded-lg">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-3xl font-bold text-blue-600">{totalOrders}</h2>
        </div>

        <div className="p-5 bg-white shadow rounded-lg">
          <p className="text-gray-500">Order Hari Ini</p>
          <h2 className="text-3xl font-bold text-purple-600">{ordersToday}</h2>
        </div>

      </div>
    </div>
  );
}
