// src/lib/adminSession.js
export function isAdminLoggedIn() {
  return localStorage.getItem("admin_auth") === "true";
}

export function saveAdminSession(uid, email) {
  localStorage.setItem("admin_auth", "true");
  localStorage.setItem("admin_uid", uid);
  localStorage.setItem("admin_email", email);
}

export function clearAdminSession() {
  localStorage.removeItem("admin_auth");
  localStorage.removeItem("admin_uid");
  localStorage.removeItem("admin_email");
}
