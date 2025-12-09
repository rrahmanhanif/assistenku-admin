// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  const loggedIn = localStorage.getItem("admin_auth") === "true";

  return (
    <Routes>
      {/* LOGIN ADMIN */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      {/* ORDERS */}
      <Route
        path="/orders"
        element={
          <AdminRoute>
            <Orders />
          </AdminRoute>
        }
      />

      {/* DETAIL ORDER */}
      <Route
        path="/orders/:id"
        element={
          <AdminRoute>
            <OrderDetail />
          </AdminRoute>
        }
      />

      {/* DEFAULT REDIRECT */}
      <Route
        path="/"
        element={<Navigate to={loggedIn ? "/dashboard" : "/admin-login"} />}
      />
    </Routes>
  );
      }
