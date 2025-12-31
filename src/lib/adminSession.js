// src/lib/adminSession.js
const KEY = "assistenku_admin_session";

export function saveAdminSession({ uid, email }) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      uid,
      email,
      verifiedAt: new Date().toISOString(),
    }),
  );
}

export function getAdminSession() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdminLoggedIn() {
  const s = getAdminSession();
  return Boolean(s?.uid && s?.email && s?.verifiedAt);
}

export function clearAdminSession() {
  localStorage.removeItem(KEY);
}
