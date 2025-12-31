import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut
} from "firebase/auth";

function requireEnv(name) {
  const v = import.meta.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const firebaseConfig = {
  apiKey: requireEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("VITE_FIREBASE_PROJECT_ID"),
  appId: requireEnv("VITE_FIREBASE_APP_ID")
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Pastikan auth persistence stabil
setPersistence(auth, browserLocalPersistence).catch(() => {});

export async function sendAdminSignInLink(email) {
  const actionCodeSettings = {
    // harus kembali ke origin yang sama agar signInWithEmailLink berhasil
    url: window.location.origin + "/",
    handleCodeInApp: true
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // simpan email sementara untuk menyelesaikan sign-in
  window.localStorage.setItem("assistenku_admin_emailForSignIn", email);
}

export function isEmailLink(url) {
  return isSignInWithEmailLink(auth, url);
}

export async function completeEmailLinkSignIn(url) {
  const email = window.localStorage.getItem("assistenku_admin_emailForSignIn");
  if (!email) throw new Error("Email tidak ditemukan. Ulangi proses login dari awal.");
  const cred = await signInWithEmailLink(auth, email, url);
  window.localStorage.removeItem("assistenku_admin_emailForSignIn");
  return cred;
}

export async function getFirebaseIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Belum login Firebase.");
  return await user.getIdToken(true);
}

export async function firebaseLogout() {
  await signOut(auth);
}
