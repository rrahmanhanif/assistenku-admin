import React, { useEffect, useState } from "react";
import { getPlatformRevenue, getOrderReport } from "../modules/finance";

export default function Finance() {
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [orderList, setOrderList] = useState([]);

  useEffect(() => {
    loadFinanceData();
  }, []);

  async function loadFinanceData() {
    const revenue = await getPlatformRevenue();
    setPlatformRevenue(revenue?.total_fee ?? 0);

    const orders = await getOrderReport();
    setOrderList(orders);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard Keuangan Admin</h2>

      <div style={{ marginBottom: 15 }}>
        <strong>Total Pendapatan Platform:</strong>{" "}
        <span style={{ color: "green" }}>Rp {platformRevenue}</span>
      </div>

      <h3>Semua Pesanan</h3>
      <ul>
        {orderList.map((order) => (
          <li key={order.id}>
            Pesanan #{order.id} → Customer: {order.customer_id} — Total: Rp {order.amount} — Fee: Rp {order.platform_fee} — Mitra: Rp {order.mitra_receive} — Status: {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
