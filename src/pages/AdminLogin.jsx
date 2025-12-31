// src/pages/AdminLogin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  initAuthPersistence,
  sendAdminEmailLink,
  isEmailLink,
  completeEmailLinkSignIn,
  signOutAdmin,
} from "../lib/firebaseAdmin";
import { saveAdminSession, isAdminLoggedIn } from "../lib/adminSession";
import InstallPwaButton from "../components/InstallPwaButton";

const EMAIL_KEY = "assistenku_admin_email_for_link";

function normalizeEmails(csv) {
  return csv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const allowedEmails = useMemo(() => {
    // Default: sesuai request Anda
    const fallback = "kontakassistenku@gmail.com,appassistenku@gmail.com";
    return normalizeEmails(import.meta.env.VITE_ADMIN_ALLOWED_EMAILS || fallback);
  }, []);

  const loginCode = (import.meta.env.VITE_ADMIN_LOGIN_CODE || "309309").trim();

  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("email"); // email | sent | code
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      await initAuthPersistence();

      // Jika sudah ada session admin terverifikasi, langsung ke dashboard
      if (isAdminLoggedIn()) {
        navigate("/dashboard", { replace: true });
        return;
      }

      // Jika ini email-link callback
      const url = window.location.href;
      if (isEmailLink(url)) {
        setBusy(true);
        setError("");
        setInfo("Memverifikasi link login...");

        try {
          const storedEmail = (localStorage.getItem(EMAIL_KEY) || "").toLowerCase();

          // Jika tidak ada storedEmail, minta user isi lagi email yang dipakai
          if (!storedEmail) {
            setStage("email");
            setInfo("Masukkan email yang Anda pakai saat meminta link.");
            setBusy(false);
            return;
          }

          const user = await completeEmailLinkSignIn(storedEmail, url);
          const userEmail = (user?.email || "").toLowerCase();

          if (!allowedEmails.includes(userEmail)) {
            await signOutAdmin();
            throw new Error("Email ini tidak diizinkan untuk Admin.");
          }

          localStorage.removeItem(EMAIL_KEY);
          setStage("code");
          setInfo(`Email terverifikasi: ${userEmail}. Masukkan kode admin.`);
        } catch (e) {
          setError(e?.message || "Gagal verifikasi email link.");
          setInfo("");
        } finally {
          setBusy(false);
        }
      }
    })();
  }, [navigate, allowedEmails]);

  async function handleRequestLink(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

    try {
      const normalized = email.trim().toLowerCase();
      if (!allowedEmails.includes(normalized)) {
        throw new Error("Email tidak terdaftar sebagai Admin.");
      }

      localStorage.setItem(EMAIL_KEY, normalized);
      await sendAdminEmailLink(normalized);
      setStage("sent");
      setInfo("Link login sudah dikirim ke email. Buka email lalu klik link.");
    } catch (e) {
      setError(e?.message || "Gagal mengirim link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

    try {
      const input = code.trim();
      if (input !== loginCode) {
        throw new Error("Kode admin salah.");
      }

      const user = auth.currentUser;
      const userEmail = (user?.email || "").toLowerCase();
      if (!user?.uid || !allowedEmails.includes(userEmail)) {
        throw new Error("Sesi login tidak valid. Ulangi login.");
      }

      saveAdminSession({ uid: user.uid, email: userEmail });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e?.message || "Gagal verifikasi kode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", padding: 18, display: "grid", placeItems: "center" }}>
      <InstallPwaButton />

      <div style={{ width: "min(420px, 100%)", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Admin Assistenku</div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 12, marginBottom: 10 }}>
            {error}
          </div>
        )}

        {info && (
          <div style={{ background: "#e0f2fe", color: "#075985", padding: 10, borderRadius: 12, marginBottom: 10 }}>
            {info}
          </div>
        )}

        {stage !== "code" && (
          <form onSubmit={handleRequestLink}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Email Admin</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="kontakassistenku@gmail.com"
              required
              style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #d1d5db" }}
            />

            <button
              disabled={busy}
              type="submit"
              style={{
                marginTop: 10,
                width: "100%",
                padding: 10,
                borderRadius: 12,
                border: "none",
                background: "#1d4ed8",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Memproses..." : "Kirim Link Login"}
            </button>

            {stage === "sent" && (
              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
                Jika tidak masuk, cek Spam/Promotions. Anda boleh kirim ulang link.
              </div>
            )}
          </form>
        )}

        {stage === "code" && (
          <form onSubmit={handleVerifyCode}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Kode Unik Admin</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              placeholder="309309"
              required
              style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #d1d5db" }}
            />

            <button
              disabled={busy}
              type="submit"
              style={{
                marginTop: 10,
                width: "100%",
                padding: 10,
                borderRadius: 12,
                border: "none",
                background: "#16a34a",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Memproses..." : "Verifikasi & Masuk"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
