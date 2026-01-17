import { logoutAdmin, refreshAdminToken } from "./adminAuth.js";
import {
  getAdminSession,
  getAdminToken,
  isTokenExpired
} from "./adminSession.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function requireApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL belum diset.");
  }
  return API_BASE_URL;
}

async function resolveToken() {
  const session = getAdminSession();
  if (session?.token) {
    if (isTokenExpired(session.expiresAt)) {
      await logoutAdmin();
      return null;
    }
    return session.token;
  }

  const token = getAdminToken();
  if (token) return token;

  return await refreshAdminToken();
}

export async function adminFetch(path, options = {}) {
  const baseUrl = requireApiBaseUrl();
  const token = await resolveToken();

  if (!token) {
    await logoutAdmin();
    throw new Error("Sesi admin berakhir. Silakan login ulang.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    await logoutAdmin();
    throw new Error("Akses ditolak. Silakan login ulang sebagai ADMIN.");
  }

  return response;
}

export async function adminGet(path) {
  const response = await adminFetch(path, { method: "GET" });
  return response.json();
}

export async function adminPost(path, body) {
  const response = await adminFetch(path, {
    method: "POST",
    body: JSON.stringify(body ?? {})
  });
  return response.json();
}
