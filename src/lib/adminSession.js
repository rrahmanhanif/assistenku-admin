// src/lib/adminSession.js
const KEY = "assistenku_admin_session";

export function saveAdminSession({ uid, email, token, expiresAt }) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      uid,
      email,
      token,
      expiresAt,
      verifiedAt: new Date().toISOString()
    })
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

export function isTokenExpired(expiresAt) {
  if (!expiresAt) return true;
  const expiry = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiry)) return true;
  return Date.now() >= expiry;
}

export function isAdminVerified() {
  const s = getAdminSession();
  if (!s?.uid || !s?.email || !s?.token) return false;

  if (isTokenExpired(s.expiresAt)) {
    clearAdminSession();
    return false;
  }

  return true;
}

export function getAdminToken() {
  const s = getAdminSession();
  if (!s?.token || isTokenExpired(s.expiresAt)) return null;
  return s.token;
}

export function clearAdminSession() {
  localStorage.removeItem(KEY);
}
