// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

import CardStat from "../components/CardStat";
import CustomerList from "../components/CustomerList";
import MitraList from "../components/MitraList";
import FinanceSummary from "../components/FinanceSummary";
import TransactionTable from "../components/TransactionTable";
import WithdrawRequest from "../components/WithdrawRequest";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    customers: 0,
    mitra: 0,
    orders: 0,
    income: 0,
  });

  const [loading, setLoading] = useState(true);

  // ============================
  // LOAD SUMMARY DASBOR
  // ============================
  const loadSummary = async () => {
    try {
      const snap = await getDoc(doc(db, "core_summary", "main"));

      if (snap.exists()) {
        setStats(snap.data());
      }
    } catch (err) {
      console.error("Error load summary:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) return <div className="p-5">Memuat dashboard...</div>;

  return (
    <div className="p-5 space-y-6">

      {/* ==== TOP SUMMARY ==== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardStat title="Total Customer" value={stats.customers} />
        <CardStat title="Total Mitra" value={stats.mitra} />
        <CardStat title="Total Order" value={stats.orders} />
        <CardStat title="Total Pendapatan" value={`Rp ${stats.income}`} />
      </div>

      {/* ==== FINANCE ==== */}
      <FinanceSummary />

      {/* ==== DAFTAR CUSTOMER & MITRA ==== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerList />
        <MitraList />
      </div>

      {/* ==== TRANSAKSI ==== */}
      <TransactionTable />

      {/* ==== WITHDRAW ==== */}
      <WithdrawRequest />

    </div>
  );
}
