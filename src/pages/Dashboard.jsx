import React from "react";
import { clearAdminSession } from "../lib/adminSession.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#061a4a", padding: 18, color: "white" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Admin Portal</div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>Akses pusat untuk seluruh properti Assistenku</div>
          </div>

          <button
            onClick={() => {
              clearAdminSession();
              nav("/admin-login");
            }}
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "10px 12px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          {[
            { title: "Admin Core", url: "https://admin.assistenku.com" },
            { title: "Legal Workspace", url: "https://legalworkspace.assistenku.com" },
            { title: "Customer App", url: "https://assistenku.com" },
            { title: "Supabase Dashboard", url: "https://supabase.com/dashboard" },
          ].map((x) => (
            <a
              key={x.title}
              href={x.url}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "white",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 14,
                display: "block",
              }}
            >
              <div style={{ fontWeight: 900 }}>{x.title}</div>
              <div style={{ opacity: 0.8, marginTop: 6, wordBreak: "break-word", fontSize: 12 }}>{x.url}</div>
              <div style={{ marginTop: 10, fontWeight: 800, color: "#9fd0ff" }}>Buka →</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
