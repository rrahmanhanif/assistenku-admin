// src/pages/Services.jsx
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [loading, setLoading] = useState(true);

  // ========================================================
  // LOAD DATA LAYANAN
  // ========================================================
  const loadServices = async () => {
    try {
      const snap = await getDocs(collection(db, "core_services"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(list);
    } catch (err) {
      console.error("Gagal memuat layanan:", err);
    }
    setLoading(false);
  };

  // ========================================================
  // TAMBAH LAYANAN BARU
  // ========================================================
  const addService = async () => {
    if (!newService || !basePrice) {
      alert("Nama layanan & harga dasar wajib diisi");
      return;
    }

    try {
      await addDoc(collection(db, "core_services"), {
        name: newService,
        base_price: Number(basePrice),
        created_at: Date.now(),
      });

      setNewService("");
      setBasePrice("");
      loadServices();
    } catch (err) {
      console.error("Gagal menambah layanan:", err);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  if (loading) return <p className="p-5">Memuat data layanan...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-600 mb-6">
        Manajemen Layanan
      </h1>

      {/* Input Tambah Layanan */}
      <div className="p-4 bg-white shadow rounded mb-5 flex gap-3">
        <input
          className="border p-2 rounded w-48"
          placeholder="Nama Layanan"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
        />

        <input
          className="border p-2 rounded w-32"
          placeholder="Harga Dasar"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />

        <button
          onClick={addService}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Tambah
        </button>
      </div>

      {/* List Layanan */}
      <div className="space-y-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="p-4 bg-white rounded shadow flex justify-between"
          >
            <div>
              <p className="font-semibold">{svc.name}</p>
              <p className="text-gray-600">
                Harga dasar: Rp {svc.base_price}
              </p>
            </div>

            <button
              onClick={() => alert("Edit layanan akan dibuat pada Step 3.14")}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
