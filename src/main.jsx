// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// WAJIB: import sesuai case folder kamu
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  </BrowserRouter>
);
