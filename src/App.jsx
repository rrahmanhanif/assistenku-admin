// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

import AdminLayout from "./layout/AdminLayout";

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

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;

  const logoutNow = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow}>
                <DashboardAdmin role={role} />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* FINANCE */}
        <Route
          path="/finance"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow}>
                <DashboardFinanceEnterprise role={role} />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* OTHER MENU */}
        <Route
          path="/reports"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow}>
                <Reports />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/transactions"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow}>
                <Transactions />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/wallet"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow}>
                <Wallet />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
