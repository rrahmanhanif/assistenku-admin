export default function Navbar({ onLogout }) {
  return (
    <nav style={{ background: "#0d6efd", padding: "1rem", color: "white", display: "flex", justifyContent: "space-between" }}>
      <h3>Assistenku-Core</h3>
      <button
        onClick={onLogout}
        style={{
          background: "white",
          color: "#0d6efd",
          border: "none",
          borderRadius: "5px",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
