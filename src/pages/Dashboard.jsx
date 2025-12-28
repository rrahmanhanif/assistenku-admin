// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminSession } from "../lib/adminSession";
import BrainPanel from "../components/BrainPanel";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-slate-600 mt-2">Selamat datang di panel admin Assistenku.</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <BrainPanel />
    </div>
  );
}
