// src/pages/ServiceManagement.jsx
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    gateway_fee: 2, // default 2%
  });

  const loadServices = async () => {
    const snap = await getDocs(collection(db, "core_services"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setServices(list);
  };

  const saveService = async () => {
    if (!form.name || !form.base_price) return alert("Lengkapi data!");

    await addDoc(collection(db, "core_services"), {
      name: form.name,
      description: form.description,
      base_price: Number(form.base_price),
      gateway_fee: Number(form.gateway_fee),
      active: true,
      created_at: new Date(),
    });

    setForm({ name: "", description: "", base_price: "", gateway_fee: 2 });
    loadServices();
  };

  const toggleActive = async (id, active) => {
    await updateDoc(doc(db, "core_services", id), { active: !active });
    loadServices();
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        Manajemen Layanan
      </h2>

      {/* FORM TAMBAH */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Tambah Layanan Baru</h3>

        <div className="space-y-3">
          <input
            className="w-full p-2 border rounded"
            placeholder="Nama Layanan"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            className="w-full p-2 border rounded"
            placeholder="Deskripsi"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            className="w-full p-2 border rounded"
            placeholder="Harga Dasar (Rp)"
            type="number"
            value={form.base_price}
            onChange={(e) =>
              setForm({ ...form, base_price: e.target.value })
            }
          />

          <input
            className="w-full p-2 border rounded"
            type="number"
            placeholder="Gateway Fee (%)"
            value={form.gateway_fee}
            onChange={(e) =>
              setForm({ ...form, gateway_fee: e.target.value })
            }
          />

          <button
            onClick={saveService}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Simpan Layanan
          </button>
        </div>
      </div>

      {/* LIST DATA */}
      <div className="bg-white shadow p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Daftar Layanan</h3>

        {services.length === 0 ? (
          <p className="text-gray-500">Belum ada layanan</p>
        ) : (
          services.map((srv) => (
            <div
              key={srv.id}
              className="p-3 border rounded-lg mb-2 flex justify-between"
            >
              <div>
                <p className="font-semibold">{srv.name}</p>
                <p className="text-sm text-gray-600">
                  Harga Dasar: Rp {srv.base_price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Gateway Fee: {srv.gateway_fee}%
                </p>
              </div>

              <button
                onClick={() => toggleActive(srv.id, srv.active)}
                className={`px-3 py-1 rounded ${
                  srv.active
                    ? "bg-green-600 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {srv.active ? "Aktif" : "Nonaktif"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
