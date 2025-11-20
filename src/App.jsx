// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

// PAGES
import Login from "./pages/Login.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logoutNow = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Memuat aplikasi...
      </p>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Dashboard Admin */}
        <Route
          path="/dashboard"
          element={
            user ? <DashboardAdmin onLogout={logoutNow} /> : <Navigate to="/" />
          }
        />

        {/* Dashboard Finance Enterprise */}
        <Route
          path="/finance"
          element={
            user ? (
              <DashboardFinanceEnterprise onLogout={logoutNow} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
