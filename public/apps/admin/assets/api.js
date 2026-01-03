const defaultHeaders = {
  "Content-Type": "application/json",
};

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    const error = new Error(payload?.message || payload || "Request failed");
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const apiClient = {
  async get(url) {
    const res = await fetch(url, { credentials: "include" });
    return parseResponse(res);
  },

  async post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return parseResponse(res);
  },

  async del(url) {
    const res = await fetch(url, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    });
    return parseResponse(res);
  },
};
