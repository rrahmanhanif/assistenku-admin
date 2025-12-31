const { parseCookies, verifySessionCookie } = require("../../_lib/session");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ success: false, error: "Method not allowed" });

  const cookies = parseCookies(req);
  const raw = cookies.assistenku_admin_session;
  const session = verifySessionCookie(raw ? decodeURIComponent(raw) : "");

  if (!session || session.role !== "admin") {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  return res.status(200).json({ success: true, data: { actor: { role: "admin", email: session.email } } });
};
