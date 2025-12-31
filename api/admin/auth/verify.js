const { firebaseAdmin } = require("../../_lib/firebaseAdmin");
const { getSupabaseAdmin } = require("../../_lib/supabaseAdmin");
const { makeSessionCookie } = require("../../_lib/session");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    const code = (req.body && req.body.code) ? String(req.body.code) : "";
    const expectedCode = String(process.env.ADMIN_LOGIN_CODE || "");
    if (!expectedCode) throw new Error("Missing env ADMIN_LOGIN_CODE");
    if (code !== expectedCode) return res.status(401).json({ success: false, error: "Kode unik salah" });

    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ success: false, error: "Missing Authorization Bearer token" });

    const idToken = match[1];
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = (decoded.email || "").toLowerCase();
    const uid = decoded.uid;

    if (!email) return res.status(401).json({ success: false, error: "Email tidak ada di token" });

    const supabase = getSupabaseAdmin();

    // WHITELIST via registry: role ADMIN dan aktif
    const { data: reg, error: regErr } = await supabase
      .from("registry")
      .select("id, role, email, is_active")
      .eq("role", "ADMIN")
      .eq("is_active", true)
      .ilike("email", email)
      .limit(1);

    if (regErr) throw new Error(regErr.message);
    if (!reg || reg.length === 0) {
      return res.status(403).json({ success: false, error: "Email tidak terdaftar sebagai ADMIN di registry" });
    }

    // Upsert accounts (butuh kolom firebase_uid; kalau belum ada, tambahkan via SQL)
    const upsertPayload = {
      email,
      name: "Admin",
      role: "admin",
      status: "active",
      firebase_uid: uid,
      updated_at: new Date().toISOString()
    };

    const { error: upErr } = await supabase
      .from("accounts")
      .upsert(upsertPayload, { onConflict: "email" });

    if (upErr) throw new Error(upErr.message);

    // Set cookie session internal (httpOnly)
    const cookieValue = makeSessionCookie({
      role: "admin",
      email,
      uid,
      iat: Date.now()
    });

    res.setHeader("Set-Cookie", [
      `assistenku_admin_session=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 12}`
    ]);

    return res.status(200).json({ success: true, data: { ok: true, email } });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || "Server error" });
  }
};
