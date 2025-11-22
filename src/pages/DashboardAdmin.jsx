import AdminLayout from "../layout/AdminLayout";
import { auth } from "../firebase";

export default function Dashboard() {
  const logout = async () => await auth.signOut();

  return (
    <AdminLayout onLogout={logout}>
      <h1>Dashboard Realtime Assistenku-Core</h1>

      {/* … konten dashboard kamu … */}
    </AdminLayout>
  );
}
