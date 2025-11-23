import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow fixed left-0 top-0 p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">Assistenku Admin</h1>

      <nav className="space-y-4">
        <NavLink to="/" className="block text-gray-700 hover:text-blue-600">
          Dashboard
        </NavLink>

        <NavLink to="/users" className="block text-gray-700 hover:text-blue-600">
          Users
        </NavLink>

        <NavLink to="/mitra" className="block text-gray-700 hover:text-blue-600">
          Mitra
        </NavLink>

        <NavLink to="/orders" className="block text-gray-700 hover:text-blue-600">
          Orders
        </NavLink>

        <NavLink to="/wallet" className="block text-gray-700 hover:text-blue-600">
          Wallet
        </NavLink>

        <NavLink to="/settings" className="block text-gray-700 hover:text-blue-600">
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
