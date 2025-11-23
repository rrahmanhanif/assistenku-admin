import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function MitraManagement() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMitra = async () => {
    const snap = await getDocs(collection(db, "mitra"));
    const arr = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
    setList(arr);
    setLoading(false);
  };

  const toggleStatus = async (id, current) => {
    await updateDoc(doc(db, "mitra", id), {
      active: !current,
    });
    loadMitra();
  };

  useEffect(() => {
    loadMitra();
  }, []);

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Manajemen Mitra</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Nama</th>
              <th className="p-2">Layanan</th>
              <th className="p-2">Status</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b last:border-none">
                <td className="p-2">{m.nama}</td>
                <td className="p-2 capitalize">{m.layanan}</td>
                <td className="p-2">
                  {m.active ? (
                    <span className="text-green-600 font-semibold">Aktif</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Nonaktif</span>
                  )}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => toggleStatus(m.id, m.active)}
                    className={`px-3 py-1 rounded text-white ${
                      m.active ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {m.active ? "Suspend" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
