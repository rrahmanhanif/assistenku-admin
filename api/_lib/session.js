const crypto = require("crypto");

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function makeSessionCookie(payload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("Missing/weak env SESSION_SECRET");

  const token = base64url(JSON.stringify(payload));
  const sig = sign(token, secret);
  return `${token}.${sig}`;
}

function verifySessionCookie(cookieValue) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  if (!cookieValue || typeof cookieValue !== "string") return null;

  const [token, sig] = cookieValue.split(".");
  if (!token || !sig) return null;

  const expected = sign(token, secret);
  if (expected !== sig) return null;

  try {
    const json = Buffer.from(token.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((p) => {
    const [k, ...rest] = p.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

module.exports = { makeSessionCookie, verifySessionCookie, parseCookies };
