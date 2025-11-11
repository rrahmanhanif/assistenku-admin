import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function DashboardAdmin({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar onLogout={onLogout} />
      <div style={{ padding: "2rem" }}>
        <h2 style={{ color: "#0d6efd", marginBottom: "1rem" }}>Dashboard Admin Assistenku-Core</h2>
        <p>Selamat datang di sistem manajemen Assistenku.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <div style={cardStyle}>
            <h3>Data Keuangan</h3>
            <p>Kelola laporan keuangan gabungan.</p>
            <button style={btnStyle} onClick={() => navigate("/finance")}>
              Buka Dashboard Keuangan
            </button>
          </div>

          <div style={cardStyle}>
            <h3>Kelola Mitra</h3>
            <p>Lihat data mitra dan performanya.</p>
            <button style={btnStyle}>Masuk Menu Mitra</button>
          </div>

          <div style={cardStyle}>
            <h3>Kelola Customer</h3>
            <p>Lihat data pengguna aplikasi customer.</p>
            <button style={btnStyle}>Masuk Menu Customer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#f8f9fa",
  borderRadius: "10px",
  padding: "1rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const btnStyle = {
  background: "#0d6efd",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 12px",
  marginTop: "10px",
  cursor: "pointer",
};
