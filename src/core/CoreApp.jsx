import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import halaman yang kamu pakai
import DashboardAdmin from "./pages/DashboardAdmin";
import Login from "./pages/Login";

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
