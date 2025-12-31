import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminLoggedIn } from "../lib/adminSession.js";

export default function RequireAdmin({ children }) {
  const loc = useLocation();
  if (!isAdminLoggedIn()) {
    return <Navigate to="/" replace state={{ from: loc.pathname }} />;
  }
  return children;
}
