// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../lib/adminSession";

export default function AdminRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin-login" />;
  }
  return children;
}
