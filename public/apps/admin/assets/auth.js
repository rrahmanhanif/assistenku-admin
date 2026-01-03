import { apiClient } from "./api.js";

export async function requireSession() {
  try {
    const session = await apiClient.get("/api/admin/auth/me");
    renderSessionStatus(session);
    return session;
  } catch (err) {
    if (err.status === 401) {
      window.location.href = "/admin/login.html";
      return;
    }
    showInlineError(`Gagal memuat sesi: ${err.message}`);
    throw err;
  }
}

export async function logout() {
  try {
    await apiClient.post("/api/admin/auth/logout");
  } catch (err) {
    console.warn("Logout error", err);
  }
  if (window.firebaseAuth) {
    try {
      const { signOut } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
      );
      await signOut(window.firebaseAuth);
    } catch (e) {
      console.warn("Firebase signOut skipped", e);
    }
  }
  window.location.href = "/admin/login.html";
}

export async function verifyAndCreateSession(idToken, code) {
  return apiClient.post("/api/admin/auth/verify", { code, idToken });
}

export function renderSessionStatus(session) {
  const emailTarget = document.querySelector("[data-user-email]");
  if (emailTarget) {
    const fallbackEmail = localStorage.getItem("adminUserEmail") || "-";
    const email = session?.user?.email || fallbackEmail;
    emailTarget.textContent = email;
  }
  const statusTarget = document.querySelector("[data-session-status]");
  if (statusTarget) {
    statusTarget.textContent = session ? "Aktif" : "-";
    statusTarget.classList.add(session ? "badge" : "");
    if (session) statusTarget.classList.add("success");
  }
}

function showInlineError(message) {
  const container = document.querySelector("[data-error-box]");
  if (container) {
    container.textContent = message;
    container.classList.add("alert", "error");
  }
}

export function attachLoginHandlers(auth) {
  const loginForm = document.querySelector("#login-form");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const codeInput = document.querySelector("#admin-code");
  const errorBox = document.querySelector("[data-error]");
  const successBox = document.querySelector("[data-success]");

  const showMessage = (box, message) => {
    if (!box) return;
    box.textContent = message;
    box.style.display = message ? "block" : "none";
  };

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showMessage(errorBox, "");
      showMessage(successBox, "");
      const email = emailInput?.value?.trim();
      const password = passwordInput?.value?.trim();
      const code = codeInput?.value?.trim();
      if (!email) {
        showMessage(errorBox, "Email wajib diisi");
        return;
      }
      if (!code) {
        showMessage(errorBox, "Kode admin wajib diisi");
        return;
      }
      const submitBtn = loginForm.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      try {
        const { signInWithEmailAndPassword } = await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
        );
        const cred = await signInWithEmailAndPassword(auth, email, password || "");
        const idToken = await cred.user.getIdToken();
        localStorage.setItem("adminUserEmail", cred.user.email || "");
        await verifyAndCreateSession(idToken, code);
        window.location.href = "/admin/dashboard.html";
      } catch (err) {
        showMessage(errorBox, err.message || "Login gagal");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const magicLinkBtn = document.querySelector("#send-link");
  if (magicLinkBtn && emailInput) {
    magicLinkBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      showMessage(errorBox, "");
      const email = emailInput.value.trim();
      if (!email) {
        showMessage(errorBox, "Email wajib diisi untuk kirim link");
        return;
      }
      try {
        const {
          sendSignInLinkToEmail,
          isSignInWithEmailLink,
          signInWithEmailLink,
        } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const actionCodeSettings = {
          url: `${window.location.origin}/admin/login.html`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        localStorage.setItem("adminEmailForLink", email);
        showMessage(successBox, "Link login dikirim. Cek email Anda.");
        magicLinkBtn.disabled = true;
        setTimeout(() => (magicLinkBtn.disabled = false), 5000);

        if (isSignInWithEmailLink(auth, window.location.href)) {
          const storedEmail = localStorage.getItem("adminEmailForLink") || email;
          const credential = await signInWithEmailLink(
            auth,
            storedEmail,
            window.location.href
          );
          const idToken = await credential.user.getIdToken();
          localStorage.setItem("adminUserEmail", credential.user.email || storedEmail);
          const code =
            codeInput?.value?.trim() || window.RUNTIME_CONFIG?.adminCodeDefault;
          await verifyAndCreateSession(idToken, code || "");
          window.location.href = "/admin/dashboard.html";
        }
      } catch (err) {
        showMessage(errorBox, err.message || "Gagal mengirim link");
      }
    });
  }
}
