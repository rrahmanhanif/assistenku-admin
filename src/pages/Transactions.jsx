import { useState } from "react";
import TransactionTable from "../components/TransactionTable";

export default function Transactions() {
  const [filter, setFilter] = useState({
    type: "all",
    status: "all",
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Laporan & Riwayat Transaksi</h1>

      <div className="flex gap-4 mb-6">
        <select
          className="border rounded p-2"
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="all">Semua Tipe</option>
          <option value="payment">Pembayaran</option>
          <option value="withdraw">Penarikan</option>
          <option value="topup">Top Up</option>
        </select>

        <select
          className="border rounded p-2"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="all">Semua Status</option>
          <option value="success">Berhasil</option>
          <option value="pending">Menunggu</option>
          <option value="failed">Gagal</option>
        </select>
      </div>

      <TransactionTable filter={filter} />
    </div>
  );
}

import { useState, useEffect } from "react";
import TransactionTable from "../components/TransactionTable";
import ExportButtons from "../components/ExportButtons";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export default function Transactions() {
  const [filter, setFilter] = useState({
    type: "all",
    status: "all",
  });

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    if (filter.type !== "all") q = query(q, where("type", "==", filter.type));
    if (filter.status !== "all") q = query(q, where("status", "==", filter.status));

    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [filter]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Laporan & Riwayat Transaksi</h1>

      <div className="flex gap-4 mb-4">
        <select
          className="border rounded p-2"
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="all">Semua Tipe</option>
          <option value="payment">Pembayaran</option>
          <option value="withdraw">Penarikan</option>
          <option value="topup">Top Up</option>
        </select>

        <select
          className="border rounded p-2"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="all">Semua Status</option>
          <option value="success">Berhasil</option>
          <option value="pending">Menunggu</option>
          <option value="failed">Gagal</option>
        </select>
      </div>

      <ExportButtons data={transactions} />
      <TransactionTable filter={filter} />
    </div>
  );
        }
