// src/pages/Login.jsx
"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

// FIX: ganti alias "@" → relative path biasa
import { validateEmail, validatePassword } from "../utils/validator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Honeypot (anti bot)
  const [hp, setHp] = useState("");
  if (hp !== "") {
    alert("Bot login attempt blocked!");
    return null;
  }

  let lastLogin = 0;

  const handleLogin = async () => {
    const now = Date.now();
    if (now - lastLogin < 8000)
      return alert("Tunggu 8 detik sebelum mencoba lagi");

    lastLogin = now;

    if (!validateEmail(email)) {
      alert("Email tidak valid!");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Login gagal!");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Assistenku Admin Login</h2>

      {/* Hidden honeypot */}
      <input
        type="text"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        style={{ display: "none" }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}
