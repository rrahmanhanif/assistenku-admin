import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function Notification() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0]?.data();
      if (doc) setLatest(doc);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 p-3 rounded-lg mb-4">
      {latest ? (
        <p>
          🔔 Transaksi baru dari <b>{latest.customer}</b> ke Mitra{" "}
          <b>{latest.mitra}</b> sebesar{" "}
          <b>Rp {latest.total?.toLocaleString()}</b> sudah masuk sistem.
        </p>
      ) : (
        <p>Belum ada transaksi terbaru.</p>
      )}
    </div>
  );
    }
