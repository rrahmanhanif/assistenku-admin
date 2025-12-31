import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import { registerSW } from "./pwa/registerSW.js";

import AdminLogin from "./pages/AdminLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Portal from "./pages/Portal.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";

registerSW();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AdminLogin />} />

      <Route
        path="/dashboard"
        element={
          <RequireAdmin>
            <Dashboard />
          </RequireAdmin>
        }
      />

      <Route
        path="/portal"
        element={
          <RequireAdmin>
            <Portal />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  </BrowserRouter>
);
