// src/components/Navbar.jsx
export default function Navbar({ onLogout }) {
  return (
    <nav
      style={{
        background: "white",
        padding: "1rem",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
        justifyContent: "flex-end",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <button
        onClick={onLogout}
        style={{
          background: "#dc3545",
          color: "white",
          padding: "8px 14px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
