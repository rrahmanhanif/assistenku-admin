// src/components/Sidebar.jsx
export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-blue-600 text-white p-4 space-y-2">
      <h2 className="text-xl font-bold mb-4">Assistenku Admin</h2>

      <nav className="space-y-2">
        <a href="/dashboard" className="block p-2 rounded hover:bg-blue-500">
          Dashboard Utama
        </a>

        <a href="/finance" className="block p-2 rounded hover:bg-blue-500">
          💰 Finance Enterprise
        </a>

        <a href="/reports" className="block p-2 rounded hover:bg-blue-500">
          📊 Laporan Bulanan
        </a>

        <a href="/transactions" className="block p-2 rounded hover:bg-blue-500">
          🧾 Riwayat Transaksi
        </a>

        <a href="/wallet" className="block p-2 rounded hover:bg-blue-500">
          💼 Dompet Digital
        </a>
      </nav>
    </aside>
  );
}
