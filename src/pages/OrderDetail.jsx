// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  async function loadDetail() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setOrder(data);
  }

  async function updateStatus(newStatus) {
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
  }

  useEffect(() => {
    loadDetail();

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        () => loadDetail()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  if (!order) return <div style={{ padding: 20 }}>Memuat...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📄 Detail Order #{order.id}</h1>

      <p>
        <b>Customer:</b> {order.customer_name}
      </p>
      <p>
        <b>Mitra:</b> {order.mitra_name || "-"}
      </p>
      <p>
        <b>Total Harga:</b> Rp{order.total_price}
      </p>
      <p>
        <b>Status:</b> {order.status}
      </p>

      <h3>Ubah Status</h3>

      <button onClick={() => updateStatus("pending")}>Pending</button>
      <button onClick={() => updateStatus("accepted")}>Diterima Mitra</button>
      <button onClick={() => updateStatus("on_the_way")}>Dalam Perjalanan</button>
      <button onClick={() => updateStatus("finished")}>Selesai</button>
      <button onClick={() => updateStatus("canceled")}>Dibatalkan</button>
    </div>
  );
}
