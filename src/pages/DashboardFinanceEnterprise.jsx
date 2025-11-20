// src/pages/DashboardFinanceEnterprise.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";

// ⚠ REGISTER CHART JS
import "../components/Charts";

import { Line, Bar } from "react-chartjs-2";

export default function DashboardFinanceEnterprise() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [range, setRange] = useState(7);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "core_finance"));
        const arr = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            ...raw,
            date: raw.date?.toDate
              ? raw.date.toDate()
              : new Date(raw.date || Date.now()),
          };
        });
        setTransactions(arr);
      } catch (err) {
        console.error("Finance Fetch Error:", err);
      }
      setLoading(false);
    };

    load();
  }, []);

  // filter sesuai range
  const filtered = transactions.filter(
    (t) => t.date >= new Date(Date.now() - range * 86400000)
  );

  // group by tanggal
  const grouped = {};
  filtered.forEach((t) => {
    const key = t.date.toLocaleDateString("id-ID");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const labels = Object.keys(grouped);
  const dailyTotals = labels.map((day) =>
    grouped[day].reduce((sum, x) => sum + (x.amount || 0), 0)
  );

  if (loading) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Dashboard Finance Enterprise
        </h1>

        {/* RENTANG */}
        <div className="mb-4">
          <label className="font-semibold">Rentang Waktu:</label>
          <select
            className="ml-2 p-2 border rounded"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
          >
            <option value="7">7 Hari</option>
            <option value="14">14 Hari</option>
            <option value="30">30 Hari</option>
          </select>
        </div>

        {/* LINE */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-3">Grafik Pendapatan Harian</h2>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Pendapatan (Rp)",
                  data: dailyTotals,
                  borderColor: "rgba(37,99,235,1)",
                  backgroundColor: "rgba(37,99,235,0.3)",
                  tension: 0.3,
                },
              ],
            }}
          />
        </div>

        {/* BAR */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Total Pendapatan per Hari</h2>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Total (Rp)",
                  data: dailyTotals,
                  backgroundColor: "rgba(59,130,246,0.6)",
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
          }
