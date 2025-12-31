module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  res.setHeader("Set-Cookie", [
    "assistenku_admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  ]);

  return res.status(200).json({ success: true, data: { ok: true } });
};
