// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

// Pages
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

// Layout
import AdminLayout from "./components/AdminLayout";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================================
  // 🔐 AUTH + ROLE LOADER + GLOBAL GATEWAY PREP
  // ========================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(u);

      // Load user role
      const docRef = doc(db, "core_users", u.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setRole(snap.data().role || "viewer");
      } else {
        setRole("viewer");
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Logout
  const logoutNow = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;

  // ========================================================
  // 🔒 PROTECTED ROUTE
  // ========================================================
  const RequireAuth = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* DASHBOARD ADMIN */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AdminLayout onLogout={logoutNow}>
                <DashboardAdmin role={role} />
              </AdminLayout>
            </RequireAuth>
          }
        />

        {/* FINANCE */}
        <Route
          path="/finance"
          element={
            <RequireAuth>
              <AdminLayout onLogout={logoutNow}>
                <DashboardFinanceEnterprise role={role} />
              </AdminLayout>
            </RequireAuth>
          }
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <AdminLayout onLogout={logoutNow}>
                <Reports />
              </AdminLayout>
            </RequireAuth>
          }
        />

        {/* TRANSACTIONS */}
        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <AdminLayout onLogout={logoutNow}>
                <Transactions />
              </AdminLayout>
            </RequireAuth>
          }
        />

        {/* WALLET */}
        <Route
          path="/wallet"
          element={
            <RequireAuth>
              <AdminLayout onLogout={logoutNow}>
                <Wallet />
              </AdminLayout>
            </RequireAuth>
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
