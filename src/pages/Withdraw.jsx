import { useState } from "react";
import { withdrawMitra } from "../services/finance";

export default function Withdraw() {
  const [mitraId, setMitraId] = useState("");
  const [amount, setAmount] = useState("");

  const handleWithdraw = async () => {
    try {
      await withdrawMitra(mitraId, parseInt(amount));
      alert("Penarikan berhasil dan disetujui otomatis");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">Penarikan Dana Mitra</h2>
      <input
        className="border p-2 mr-2"
        placeholder="ID Mitra"
        value={mitraId}
        onChange={(e) => setMitraId(e.target.value)}
      />
      <input
        className="border p-2 mr-2"
        placeholder="Nominal"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleWithdraw}
      >
        Tarik Dana
      </button>
    </div>
  );
}
