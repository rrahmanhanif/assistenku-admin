import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Wallet, ArrowDownCircle, BarChart2 } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/transactions", label: "Transaksi", icon: <FileText size={18} /> },
    { path: "/reports", label: "Laporan", icon: <BarChart2 size={18} /> },
    { path: "/wallet", label: "Dompet", icon: <Wallet size={18} /> },
    { path: "/withdraw", label: "Penarikan", icon: <ArrowDownCircle size={18} /> },
  ];

  return (
    <div
      style={{
        width: "220px",
        background: "#0d6efd",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <div>
        <div style={{ padding: "1rem", fontWeight: "bold", fontSize: "1.2rem", background: "#0b5ed7" }}>
          Assistenku
        </div>
        <nav style={{ marginTop: "1rem" }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 15px",
                textDecoration: "none",
                color: "white",
                background: location.pathname === item.path ? "#0b5ed7" : "transparent",
                transition: "0.2s",
              }}
            >
              {item.icon}
              <span style={{ marginLeft: "10px" }}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
