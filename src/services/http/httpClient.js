import { resolveBaseUrl } from "./baseUrl";
import { getToken } from "./getToken";

function buildUrl(endpoint, baseUrlOverride) {
  if (endpoint.startsWith("http")) return endpoint;

  const base = resolveBaseUrl(baseUrlOverride);
  const normalizedBase = base.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${normalizedBase}${normalizedEndpoint}`;
}

function parseBody(body, headers) {
  if (!body) return null;
  if (body instanceof FormData) return body;

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return typeof body === "string" ? body : JSON.stringify(body);
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

export async function request({
  endpoint,
  method = "GET",
  headers = {},
  body,
  signal,
  baseUrl,
  includeAuth = true
}) {
  const url = buildUrl(endpoint, baseUrl);
  const finalHeaders = new Headers(headers);

  if (includeAuth) {
    const token = await getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const resolvedBody = parseBody(body, finalHeaders);

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: resolvedBody,
    signal
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request gagal dengan status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { data, response };
}

export const httpClient = { request };
