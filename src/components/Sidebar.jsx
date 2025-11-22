// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar({ role }) {
  const menu = [
    { to: "/dashboard", label: "Dashboard", allow: ["superadmin", "admin", "viewer"] },
    { to: "/finance", label: "Finance", allow: ["superadmin", "admin"] },
    { to: "/users", label: "Manajemen User", allow: ["superadmin"] },
  ];

  return (
    <div
      style={{
        width: "240px",
        background: "#0d6efd",
        color: "white",
        minHeight: "100vh",
        padding: "1rem",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "2rem" }}>
        Assistenku Admin
      </h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {menu
          .filter((m) => m.allow.includes(role))
          .map((item) => (
            <li key={item.to} style={{ marginBottom: "1rem" }}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(255,255,255,0.3)" : "transparent",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  );
}
