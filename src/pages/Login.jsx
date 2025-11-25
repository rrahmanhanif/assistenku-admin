import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

export function renderLogin() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="login-container">
            <h2>Assistenku Admin</h2>
            <input id="email" type="email" placeholder="Email" />
            <input id="password" type="password" placeholder="Password" />
            <button id="loginBtn">Login</button>
            <p id="msg"></p>
        </div>
    `;

    document.getElementById("loginBtn").addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const msg = document.getElementById("msg");

        if (!email || !password) {
            msg.innerText = "Email dan password wajib diisi.";
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.hash = "#/dashboard";
        } catch (error) {
            msg.innerText = "Login gagal: " + error.code;
        }
    });
}
