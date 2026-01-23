import React, { useEffect, useState } from "react";
import { approveWithdraw } from "../lib/withdrawAdmin";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export default function WithdrawAdmin() {
  const [data, setData] = useState([]);

  const load = async () => {
    const { data: json } = await httpClient.request({
      endpoint: endpoints.withdraw.list
    });
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

          {w.status !== "approved" && (
            <button onClick={() => confirm(w.id)} style={{ padding: "8px 12px", cursor: "pointer" }}>
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
