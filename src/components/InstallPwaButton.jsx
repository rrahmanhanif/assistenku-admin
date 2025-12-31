// src/components/InstallPwaButton.jsx
import React, { useEffect, useState } from "react";

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setShowHelp(false);
    if (!deferredPrompt) {
      setShowHelp(true);
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <button
        onClick={handleInstall}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 9999,
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          background: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Install App
      </button>

      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 10000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              background: "white",
              borderRadius: 16,
              padding: 14,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Install belum tersedia otomatis
            </div>
            <div style={{ lineHeight: 1.4, opacity: 0.85 }}>
              Di Android Chrome: tekan menu <b>⋮</b> lalu pilih <b>Install app</b> /
              <b>Add to Home screen</b>.
            </div>

            <button
              onClick={() => setShowHelp(false)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "none",
                background: "#1d4ed8",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
