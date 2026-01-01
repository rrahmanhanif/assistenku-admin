import React, { useEffect, useMemo, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase.js";
import { setAdminVerified } from "../lib/adminSession.js";
import { useNavigate } from "react-router-dom";

export default function AdminFinish() {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const nav = useNavigate();
  const [msg, setMsg] = useState("Memproses login...");

  useEffect(() => {
    (async () => {
      try {
        const href = window.location.href;
        if (!isSignInWithEmailLink(auth, href)) {
          setMsg("Link tidak valid atau bukan email-link Firebase.");
          return;
        }

        const email = localStorage.getItem("assistenku_login_email");
        const code = localStorage.getItem("assistenku_login_code");
        if (!email || !code) {
          setMsg("Data email/kode tidak ditemukan. Silakan ulangi dari halaman login.");
          return;
        }

        const userCred = await signInWithEmailLink(auth, email, href);
        const idToken = await userCred.user.getIdToken(true);

        const resp = await fetch("/api/admin/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ code }),
        });

        const json = await resp.json();
        if (!resp.ok || !json?.success) {
          throw new Error(json?.error || "Verifikasi server gagal.");
        }

        setAdminVerified(true);
        setMsg("Login berhasil. Mengalihkan ke dashboard...");
        setTimeout(() => nav("/"), 600);
      } catch (e) {
        setMsg(`Gagal: ${e.message || "Unknown error"}`);
      }
    })();
  }, [auth, nav]);

  return (
    <div style={{ minHeight: "100vh", background: "#061a4a", display: "grid", placeItems: "center", padding: 18 }}>
      <div style={{ color: "white", maxWidth: 620, textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Assistenku Admin</div>
        <div style={{ opacity: 0.9, lineHeight: 1.5 }}>{msg}</div>
      </div>
    </div>
  );
}
