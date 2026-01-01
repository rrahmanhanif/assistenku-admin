const admin = require("firebase-admin");

function initAdmin() {
  if (admin.apps.length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env belum di-set (service account JSON string).");
  }

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  const requestId = req.headers["x-request-id"] || `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  if (req.method !== "POST") {
    return json(res, 405, { success: false, error: "Method not allowed", request_id: requestId });
  }

  try {
    initAdmin();

    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) throw new Error("Authorization Bearer token wajib ada.");

    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const code = String(body.code || "");
    const expected = String(process.env.ADMIN_LOGIN_CODE || "309309");
    if (code !== expected) throw new Error("Kode unik salah.");

    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || "").toLowerCase();
    if (!email) throw new Error("Token tidak memiliki email.");

    const allowed = String(process.env.ADMIN_EMAILS || "kontakassistenku@gmail.com,appassistenku@gmail.com")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!allowed.includes(email)) {
      throw new Error("Email tidak diizinkan sebagai admin.");
    }

    return json(res, 200, { success: true, data: { ok: true, email, uid: decoded.uid }, request_id: requestId });
  } catch (e) {
    return json(res, 400, { success: false, error: e.message || "Unknown error", request_id: requestId });
  }
};
