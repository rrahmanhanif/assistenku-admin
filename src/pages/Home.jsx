import React, { useState } from "react";
import { createOrder } from "../api/orderApi";

export default function Home() {
  const [loading, setLoading] = useState(false);

  async function handleCreateOrder() {
    setLoading(true);

    const customerId = localStorage.getItem("customer_id");
    const customerName = localStorage.getItem("customer_name");

    const serviceType = "home_assistant";
    const notes = "Butuh bantuan merawat orang tua";

    const { data, error } = await createOrder(
      customerId,
      customerName,
      serviceType,
      notes
    );

    setLoading(false);

    if (error) {
      alert("Gagal membuat pesanan: " + error.message);
      return;
    }

    alert("Pesanan berhasil dibuat! Menunggu admin assign mitra.");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Assistenku</h2>

      <button
        onClick={handleCreateOrder}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          fontSize: 16,
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "Memproses..." : "Buat Pesanan"}
      </button>
    </div>
  );
}
