import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) console.error(error);
    else setHistory(data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Riwayat Semua Pesanan</h2>
      {history.length === 0 && <p>Tidak ada riwayat pesanan</p>}
      <ul>
        {history.map((order) => (
          <li key={order.id}>
            Pesanan <b>#{order.id}</b> — Customer: <b>{order.customer_id}</b> — Status: <b>{order.status}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
