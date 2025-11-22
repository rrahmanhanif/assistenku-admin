// src/components/Navbar.jsx
import React from "react";

export default function Navbar({ onLogout }) {
  return (
    <nav
      style={{
        background: "#0d6efd",
        padding: "1rem",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontSize: "1.3rem", fontWeight: "700" }}>
        Assistenku-Core Admin
      </div>

      <button
        onClick={onLogout}
        style={{
          background: "white",
          color: "#0d6efd",
          border: "none",
          borderRadius: "8px",
          padding: "8px 14px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "0.2s",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
