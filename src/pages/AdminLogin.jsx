// src/pages/AdminLogin.jsx
import React, { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseAdmin";
import { saveAdminSession } from "../lib/adminSession";
import { validateEmail, validatePassword } from "../utils/validator";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Anti-bot honeypot
  const [hp, setHp] = useState("");
  if (hp !== "") return null;

  // Anti-bruteforce 8 detik
  const lastLogin = useRef(0);

  async function handleLogin(e) {
    e.preventDefault();

    const now = Date.now();
    if (now - lastLogin.current < 8000) {
      alert("Tunggu 8 detik sebelum mencoba lagi");
      return;
    }
    lastLogin.current = now;

    if (!validateEmail(email)) {
      setError("Email tidak valid");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      saveAdminSession(user.uid, user.email);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Email atau password salah");
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          Login Admin
        </h2>

        {/* Honeypot */}
        <input
          type="text"
          style={{ display: "none" }}
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />

        <input
          type="email"
          className="border p-2 w-full mb-3 rounded"
          placeholder="Email Admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="border p-2 w-full mb-4 rounded"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
