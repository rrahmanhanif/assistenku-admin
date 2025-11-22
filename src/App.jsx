// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Layout
import SidebarLayout from "./components/SidebarLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "core_users", user.uid));
      if (snap.exists()) {
        setCurrentUser(user);
        setRole(snap.data().role || "viewer");
      } else {
        await signOut(auth);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logoutNow = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setRole(null);
  };

  if (loading) return <div style={{ padding: 30 }}>Memuat...</div>;

  function ProtectedRoute({ children, allow }) {
    if (!currentUser) return <Navigate to="/" replace />;
    if (!allow.includes(role)) return <Navigate to="/dashboard" replace />;
    return children;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allow={["superadmin", "admin", "viewer"]}>
              <SidebarLayout onLogout={logoutNow}>
                <Dashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute allow={["superadmin"]}>
              <SidebarLayout onLogout={logoutNow}>
                <DashboardFinanceEnterprise />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allow={["superadmin", "admin"]}>
              <SidebarLayout onLogout={logoutNow}>
                <Reports />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute allow={["superadmin", "admin"]}>
              <SidebarLayout onLogout={logoutNow}>
                <Transactions />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute allow={["superadmin", "admin"]}>
              <SidebarLayout onLogout={logoutNow}>
                <Wallet />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
