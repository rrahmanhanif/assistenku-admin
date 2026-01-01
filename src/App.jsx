import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminFinish from "./pages/AdminFinish.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { isAdminVerified } from "./lib/adminSession.js";

function Protected({ children }) {
  return isAdminVerified() ? children : <Navigate to="/admin-login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/auth/finish" element={<AdminFinish />} />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
