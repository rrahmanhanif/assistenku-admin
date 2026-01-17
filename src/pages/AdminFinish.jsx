import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleRedirect } from "../lib/adminAuth.js";

export default function AdminFinish() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Memproses login Google...");

  useEffect(() => {
    (async () => {
      try {
        const token = await handleGoogleRedirect();
        if (!token) {
          setMsg("Tidak ada sesi redirect. Silakan login ulang dari halaman admin.");
          return;
        }

        setMsg("Login berhasil. Mengalihkan ke dashboard...");
        setTimeout(() => nav("/"), 600);
      } catch (e) {
        setMsg(`Gagal: ${e.message || "Unknown error"}`);
      }
    })();
  }, [nav]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#061a4a",
        display: "grid",
        placeItems: "center",
        padding: 18
      }}
    >
      <div style={{ color: "white", maxWidth: 620, textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>
          Assistenku Admin
        </div>
        <div style={{ opacity: 0.9, lineHeight: 1.5 }}>{msg}</div>
      </div>
    </div>
  );
}
