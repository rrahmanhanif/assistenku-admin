import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login.jsx";
import DashboardAdmin from "../pages/DashboardAdmin.jsx";

export default function CoreApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
