// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminSession } from "../lib/adminSession";
import { signOutAdmin } from "../lib/firebaseAdmin";
import BrainPanel from "../components/BrainPanel";
import InstallPwaButton from "../components/InstallPwaButton";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    clearAdminSession();
    try {
      await signOutAdmin();
    } catch {
      // ignore
    }
    navigate("/", { replace: true });
  };

  return (
    <div style={{ padding: 18 }}>
      <InstallPwaButton />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Dashboard Admin</h1>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Selamat datang di panel admin Assistenku.</div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "none",
            background: "#dc2626",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <BrainPanel />
      </div>
    </div>
  );
}
