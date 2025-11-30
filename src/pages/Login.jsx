// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { validateEmail, validatePassword } from "@/utils/validator";

if (!validateEmail(email)) {
  alert("Email tidak valid!");
  return;
}

if (!validatePassword(password)) {
  alert("Password minimal 6 karakter");
  return;
}

"use client";

let lastLogin = 0;

export default function LoginPage() {
  const doLogin = async () => {
    const now = Date.now();
    if (now - lastLogin < 8000)
      return alert("Tunggu 8 detik sebelum mencoba lagi");

    lastLogin = now;

    // ... login admin
  };

  return (
    <button onClick={doLogin}>Login</button>
  );
}

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Login gagal!");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Assistenku Admin Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br/><br/>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br/><br/>

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}
