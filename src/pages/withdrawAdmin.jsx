import React, { useEffect, useState } from "react";
import { approveWithdraw } from "../lib/withdrawAdmin";

export default function WithdrawAdmin() {
  const [data, setData] = useState([]);

  const load = async () => {
    const res = await fetch("/api/withdraw/list");
    const json = await res.json();
    setData(json);
  };

  const confirm = async (id) => {
    await approveWithdraw(id);
    alert("Withdraw approved");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h2>Daftar Penarikan Mitra</h2>

      {data.map((w) => (
        <div key={w.id} style={{ margin: "10px 0", padding: 10, border: "1px solid #ddd" }}>
          <p>Mitra: {w.mitra_id}</p>
          <p>Jumlah: Rp {w.amount.toLocaleString()}</p>
          <p>Bank: {w.bank_name}</p>
          <p>Rek: {w.bank_number}</p>
          <p>Status: {w.status}</p>

          {w.status === "pending" && (
            <button onClick={() => confirm(w.id)}>Approve</button>
          )}
        </div>
      ))}
    </div>
  );
}
