// src/pages/Dashboard.jsx
import React from "react";
import { clearAdminSession } from "../lib/adminSession";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Selamat datang di panel admin Assistenku.
      </p>

      <button
        onClick={() => {
          clearAdminSession();
          window.location.href = "/admin-login";
        }}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
