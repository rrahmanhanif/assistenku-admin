import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export default function TransactionTable({ filter }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));

    if (filter.type && filter.type !== "all") {
      q = query(q, where("type", "==", filter.type));
    }
    if (filter.status && filter.status !== "all") {
      q = query(q, where("status", "==", filter.status));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(list);
    });

    return () => unsub();
  }, [filter]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Riwayat Transaksi</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Tanggal</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Tipe</th>
              <th className="border p-2">Jumlah (Rp)</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-3 text-gray-400">
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id}>
                  <td className="border p-2">{new Date(t.timestamp?.toDate()).toLocaleString()}</td>
                  <td className="border p-2">{t.userEmail}</td>
                  <td className="border p-2 capitalize">{t.type}</td>
                  <td className="border p-2 text-right">{t.amount.toLocaleString()}</td>
                  <td
                    className={`border p-2 font-semibold ${
                      t.status === "success"
                        ? "text-green-600"
                        : t.status === "pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {t.status}
                  </td>
                  <td className="border p-2">{t.description || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
