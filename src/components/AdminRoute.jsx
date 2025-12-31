import React from "react";
import { Navigate } from "react-router-dom";
import { isUiLoggedIn, setUiLoggedIn } from "../utils/adminSession";

async function fetchMe() {
  const res = await fetch("/api/admin/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.actor || null;
}

export default function AdminRoute({ children }) {
  const [loading, setLoading] = React.useState(true);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const actor = await fetchMe();
        if (!mounted) return;
        if (actor?.role === "admin") {
          setUiLoggedIn(true);
          setOk(true);
        } else {
          setUiLoggedIn(false);
          setOk(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Memuat...</div>;
  if (!ok && !isUiLoggedIn()) return <Navigate to="/" replace />;
  return children;
}
