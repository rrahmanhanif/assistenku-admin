import React from "react";
import { useNavigate } from "react-router-dom";
import InstallPrompt from "../components/InstallPrompt";
import {
  auth,
  sendAdminSignInLink,
  isEmailLink,
  completeEmailLinkSignIn,
  getFirebaseIdToken
} from "../firebaseClient";
import { setUiLoggedIn } from "../utils/adminSession";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("309309");
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  // Selesaikan sign-in dari email link kalau URL mengandung token sign-in
  React.useEffect(() => {
    (async () => {
      try {
        if (isEmailLink(window.location.href)) {
          setStatus("Menyelesaikan login dari email link...");
          setBusy(true);
          await completeEmailLinkSignIn(window.location.href);
          setStatus("Email terverifikasi. Silakan masukkan kode unik lalu klik Verifikasi.");
        }
      } catch (e) {
        setStatus(e?.message || "Gagal menyelesaikan login dari email link.");
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  async function onSendLink(e) {
    e.preventDefault();
    setStatus("");
    setBusy(true);
    try {
      if (!email) throw new Error("Email wajib diisi.");
      await sendAdminSignInLink(email);
      setStatus("Link verifikasi dikirim ke email. Silakan buka email dan klik link login.");
    } catch (err) {
      setStatus(err?.message || "Gagal mengirim email link.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    setStatus("");
    setBusy(true);
    try {
      if (!auth.currentUser) {
        throw new Error("Anda belum login via email link. Klik link login di email terlebih dahulu.");
      }
      const idToken = await getFirebaseIdToken();

      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        credentials: "include",
        body: JSON.stringify({ code })
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Verifikasi admin gagal.");
      }

      setUiLoggedIn(true);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setStatus(err?.message || "Verifikasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Assistenku Admin</div>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 18 }}>
        Login khusus admin: verifikasi email Firebase + kode unik.
      </div>

      <form onSubmit={onSendLink} style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 700 }}>Email Admin</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kontakassistenku@gmail.com"
          style={{ padding: 12, borderRadius: 10, border: "1px solid #d0d7de" }}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #0b5fff",
            background: "#0b5fff",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800
          }}
        >
          Kirim Link Verifikasi Email
        </button>
      </form>

      <div style={{ height: 14 }} />

      <form onSubmit={onVerify} style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 700 }}>Kode Unik Login</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="309309"
          style={{ padding: 12, borderRadius: 10, border: "1px solid #d0d7de" }}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900
          }}
        >
          Verifikasi & Masuk Dashboard
        </button>
      </form>

      <InstallPrompt />

      {status && (
        <div style={{ marginTop: 14, fontSize: 12, color: "#333", background: "#f6f8fa", padding: 10, borderRadius: 10 }}>
          {status}
        </div>
      )}
    </div>
  );
}
