export default function Navbar({ onLogout }) {
  return (
    <nav
      style={{
        background: "white",
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "flex-end",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={onLogout}
        style={{
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 14px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
