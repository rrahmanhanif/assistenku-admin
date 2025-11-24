import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");

  const [basePrice, setBasePrice] = useState("");
  
  // Load services
  const loadServices = async () => {
    const snap = await getDocs(collection(db, "core_services"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setServices(list);
  };

  const addService = async () => {
    if (!newService || !basePrice) return;
    await addDoc(collection(db, "core_services"), {
      name: newService,
      base_price: Number(basePrice),
      created_at: Date.now(),
    });
    setNewService("");
    setBasePrice("");
    loadServices();
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-600 mb-5">
        Manajemen Layanan
      </h1>

      {/* Input Form */}
      <div className="p-4 bg-white shadow rounded-lg mb-6">
        <input
          className="border p-2 mr-2 rounded"
          placeholder="Nama Layanan"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
        />

        <input
          className="border p-2 mr-2 rounded"
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

      {/* List Services */}
      <div className="space-y-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="p-4 bg-white rounded shadow flex justify-between"
          >
            <div>
              <p className="font-semibold">{svc.name}</p>
              <p className="text-gray-600">Harga dasar: Rp{svc.base_price}</p>
            </div>

            <button
              onClick={() => alert("Edit segera dibuat di step berikutnya")}
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
