import { renderLogin } from "./pages/login.js";
import { renderDashboard } from "./pages/dashboard.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

function router() {
    const hash = window.location.hash;

    if (hash === "#/dashboard") {
        renderDashboard();
    } else {
        renderLogin();
    }
}

window.addEventListener("hashchange", router);

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.hash = "#/dashboard";
    } else {
        window.location.hash = "#/login";
    }
});

router();
