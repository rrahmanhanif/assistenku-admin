// src/components/MapMonitor.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function MapMonitor() {
  const [mitra, setMitra] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mitra_activity"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setMitra(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h3 className="font-semibold text-blue-700 mb-2">Peta Aktivitas Mitra</h3>
      <div className="text-sm text-gray-600 max-h-60 overflow-y-auto">
        {mitra.length === 0 ? (
          <p>Belum ada mitra aktif...</p>
        ) : (
          mitra.map((m) => (
            <div
              key={m.uid}
              className="mb-2 p-2 border-b border-gray-200 bg-white rounded"
            >
              <strong>{m.email}</strong>
              <div>Status: {m.status}</div>
              {m.location && (
                <div>
                  Lokasi:{" "}
                  <span className="text-blue-600">
                    {m.location.latitude.toFixed(4)}, {m.location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
