import AdminLayout from "../components/AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-white shadow rounded-lg">Mitra Terdaftar</div>
        <div className="p-6 bg-white shadow rounded-lg">Customer Terdaftar</div>
        <div className="p-6 bg-white shadow rounded-lg">Order Hari Ini</div>
        <div className="p-6 bg-white shadow rounded-lg">Withdraw Pending</div>
      </div>
    </AdminLayout>
  );
}
