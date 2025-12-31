// src/lib/firebaseAdmin.js
import { firebaseApp } from "../../config/firebase.js";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";

export const auth = getAuth(firebaseApp);

export async function initAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // ignore
  }
}

export async function sendAdminEmailLink(email) {
  const actionCodeSettings = {
    url: `${window.location.origin}/`, // kembali ke root untuk menyelesaikan sign-in
    handleCodeInApp: true,
  };
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

export function isEmailLink(url) {
  return isSignInWithEmailLink(auth, url);
}

export async function completeEmailLinkSignIn(email, url) {
  const result = await signInWithEmailLink(auth, email, url);
  return result.user;
}

export async function signOutAdmin() {
  await signOut(auth);
}
