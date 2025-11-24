// src/pages/Services.jsx
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [loading, setLoading] = useState(true);

  // For edit modal
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editId, setEditId] = useState(null);

  // ========================================================
  // LOAD SERVICES
  // ========================================================
  const loadServices = async () => {
    try {
      const snap = await getDocs(collection(db, "core_services"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setServices(list);
    } catch (err) {
      console.error("Gagal load layanan:", err);
    }
    setLoading(false);
  };

  // ========================================================
  // ADD NEW SERVICE
  // ========================================================
  const addService = async () => {
    if (!newService || !basePrice) return alert("Isi semua data!");

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

  // ========================================================
  // OPEN EDIT MODAL
  // ========================================================
  const openEdit = (svc) => {
    setEditId(svc.id);
    setEditName(svc.name);
    setEditPrice(svc.base_price);
    setEditModal(true);
  };

  // ========================================================
  // SAVE EDIT SERVICE
  // ========================================================
  const saveEdit = async () => {
    try {
      const ref = doc(db, "core_services", editId);
      await updateDoc(ref, {
        name: editName,
        base_price: Number(editPrice),
      });

      setEditModal(false);
      loadServices();
    } catch (err) {
      console.error("Gagal update layanan:", err);
    }
  };

  // ========================================================
  // DELETE SERVICE
  // ========================================================
  const deleteService = async (id) => {
    if (!confirm("Hapus layanan ini?")) return;

    try {
      await deleteDoc(doc(db, "core_services", id));
      loadServices();
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  if (loading) return <p className="p-5">Memuat layanan...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Manajemen Layanan</h1>

      {/* ADD FORM */}
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

      {/* LIST SERVICES */}
      <div className="space-y-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">{svc.name}</p>
              <p className="text-gray-600">Harga dasar: Rp {svc.base_price}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => openEdit(svc)}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteService(svc.id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-80">
            <h2 className="text-xl font-semibold mb-3">
              Edit Layanan
            </h2>

            <input
              className="border p-2 w-full rounded mb-2"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded mb-4"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(false)}
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
