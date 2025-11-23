import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md h-full fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">
          Assistenku Admin
        </h1>
      </div>

      <nav className="mt-4 flex flex-col">
        <NavLink to="/" className="px-6 py-3 hover:bg-gray-100">
          Dashboard
        </NavLink>

        <NavLink to="/mitra" className="px-6 py-3 hover:bg-gray-100">
          Data Mitra
        </NavLink>

        <NavLink to="/customer" className="px-6 py-3 hover:bg-gray-100">
          Data Customer
        </NavLink>

        <NavLink to="/orders" className="px-6 py-3 hover:bg-gray-100">
          Semua Order
        </NavLink>

        <NavLink to="/wallet" className="px-6 py-3 hover:bg-gray-100">
          Penarikan Saldo
        </NavLink>
      </nav>
    </div>
  );
}
