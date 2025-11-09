import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <main style={{ padding: "2rem" }}>
        <h1>Dashboard Admin</h1>
        <p>Selamat datang di panel utama Assistenku-Core 🎉</p>

        <div style={{ marginTop: "1.5rem" }}>
          <Link
            to="/transactions"
            style={{
              textDecoration: "none",
              background: "#0d6efd",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
            }}
          >
            ➕ Lihat Halaman Transaksi
          </Link>
        </div>
      </main>
    </div>
  );
}
import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <main style={{ padding: "2rem" }}>
        <h1>Dashboard Admin</h1>
        <p>Selamat datang di panel utama Assistenku-Core 🎉</p>
      </main>
    </div>
  );
}
