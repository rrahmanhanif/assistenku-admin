import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InstallPwaButton from "../components/InstallPwaButton.jsx";
import {
  handleGoogleRedirect,
  signInWithGooglePopup,
  signInWithGoogleRedirect
} from "../lib/adminAuth.js";

const ALLOWED_EMAILS = ["kontakassistenku@gmail.com", "appassistenku@gmail.com"];

export default function AdminLogin() {
  const nav = useNavigate();
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  useEffect(() => {
    (async () => {
      try {
        const token = await handleGoogleRedirect();
        if (token) {
          nav("/");
        }
      } catch (error) {
        const message = error?.message === "Access Denied"
          ? "Access Denied"
          : error?.message || "Login redirect gagal. Silakan coba lagi.";

        setStatus({
          kind: "error",
          message
        });
      }
    })();
  }, [nav]);

  async function handleGoogleLogin() {
    try {
      setStatus({ kind: "loading", message: "Membuka Google Login..." });
      await signInWithGooglePopup();
      nav("/");
    } catch (error) {
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        setStatus({
          kind: "loading",
          message: "Popup diblokir. Mengalihkan ke Google Login..."
        });
        await signInWithGoogleRedirect();
        return;
      }

      const message = error?.message === "Access Denied"
        ? "Access Denied"
        : error?.message || "Login Google gagal.";
      setStatus({
        kind: "error",
        message
      });
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#061a4a,#0b5fff)",
        padding: 18
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}
        >
          <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>
            Assistenku Admin
          </div>
          <InstallPwaButton />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 18,
            padding: 16,
            color: "white",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>
            Login Admin
          </div>

          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
            Login hanya menggunakan Google (Firebase Auth). Pastikan email Google
            terdaftar di allowlist admin.
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={status.kind === "loading"}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: "white",
              color: "#0b2d7a",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            Login dengan Google
          </button>

          {status.kind !== "idle" && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.95 }}>
              {status.kind === "error" ? "Error: " : ""}
              {status.message}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            color: "rgba(255,255,255,0.85)",
            fontSize: 12,
            lineHeight: 1.5
          }}
        >
          Allowlist admin saat ini: {ALLOWED_EMAILS.join(", ")}. Pastikan domain
          admin.assistenku.com terdaftar di Authorized domains Firebase.
        </div>
      </div>
    </div>
  );
}
