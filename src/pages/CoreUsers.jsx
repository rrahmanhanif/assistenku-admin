import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function CoreUsers() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "core_users"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async () => {
    if (!email) return alert("Email wajib diisi");

    await addDoc(collection(db, "core_users"), {
      email,
      role,
      created_at: Date.now(),
    });

    setEmail("");
    setRole("viewer");
    loadUsers();
  };

  const removeUser = async (id) => {
    if (!window.confirm("Hapus admin ini?")) return;

    await deleteDoc(doc(db, "core_users", id));
    loadUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-600">Core Users</h1>

      {/* FORM TAMBAH USER */}
      <div className="mt-5 bg-white shadow p-5 rounded-lg">
        <h2 className="font-semibold mb-3">Tambah Admin / Finance / Viewer</h2>
        <div className="flex gap-3">
          <input
            className="border p-2 rounded w-64"
            placeholder="Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="finance">Finance</option>
            <option value="viewer">Viewer</option>
          </select>

          <button
            onClick={addUser}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Tambah
          </button>
        </div>
      </div>

      {/* LIST USER */}
      <div className="mt-6 bg-white shadow p-5 rounded-lg">
        <h2 className="font-semibold mb-3">Daftar User Core</h2>

        {loading ? (
          <p>Memuat...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">Belum ada user</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2">{u.email}</td>
                  <td className="py-2 capitalize">{u.role}</td>
                  <td className="py-2">
                    <button
                      onClick={() => removeUser(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
