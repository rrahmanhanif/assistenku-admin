// src/pages/Users.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function Users() {
  const [customers, setCustomers] = useState([]);
  const [mitra, setMitra] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const custSnap = await getDocs(collection(db, "customers"));
    const mitraSnap = await getDocs(collection(db, "mitra"));

    setCustomers(custSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setMitra(mitraSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    setLoading(false);
  };

  const deleteUser = async (collectionName, id) => {
    if (!window.confirm("Hapus user ini?")) return;

    await deleteDoc(doc(db, collectionName, id));
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="p-5">Memuat data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>

      {/* CUSTOMER */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Customer</h2>

        <div className="bg-white shadow rounded-lg p-4">
          {customers.length === 0 ? (
            <p className="text-gray-500">Tidak ada customer.</p>
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                className="flex justify-between border-b py-3 items-center"
              >
                <div>
                  <p className="font-semibold">{c.nama}</p>
                  <p className="text-sm text-gray-600">{c.email}</p>
                </div>

                <button
                  onClick={() => deleteUser("customers", c.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Hapus
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* MITRA */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Mitra</h2>

        <div className="bg-white shadow rounded-lg p-4">
          {mitra.length === 0 ? (
            <p className="text-gray-500">Tidak ada mitra.</p>
          ) : (
            mitra.map((m) => (
              <div
                key={m.id}
                className="flex justify-between border-b py-3 items-center"
              >
                <div>
                  <p className="font-semibold">{m.nama}</p>
                  <p className="text-sm text-gray-600">{m.email}</p>
                  <p className="text-sm text-gray-600">
                    Layanan: {m.layanan}
                  </p>
                </div>

                <button
                  onClick={() => deleteUser("mitra", m.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Hapus
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
