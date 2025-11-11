import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Wallet, ArrowDownCircle, BarChart2, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/transactions", label: "Transaksi", icon: <FileText size={20} /> },
    { path: "/reports", label: "Laporan", icon: <BarChart2 size={20} /> },
    { path: "/wallet", label: "Dompet", icon: <Wallet size={20} /> },
    { path: "/withdraw", label: "Penarikan", icon: <ArrowDownCircle size={20} /> },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="w-64 bg-blue-600 text-white flex flex-col justify-between min-h-screen shadow-lg">
      <div>
        <div className="px-6 py-4 text-2xl font-bold tracking-wide bg-blue-700">
          Assistenku
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-blue-500 transition ${
                location.pathname === item.path ? "bg-blue-500" : ""
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="m-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-2 rounded-lg font-medium transition"
      >
        <LogOut size={18} /> Keluar
      </button>
    </div>
  );
}
