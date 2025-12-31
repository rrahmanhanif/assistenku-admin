import React, { useEffect, useMemo, useState } from "react";

function isIos() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isInStandaloneMode() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);

  const canShow = useMemo(() => {
    if (isInStandaloneMode()) return false;
    if (deferredPrompt) return true;
    if (isIos()) return true;
    return false;
  }, [deferredPrompt]);

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function handleInstallClick() {
    if (isInStandaloneMode()) return;

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
    }
  }

  if (!canShow) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 9999,
          background: "#0b5fff",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "12px 14px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
        }}
        aria-label="Install Assistenku Admin"
      >
        Install Admin
      </button>

      {showIosHint && (
        <div
          onClick={() => setShowIosHint(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 520,
              width: "100%",
              padding: 18,
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Install di iPhone/iPad</h3>
            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
              <li>Buka menu <b>Share</b> di Safari</li>
              <li>Pilih <b>Add to Home Screen</b></li>
              <li>Tap <b>Add</b></li>
            </ol>
            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button
                onClick={() => setShowIosHint(false)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
