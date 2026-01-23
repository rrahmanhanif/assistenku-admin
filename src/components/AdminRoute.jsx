import React from "react";
import { Navigate } from "react-router-dom";
import { isUiLoggedIn, setUiLoggedIn } from "../utils/adminSession";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

async function fetchMe() {
  try {
    const { data } = await httpClient.request({
      endpoint: endpoints.auth.whoami,
    });
    return data?.data?.actor || data?.actor || null;
  } catch (error) {
    return null;
  }
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

  if (loading) return null;

  if (!ok || !isUiLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
