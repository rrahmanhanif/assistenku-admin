// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
  }

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Daftar Order</h1>
      <div style={{ marginTop: 20 }}>
        {orders.map((o) => (
          <Link
            to={`/orders/${o.id}`}
            key={o.id}
            style={{
              display: "block",
              padding: 12,
              background: "#f3f3f3",
              marginBottom: 10,
              borderRadius: 8,
              textDecoration: "none",
              color: "#333",
            }}
          >
            <div>
              <b>ID:</b> {o.id}
            </div>
            <div>
              <b>Customer:</b> {o.customer_name}
            </div>
            <div>
              <b>Total:</b> Rp{o.total_price}
            </div>
            <div>
              <b>Status:</b>{" "}
              <span style={{ color: "green", fontWeight: "bold" }}>
                {o.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
