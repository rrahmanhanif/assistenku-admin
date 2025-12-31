import React from "react";
import { useNavigate } from "react-router-dom";
import PwaInstallButton from "../components/PwaInstallButton.jsx";
import { clearAdminSession } from "../lib/adminSession.js";

function open(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function Portal() {
  const navigate = useNavigate();

  const apps = [
    {
      title: "Admin (Pusat/Otak)",
      url: import.meta.env.VITE_APP_ADMIN_URL || "https://admin.assistenku.com",
      desc: "Dashboard pusat kontrol: pricing, monitoring, audit, finance."
    },
    {
      title: "LegalWorkspace",
      url: import.meta.env.VITE_APP_LEGALWORKSPACE_URL || "https://legalworkspace.assistenku.com",
      desc: "Dokumen legal & kinerja harian (SPL/IPL, approval, audit)."
    },
    {
      title: "Customer",
      url: import.meta.env.VITE_APP_CUSTOMER_URL || "https://customer.assistenku.com",
      desc: "Aplikasi pemesanan & tracking layanan."
    },
    {
      title: "Mitra",
      url: import.meta.env.VITE_APP_MITRA_URL || "https://mitra.assistenku.com",
      desc: "Aplikasi eksekusi job, evidence, payout."
    },
    {
      title: "Website Utama",
      url: import.meta.env.VITE_APP_WEBSITE_URL || "https://assistenku.com",
      desc: "Landing & instal PWA publik."
    }
  ];

  const repos = [
    { title: "Repo Admin", url: import.meta.env.VITE_REPO_ADMIN_URL || "" },
    { title: "Repo Customer", url: import.meta.env.VITE_REPO_CUSTOMER_URL || "" },
    { title: "Repo Mitra", url: import.meta.env.VITE_REPO_MITRA_URL || "" },
    { title: "Repo LegalWorkspace", url: import.meta.env.VITE_REPO_LEGALWORKSPACE_URL || "" },
    { title: "Repo Core", url: import.meta.env.VITE_REPO_CORE_URL || "" }
  ];

  function logout() {
    clearAdminSession();
    navigate("/");
  }

  return (
    <div style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Assistenku Portal</h2>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Akses cepat untuk semua aplikasi & repositori.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="card" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            Kembali ke Dashboard
          </button>
          <button
            onClick={logout}
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
        <h3 style={{ margin: "0 0 10px 0" }}>Aplikasi</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {apps.map((item) => (
            <div key={item.title} className="card">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
              <div style={{ opacity: 0.8, marginBottom: 10 }}>{item.desc}</div>
              <button
                onClick={() => open(item.url)}
                style={{
                  background: "#0b5fff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                Buka
              </button>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, wordBreak: "break-word" }}>
                {item.url}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Repositori (opsional)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {repos.map((item) => (
            <div key={item.title} className="card">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
              <div style={{ opacity: 0.8, marginBottom: 10 }}>
                {item.url ? "Link tersedia" : "Isi env dulu untuk mengaktifkan"}
              </div>
              <button
                onClick={() => open(item.url)}
                disabled={!item.url}
                style={{
                  background: item.url ? "#0b5fff" : "#cfd8ea",
                  color: item.url ? "#fff" : "#2b2b2b",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: item.url ? "pointer" : "not-allowed",
                  fontWeight: 700
                }}
              >
                {item.url ? "Buka Repo" : "Belum di-set"}
              </button>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, wordBreak: "break-word" }}>
                {item.url || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PwaInstallButton />
    </div>
  );
}
