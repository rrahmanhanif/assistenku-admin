import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";

import {
  Line,
  Bar,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function DashboardFinanceEnterprise({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [range, setRange] = useState("7"); // default 7 hari
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData(range);
  }, [range]);

  async function loadData(days) {
    setLoading(true);

    try {
      const now = new Date();
      const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const q = query(
        collection(db, "transactions"),
        where("createdAt", ">=", past),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        date: d.data().createdAt?.toDate(),
      }));

      setTransactions(list);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  // ==== GROUP DATA PER DAY ====
  const grouped = {};
  transactions.forEach((t) => {
    const d = t.date.toLocaleDateString("id-ID");
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(t);
  });

  const dailyLabels = Object.keys(grouped).reverse();
  const dailyIncome = dailyLabels.map((d) =>
    grouped[d].reduce((sum, x) => sum + (x.amount || 0), 0)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar onLogout={onLogout} />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Dashboard Finance — Enterprise Mode
        </h1>

        {/* FILTER */}
        <div className="flex gap-3 mb-6">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border p-2 rounded-lg shadow-sm"
          >
            <option value="1">Hari Ini</option>
            <option value="2">2 Hari</option>
            <option value="7">7 Hari Terakhir</option>
            <option value="14">14 Hari</option>
            <option value="30">30 Hari</option>
          </select>
        </div>

        {/* === DAILY CHART === */}
        <div className="bg-white p-4 rounded-xl shadow mb-8">
          <h2 className="text-lg font-bold mb-3">Grafik Pendapatan Harian</h2>

          <Line
            data={{
              labels: dailyLabels,
              datasets: [
                {
                  label: "Pendapatan Harian (Rp)",
                  data: dailyIncome,
                  borderColor: "rgba(37, 99, 235, 1)",
                  backgroundColor: "rgba(37, 99, 235, 0.3)",
                  tension: 0.3,
                },
              ],
            }}
          />
        </div>

        {/* === BAR CHART === */}
        <div className="bg-white p-4 rounded-xl shadow mb-8">
          <h2 className="text-lg font-bold mb-3">Total Pendapatan Per Hari</h2>

          <Bar
            data={{
              labels: dailyLabels,
              datasets: [
                {
                  label: "Total (Rp)",
                  data: dailyIncome,
                  backgroundColor: "rgba(59, 130, 246, 0.6)",
                },
              ],
            }}
          />
        </div>

        {/* === TABLE GROUP BY DAY === */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Detail Transaksi</th>
              </tr>
            </thead>

            <tbody>
              {dailyLabels.map((day) => (
                <tr key={day} className="border-b">
                  <td className="px-4 py-3 font-semibold">{day}</td>
                  <td className="px-4 py-3 text-green-600 font-bold">
                    Rp {dailyIncome[dailyLabels.indexOf(day)].toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 underline">
                        Lihat {grouped[day].length} transaksi
                      </summary>

                      <ul className="mt-2 space-y-1 text-gray-700">
                        {grouped[day].map((t) => (
                          <li
                            key={t.id}
                            className="border p-2 rounded bg-gray-50"
                          >
                            <b>{t.app || "-"}</b> — Rp{" "}
                            {t.amount?.toLocaleString("id-ID")}
                            <br />
                            {t.description || "Tanpa deskripsi"}
                            <br />
                            <small className="text-gray-500">
                              {t.date.toLocaleTimeString("id-ID")}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="text-center py-6 text-blue-600">Memuat data...</p>
        )}
      </div>
    </div>
  );
    }  background: "#f8f9fa",
  borderRadius: "10px",
  padding: "1rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const valueStyle = {
  fontSize: "1.4rem",
  fontWeight: "bold",
  marginTop: "0.5rem",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  borderRadius: "10px",
  overflow: "hidden",
};
