// src/components/AdminLayout.jsx
import { NavLink } from "react-router-dom";

export default function AdminLayout({ children, onLogout }) {
  return (
    <div className="w-full h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg border-r hidden md:flex flex-col">
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold text-blue-600">Assistenku Admin</h1>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2">
          <MenuItem to="/dashboard" label="Dashboard" />
          <MenuItem to="/finance" label="Finance" />
          <MenuItem to="/reports" label="Reports" />
          <MenuItem to="/transactions" label="Transactions" />
          <MenuItem to="/wallet" label="Wallet" />
          <MenuItem to="/services" label="Manajemen Layanan" /> {/* NEW */}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">

        {/* TOPBAR MOBILE */}
        <div className="w-full bg-white shadow flex items-center justify-between px-4 py-3 border-b md:hidden">
          <h2 className="text-lg font-semibold">Assistenku Admin</h2>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-600 text-white rounded-full text-sm"
          >
            Logout
          </button>
        </div>

        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}

function MenuItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-lg font-medium ${
          isActive
            ? "bg-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
