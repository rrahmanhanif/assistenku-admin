import { useEffect, useState } from "react";
import { getAllUsers, createUser, updateUser, deleteUser } from "../services/adminCRUD";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "customer" });

  async function load() {
    const data = await getAllUsers();
    setUsers(data);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    await createUser(form);
    await load();
  }

  async function handleUpdate(id, newData) {
    await updateUser(id, newData);
    await load();
  }

  async function handleDelete(id) {
    await deleteUser(id);
    await load();
  }

  return (
    <div>
      <h2>Kelola Users</h2>

      <input placeholder="Nama" onChange={e => setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
      <select onChange={e => setForm({...form, role:e.target.value})}>
        <option value="admin">Admin</option>
        <option value="mitra">Mitra</option>
        <option value="customer">Customer</option>
      </select>

      <button onClick={handleCreate}>Tambah User</button>

      <table>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleUpdate(u.id, { role:"mitra" })}>Jadikan Mitra</button>
                <button onClick={() => handleDelete(u.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
