import React from "react";

export default function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 900 }}>Dashboard Admin</div>
      <div style={{ marginTop: 8, color: "#555" }}>
        Login sukses. Berikutnya kita sambungkan ke modul data Supabase (services, pricing, orders, audit).
      </div>
    </div>
  );
}
