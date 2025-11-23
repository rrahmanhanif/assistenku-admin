import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  WalletIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ onLogout }) {
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "Finance", path: "/finance", icon: <BanknotesIcon className="w-5 h-5" /> },
    { name: "Reports", path: "/reports", icon: <DocumentChartBarIcon className="w-5 h-5" /> },
    { name: "Transactions", path: "/transactions", icon: <TableCellsIcon className="w-5 h-5" /> },
    { name: "Wallet", path: "/wallet", icon: <WalletIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r shadow-sm flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-semibold text-blue-600 tracking-wide">
            Assistenku Admin
          </h1>
        </div>

        {/* Menu */}
        <nav className="mt-4">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 cursor-pointer 
                ${isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50"}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="m-4 flex items-center gap-3 px-4 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
      >
        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
