import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminSession } from "../lib/adminSession.js";
import BrainPanel from "../components/BrainPanel.jsx";
import PwaInstallButton from "../components/PwaInstallButton.jsx";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAdminSession();
    navigate("/"); // FIX: sebelumnya "/admin-login" padahal route login adalah "/"
  }

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Assistenku Admin Dashboard</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="card"
            onClick={() => navigate("/portal")}
            style={{ cursor: "pointer", padding: "12px 14px" }}
          >
            Portal
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "12px 14px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <BrainPanel />
      </div>

      <PwaInstallButton />
    </div>
  );
}
