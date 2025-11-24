// src/core/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// 🔥 WAJIB — path ini 100% benar untuk folder kamu
import { auth, db } from "../firebaseConfig.js";

// Pages
import Login from "../pages/Login";
import DashboardAdmin from "../pages/DashboardAdmin";
import DashboardFinanceEnterprise from "../pages/DashboardFinanceEnterprise";
import Reports from "../pages/Reports";
import Transactions from "../pages/Transactions";
import Wallet from "../pages/Wallet";
import Services from "../pages/Services";

// Layout
import AdminLayout from "../components/AdminLayout";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const snap = await getDoc(doc(db, "core_users", u.uid));
      setRole(snap.exists() ? snap.data().role : "viewer");

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logoutNow = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;

  const RequireAuth = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

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

        <Route
          path="/services"
          element={
            <RequireAuth>
              <AdminLayout onLogout={logoutNow}>
                <Services />
              </AdminLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
                }
