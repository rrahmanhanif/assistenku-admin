// src/components/WithdrawRequest.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { payoutToMitra } from "../api/payoutService";

export default function WithdrawRequest() {
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMitra = async () => {
      const snapshot = await getDocs(collection(db, "mitraSaldo"));
      setMitraList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchMitra();
  }, []);

  const handleWithdraw = async (mitra) => {
    if (mitra.saldo <= 0) return alert("Saldo mitra kosong.");
    setLoading(true);
    const result = await payoutToMitra(mitra, mitra.saldo);
    setLoading(false);
    alert(result.success ? "Penarikan berhasil" : "Gagal, coba lagi");
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Penarikan Saldo Mitra</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nama</th>
            <th>Bank</th>
            <th>Rekening</th>
            <th>Saldo</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {mitraList.map((m) => (
            <tr key={m.id}>
              <td className="p-2">{m.nama}</td>
              <td>{m.bankCode.toUpperCase()}</td>
              <td>{m.rekening}</td>
              <td>Rp {m.saldo.toLocaleString()}</td>
              <td>
                <button
                  onClick={() => handleWithdraw(m)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {loading ? "Proses..." : "Tarik"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
      }
