// src/pages/Login.jsx
import React, { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { validateEmail, validatePassword } from "../utils/validator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Honeypot anti bot
  const [hp, setHp] = useState("");
  if (hp !== "") return null; // bot auto fail

  const lastLogin = useRef(0);

  const handleLogin = async () => {
    const now = Date.now();
    if (now - lastLogin.current < 8000) {
      alert("Tunggu 8 detik sebelum mencoba lagi");
      return;
    }
    lastLogin.current = now;

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

      <input
        type="text"
        style={{ display: "none" }}
        value={hp}
        onChange={(e) => setHp(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}
