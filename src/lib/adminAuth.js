// src/lib/adminAuth.js
import { auth } from "../firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

const ADMIN_ALLOWED_EMAILS = [
  "kontakassistenku@gmail.com",
  "appassistenku@gmail.com",
];

export async function sendAdminEmailLink(email, adminCode) {
  const normalized = String(email || "").trim().toLowerCase();

  if (!ADMIN_ALLOWED_EMAILS.includes(normalized)) {
    throw new Error("Email tidak diizinkan untuk Admin.");
  }
  if (String(adminCode) !== "309309") {
    throw new Error("Kode unik Admin salah.");
  }

  localStorage.setItem("assistenku_admin_email", normalized);

  const actionCodeSettings = {
    url: `${window.location.origin}/auth/finish`,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, normalized, actionCodeSettings);
}

export async function completeAdminEmailLinkSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    throw new Error("Link login tidak valid (bukan email-link Firebase).");
  }

  const email = localStorage.getItem("assistenku_admin_email");
  if (!email) {
    throw new Error("Email admin tidak tersimpan. Ulangi dari halaman login.");
  }

  await signInWithEmailLink(auth, email, window.location.href);
  return await auth.currentUser.getIdToken(true);
}
