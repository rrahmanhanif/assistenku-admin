import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";

export default function AppRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
