import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Finance", path: "/finance" },
    { name: "Reports", path: "/reports" },
    { name: "Transactions", path: "/transactions" },
    { name: "Wallet", path: "/wallet" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* SIDEBAR LEFT */}
      <aside
        className={`bg-white shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="p-4 font-bold text-blue-600 text-xl">
          {sidebarOpen ? "Assistenku Admin" : "AK"}
        </div>

        {/* Menu */}
        <nav className="mt-4">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 text-sm transition
                  ${active ? "bg-blue-100 text-blue-600" : "text-gray-700"}
                  hover:bg-blue-50`}
              >
                {sidebarOpen ? item.name : item.name[0]}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="absolute bottom-4 left-4 text-red-600 hover:underline"
        >
          {sidebarOpen ? "Logout" : "⏻"}
        </button>
      </aside>

      {/* CONTENT RIGHT */}
      <div className="flex-1 flex flex-col">
        
        {/* TOPBAR */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-black"
          >
            ☰
          </button>

          <p className="text-gray-600 text-sm">
            Admin Panel — Versi Profesional
          </p>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
