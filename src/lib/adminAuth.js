// src/lib/adminAuth.js
import { firebaseApp } from "../../config/firebase.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "firebase/auth";
import {
  clearAdminSession,
  getAdminSession,
  isTokenExpired,
  saveAdminSession
} from "./adminSession.js";

const ADMIN_ALLOWED_EMAILS = [
  "kontakassistenku@gmail.com",
  "appassistenku@gmail.com"
];

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export function getAdminAuth() {
  return getAuth(firebaseApp);
}

function assertAllowedEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!ADMIN_ALLOWED_EMAILS.includes(normalized)) {
    throw new Error("Email tidak diizinkan. Pastikan akun Google terdaftar di allowlist admin.");
  }
  return normalized;
}

async function persistSession(user) {
  const email = assertAllowedEmail(user?.email);
  const tokenResult = await user.getIdTokenResult(true);

  saveAdminSession({
    uid: user.uid,
    email,
    token: tokenResult.token,
    expiresAt: tokenResult.expirationTime
  });

  return tokenResult.token;
}

export async function signInWithGooglePopup() {
  const auth = getAdminAuth();
  const result = await signInWithPopup(auth, provider);
  return persistSession(result.user);
}

export async function signInWithGoogleRedirect() {
  const auth = getAdminAuth();
  await signInWithRedirect(auth, provider);
}

export async function handleGoogleRedirect() {
  const auth = getAdminAuth();
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  return persistSession(result.user);
}

export async function refreshAdminToken() {
  const auth = getAdminAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return persistSession(user);
}

export async function logoutAdmin() {
  clearAdminSession();
  const auth = getAdminAuth();
  await signOut(auth);
}

export async function enforceAdminSession() {
  const session = getAdminSession();
  if (!session?.token) return false;

  if (isTokenExpired(session.expiresAt)) {
    await logoutAdmin();
    return false;
  }

  return true;
}
