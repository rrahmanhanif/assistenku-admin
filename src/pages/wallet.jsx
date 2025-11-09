import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Wallet() {
  const [wallets, setWallets] = useState({ customer: 0, mitra: 0, core: 0 });
  const [topupAmount, setTopupAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // ambil saldo realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "wallets"), (snap) => {
      let data = { customer: 0, mitra: 0, core: 0 };
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.role === "customer") data.customer = d.balance || 0;
        if (d.role === "mitra") data.mitra = d.balance || 0;
        if (d.role === "core") data.core = d.balance || 0;
      });
      setWallets(data);
    });
    return () => unsub();
  }, []);

  // inisialisasi saldo
  const ensureWalletExists = async (role) => {
    const ref = doc(db, "wallets", role);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { role, balance: 0 });
    }
  };

  useEffect(() => {
    ["customer", "mitra", "core"].forEach((r) => ensureWalletExists(r));
  }, []);

  // top up customer
  const handleTopup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const amount = parseFloat(topupAmount);
    const ref = doc(db, "wallets", "customer");
    const snap = await getDoc(ref);
    const prev = snap.data()?.balance || 0;
    await updateDoc(ref, { balance: prev + amount });
    await addDoc(collection(db, "topups"), {
      role: "customer",
      amount,
      timestamp: serverTimestamp(),
    });
    setTopupAmount("");
    setLoading(false);
    alert("Top-up berhasil!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">💼 Dompet Digital (Saldo Virtual)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg text-center shadow">
          <h2 className="font-semibold">Saldo Customer</h2>
          <p className="text-2xl font-bold">Rp {wallets.customer.toLocaleString()}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center shadow">
          <h2 className="font-semibold">Saldo Mitra</h2>
          <p className="text-2xl font-bold">Rp {wallets.mitra.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center shadow">
          <h2 className="font-semibold">Saldo Core</h2>
          <p className="text-2xl font-bold">Rp {wallets.core.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleTopup} className="bg-gray-50 p-4 rounded-lg shadow max-w-md">
        <h3 className="font-semibold mb-2">Top-up Customer (Simulasi VA)</h3>
        <input
          type="number"
          placeholder="Masukkan nominal"
          value={topupAmount}
          onChange={(e) => setTopupAmount(e.target.value)}
          required
          className="block w-full p-2 mb-3 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Memproses..." : "Top-up"}
        </button>
      </form>
    </div>
  );
}
