// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

export default function App() {
  const loggedIn = localStorage.getItem("admin_auth") === "true";

  return (
    <Routes>
      <Route path="/" element={loggedIn ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route path="/orders" element={loggedIn ? <Orders /> : <Navigate to="/login" />} />
      <Route path="/orders/:id" element={loggedIn ? <OrderDetail /> : <Navigate to="/login" />} />
    </Routes>
  );
}
