import React, { useMemo, useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase.js";
import InstallPwaButton from "../components/InstallPwaButton.jsx";

const ALLOWED_EMAILS = ["kontakassistenku@gmail.com", "appassistenku@gmail.com"];

export default function AdminLogin() {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const [email, setEmail] = useState("kontakassistenku@gmail.com");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  async function handleSendLink() {
    try {
      const normalized = String(email || "").trim().toLowerCase();
      if (!ALLOWED_EMAILS.includes(normalized)) {
        throw new Error("Email tidak diizinkan. Hanya kontakassistenku@gmail.com & appassistenku@gmail.com.");
      }
      if (!code) throw new Error("Kode unik wajib diisi.");
      if (code !== "309309") throw new Error("Kode unik salah.");

      // simpan untuk finish flow
      localStorage.setItem("assistenku_login_email", normalized);
      localStorage.setItem("assistenku_login_code", code);

      const actionCodeSettings = {
        url: `${window.location.origin}/auth/finish`,
        handleCodeInApp: true,
      };

      setStatus({ kind: "loading", message: "Mengirim link login ke email..." });
      await sendSignInLinkToEmail(auth, normalized, actionCodeSettings);
      setStatus({
        kind: "sent",
        message: "Link login sudah dikirim. Silakan cek Inbox/Spam, lalu klik link tersebut untuk menyelesaikan login.",
      });
    } catch (e) {
      setStatus({ kind: "error", message: e.message || "Gagal mengirim link." });
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#061a4a,#0b5fff)", padding: 18 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>Assistenku Admin</div>
          <InstallPwaButton />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 18,
            padding: 16,
            color: "white",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Login Admin</div>

          <label style={{ display: "block", fontSize: 12, opacity: 0.95, marginBottom: 6 }}>Email Admin</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kontakassistenku@gmail.com"
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              outline: "none",
              background: "rgba(0,0,0,0.25)",
              color: "white",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", fontSize: 12, opacity: 0.95, marginBottom: 6 }}>Kode Unik</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="309309"
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              outline: "none",
              background: "rgba(0,0,0,0.25)",
              color: "white",
              marginBottom: 14,
            }}
          />

          <button
            onClick={handleSendLink}
            disabled={status.kind === "loading"}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: "white",
              color: "#0b2d7a",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Kirim Link Login (Firebase)
          </button>

          {status.kind !== "idle" && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.95 }}>
              {status.kind === "error" ? "Error: " : ""}
              {status.message}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 1.5 }}>
          Catatan: Link login hanya dapat terkirim jika Firebase Auth (Email link/passwordless) aktif dan domain admin.assistenku.com ada di Authorized domains.
        </div>
      </div>
    </div>
  );
}
