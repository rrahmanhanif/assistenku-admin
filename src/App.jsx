// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

// ✅ Import halaman sesuai nama file di /src/pages
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Wallet from "./pages/Wallet";
import Withdraw from "./pages/Withdraw";

// 🔐 Email developer yang diizinkan
const DEVELOPER_EMAIL = "kontakassistenku@gmail.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // ✅ Cek apakah email sesuai dengan developer email
        if (currentUser.email === DEVELOPER_EMAIL) {
          setUser(currentUser);
          setIsAuthorized(true);
        } else {
          // ❌ Jika bukan developer, logout otomatis
          await signOut(auth);
          alert("Akses ditolak. Hanya developer yang dapat masuk ke dashboard ini.");
          setIsAuthorized(false);
          setUser(null);
        }
      } else {
        setUser(null);
        setIsAuthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔵 Tampilan loading khas Assistenku
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-blue-600 font-semibold text-lg tracking-wide">
          Memuat data, mohon tunggu...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Default route */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* 🔹 Halaman utama (hanya untuk developer yang terotorisasi) */}
        <Route
          path="/dashboard"
          element={
            user && isAuthorized ? <DashboardAdmin /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/transactions"
          element={
            user && isAuthorized ? <Transactions /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/reports"
          element={
            user && isAuthorized ? <Reports /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/wallet"
          element={
            user && isAuthorized ? <Wallet /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/withdraw"
          element={
            user && isAuthorized ? <Withdraw /> : <Navigate to="/login" />
          }
        />

        {/* 🔹 Halaman login */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* 🔹 Fallback jika URL tidak dikenal */}
        <Route
          path="*"
          element={
            user && isAuthorized ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
          }
