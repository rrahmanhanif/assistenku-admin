import React from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [hint, setHint] = React.useState("");

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function onInstall() {
    setHint("");
    if (!deferredPrompt) {
      setHint("Install belum tersedia di perangkat/browser ini. Pastikan pakai Chrome Android, HTTPS, dan PWA memenuhi syarat.");
      return;
    }
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setOpen(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid #d0d7de",
          background: "#ffffff",
          cursor: "pointer",
          fontWeight: 700
        }}
      >
        Install Aplikasi (PWA)
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Install Assistenku Admin</div>
            <div style={{ fontSize: 13, color: "#444", marginBottom: 12 }}>
              Aplikasi akan terpasang seperti app. Tombol install aktif jika browser sudah mengizinkan.
            </div>

            {hint && <div style={{ fontSize: 12, color: "#b00020", marginBottom: 12 }}>{hint}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #d0d7de",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={onInstall}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #0b5fff",
                  background: "#0b5fff",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 800
                }}
              >
                Install Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
