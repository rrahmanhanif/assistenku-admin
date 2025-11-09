import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Transactions() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(arr);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transaksi Terbaru</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-blue-100 text-left">
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Mitra</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id}>
              <td className="border p-2">{t.date}</td>
              <td className="border p-2">{t.customerName}</td>
              <td className="border p-2">{t.mitraName}</td>
              <td className="border p-2">Rp {t.total.toLocaleString()}</td>
              <td className="border p-2 text-green-600">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleCalculate = async (trx) => {
    const coreShare = trx.amount * 0.25;
    const mitraShare = trx.amount * 0.75;
    const feePercent = trx.gatewayFee / trx.amount;

    let customerPay = trx.amount;
    let coreNet = coreShare;

    if (feePercent > 0.02) {
      customerPay += trx.gatewayFee;
    } else {
      coreNet -= trx.gatewayFee;
    }

    await updateDoc(doc(db, "transactions", trx.id), {
      mitraShare,
      coreNet,
      customerPay,
      destinationBank: "BRI 035901073215504 a/n Abdurrahman Hanif",
    });
  };

  return (
    <div>
      <h3>Transaksi</h3>
      {transactions.map((trx) => (
        <div key={trx.id}>
          <p>ID: {trx.id}</p>
          <p>Nominal: Rp{trx.amount}</p>
          <button onClick={() => handleCalculate(trx)}>Proses Pembagian</button>
          {trx.mitraShare && (
            <p>➡ Mitra: Rp{trx.mitraShare} | Core: Rp{trx.coreNet} | Dibayar Customer: Rp{trx.customerPay}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// ...import yang lama
import { doc, getDoc, updateDoc } from "firebase/firestore";
// di dalam handleSubmit setelah addDoc transaksi:

// update saldo otomatis
const customerRef = doc(db, "wallets", "customer");
const mitraRef = doc(db, "wallets", "mitra");
const coreRef = doc(db, "wallets", "core");

const cSnap = await getDoc(customerRef);
const mSnap = await getDoc(mitraRef);
const oSnap = await getDoc(coreRef);

const customerBalance = cSnap.data()?.balance || 0;
const mitraBalance = mSnap.data()?.balance || 0;
const coreBalance = oSnap.data()?.balance || 0;

// potong saldo customer, bagi ke mitra & core
await updateDoc(customerRef, { balance: customerBalance - total });
await updateDoc(mitraRef, { balance: mitraBalance + mitraShare });
await updateDoc(coreRef, { balance: coreBalance + coreShare });

export default Transactions;
