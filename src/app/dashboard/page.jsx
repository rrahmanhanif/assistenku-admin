"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    supabaseAdmin.from('orders').select('*')
      .then(res => setData(res.data))
      .catch(err => console.error("Admin Supabase error:", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      <div className="mt-4 space-y-2">
        {data.map(order => (
          <div key={order.id} className="bg-white p-4 border rounded-md">
            <p><strong>Order #{order.id}</strong></p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
