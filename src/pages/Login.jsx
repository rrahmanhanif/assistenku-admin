// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { auth } from "../firebaseConfig.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert("Login gagal: " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
          Login Admin
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
