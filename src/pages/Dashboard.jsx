import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

export function renderDashboard() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="dashboard">
            <h1>Dashboard Admin</h1>
            <button id="logoutBtn">Logout</button>
        </div>
    `;

    document.getElementById("logoutBtn").onclick = async () => {
        await signOut(auth);
        window.location.hash = "#/login";
    };
}
