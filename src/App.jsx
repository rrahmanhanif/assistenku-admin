// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

// PAGES
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

// LAYOUT
import AdminLayout from "./layout/AdminLayout";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // 🔐 CEK AUTH + ROLE ADMIN
  // ============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(u);

      // Ambil role dari Firestore
      const docRef = doc(db, "core_users", u.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setRole(snap.data().role || "viewer");
      } else {
        // Default role = viewer (paling aman)
        setRole("viewer");
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Saat loading
  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;

  // Logout function
  const logoutNow = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* ============================
            LOGIN
        ============================ */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* ============================
            DASHBOARD UTAMA
        ============================ */}
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

        {/* ============================
            FINANCE DASHBOARD
            Hanya tampil jika role = finance / admin
        ============================ */}
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

        {/* ============================
            REPORTS
        ============================ */}
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

        {/* ============================
            TRANSACTIONS
        ============================ */}
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

        {/* ============================
            WALLET INTERNAL SYSTEM
        ============================ */}
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

        {/* Jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
