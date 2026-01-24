import { httpClient } from "../services/http/httpClient";
import { resolveBaseUrl } from "./baseUrl";
import {
  getAdminToken,
  refreshAdminToken,
  logoutAdmin,
} from "./auth";
import { isTokenExpired } from "./token";

async function resolveToken() {
  const session = await getAdminToken?.();

  if (session?.token) {
    if (isTokenExpired(session.expiresAt)) {
      await logoutAdmin();
      return null;
    }
    return session.token;
  }

  const token = getAdminToken?.();
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

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const data = await httpClient.request(
      path,
      {
        method: options.method || "GET",
        headers,
        body: options.body,
        auth: false, // token sudah disuntik manual
      }
    );

    return { data };
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
    body,
  });
  return data;
}

export async function adminPut(path, body) {
  const { data } = await adminFetch(path, {
    method: "PUT",
    body,
  });
  return data;
}

export async function adminDelete(path) {
  const { data } = await adminFetch(path, {
    method: "DELETE",
  });
  return data;
}
