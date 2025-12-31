import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// NOTE:
// - Tombol ini hanya UI.
// - Anda tinggal sambungkan handler "handleLogin()" ke flow Firebase email-link + verify code.
// - Saya buat tetap ada input code 309309 (karena requirement Anda), tapi UI tetap simpel.

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("kontakassistenku@gmail.com");
  const [code, setCode] = useState("309309");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin() {
    setLoading(true);
    setMsg("");

    try {
      // TODO: Integrasikan:
      // 1) sendSignInLinkToEmail(email)
      // 2) setelah user klik link, verify token + kirim { code } ke /api/admin/auth/verify
      //
      // Untuk sementara: simulasi sukses
      await new Promise((r) => setTimeout(r, 400));

      // Jika Anda sudah punya session flag internal, set di sini.
      // localStorage.setItem("assistenku_admin_logged_in", "1");

      navigate("/dashboard");
    } catch (e) {
      setMsg(e?.message || "Gagal login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 20,
          padding: 18,
          boxShadow: "0 16px 60px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(255,255,255,0.16)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Assistenku Admin</div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>Login khusus admin (whitelist + kode unik)</div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 16,
            padding: 14
          }}
        >
          <label style={{ fontSize: 12, opacity: 0.9 }}>Email Admin</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kontakassistenku@gmail.com"
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 12,
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.18)",
              color: "#fff",
              outline: "none"
            }}
          />

          <label style={{ fontSize: 12, opacity: 0.9 }}>Kode Unik</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="309309"
            inputMode="numeric"
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 14,
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.18)",
              color: "#fff",
              outline: "none"
            }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 16,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: "linear-gradient(90deg, #0b5fff, #0a4fe0)",
              color: "#fff",
              fontWeight: 900,
              boxShadow: "0 14px 30px rgba(11,95,255,0.35)"
            }}
          >
            {loading ? "Memproses..." : "Login Admin"}
          </button>

          {msg ? (
            <div style={{ marginTop: 12, fontSize: 13, color: "#fff" }}>
              {msg}
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>
          Login hanya untuk email whitelist: <b>kontakassistenku@gmail.com</b> dan <b>appassistenku@gmail.com</b>.
        </div>
      </div>
    </div>
  );
}
