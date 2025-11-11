// src/pages/Transactions.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
      } catch (error) {
        console.error("Gagal memuat transaksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // 🔄 Update status transaksi secara manual (opsional)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const ref = doc(db, "transactions", id);
      await updateDoc(ref, { status: newStatus });
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
      );
      alert(`Status transaksi ${id} diperbarui menjadi ${newStatus}`);
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
      alert("Gagal memperbarui status transaksi.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-blue-600 font-semibold">Memuat transaksi...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Daftar Transaksi</h1>

      {transactions.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <p>Tidak ada transaksi ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-2xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Mitra</th>
                <th className="px-4 py-3 text-left">Nominal</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b hover:bg-blue-50 transition duration-100"
                >
                  <td className="px-4 py-3 font-mono text-gray-700">{tx.id}</td>
                  <td className="px-4 py-3">{tx.customerName || "-"}</td>
                  <td className="px-4 py-3">{tx.mitraName || "-"}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    Rp{tx.amount?.toLocaleString("id-ID") || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.status === "selesai"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "proses"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tx.status || "belum diproses"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusUpdate(tx.id, "selesai")}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                    >
                      Tandai Selesai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
