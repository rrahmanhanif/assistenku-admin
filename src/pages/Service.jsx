// src/pages/Services.jsx
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [loading, setLoading] = useState(true);

  // EDIT STATES
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // ========================================================
  // LOAD DATA
  // ========================================================
  const loadServices = async () => {
    try {
      const snap = await getDocs(collection(db, "core_services"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setServices(list);
    } catch (err) {
      console.error("Load services failed:", err);
    }
    setLoading(false);
  };

  // ========================================================
  // TAMBAH LAYANAN
  // ========================================================
  const addService = async () => {
    if (!newService || !basePrice) return alert("Lengkapi data layanan");

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
      console.error("Add service failed:", err);
    }
  };

  // ========================================================
  // BUKA MODAL EDIT
  // ========================================================
  const openEdit = (svc) => {
    setEditItem(svc);
    setEditName(svc.name);
    setEditPrice(svc.base_price);
  };

  // ========================================================
  // SIMPAN EDIT
  // ========================================================
  const saveEdit = async () => {
    if (!editName || !editPrice) return alert("Lengkapi data edit layanan.");

    try {
      await updateDoc(doc(db, "core_services", editItem.id), {
        name: editName,
        base_price: Number(editPrice),
        updated_at: Date.now(),
      });

      setEditItem(null);
      loadServices();
    } catch (err) {
      console.error("Update failed:", err);
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

      {/* INPUT TAMBAH LAYANAN */}
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

      {/* LIST LAYANAN */}
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
              onClick={() => openEdit(svc)}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* ======================== */}
      {/* MODAL EDIT LAYANAN       */}
      {/* ======================== */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-80 p-5 rounded shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-blue-600">
              Edit Layanan
            </h2>

            <input
              className="border p-2 rounded w-full mb-3"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <input
              className="border p-2 rounded w-full mb-3"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditItem(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Batal
              </button>

              <button
                onClick={saveEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
