import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise";
import AdminLayout from "./layout/AdminLayout";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("viewer"); // default aman
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        try {
          const snap = await getDoc(doc(db, "core_users", u.uid));

          if (snap.exists()) {
            setRole(snap.data().role || "viewer");
          } else {
            // jika dokumen role tidak ada → pakai superadmin sementara
            setRole("superadmin");
          }
        } catch (err) {
          console.error("ROLE ERROR:", err);
          setRole("viewer");
        }
      } else {
        setUser(null);
        setRole("viewer");
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logoutNow = async () => {
    await signOut(auth);
    setUser(null);
    setRole("viewer");
  };

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />

        <Route
          path="/dashboard"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow} role={role}>
                <DashboardAdmin role={role} />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/finance"
          element={
            user ? (
              <AdminLayout onLogout={logoutNow} role={role}>
                <DashboardFinanceEnterprise role={role} />
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
