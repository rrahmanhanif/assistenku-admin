import { logoutAdmin, refreshAdminToken } from "./adminAuth.js";
import {
  getAdminSession,
  getAdminToken,
  isTokenExpired
} from "./adminSession.js";
import { httpClient } from "../services/http/httpClient.js";
import { resolveBaseUrl } from "../services/http/baseUrl.js";

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

  try {
    const { data, response } = await httpClient.request({
      endpoint: path,
      method: options.method || "GET",
      headers,
      body: options.body,
      baseUrl: resolveBaseUrl(),
    });

    return { data, response };
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      await logoutAdmin();
      throw new Error("Akses ditolak. Silakan login ulang sebagai ADMIN.");
    }
    throw error;
  }
}

export async function adminGet(path) {
  const { data } = await adminFetch(path, { method: "GET" });
  return data;
}

export async function adminPost(path, body) {
  const { data } = await adminFetch(path, {
    method: "POST",
    body: body ?? {},
  });
  return data;
}
