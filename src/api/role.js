import { ref, set, get, child } from "firebase/database";
import { db } from "../firebase.js";

export async function setUserRole(uid, role) {
  // role: "admin" | "mitra" | "customer"
  return set(ref(db, `roles/${uid}`), role);
}

export async function getUserRole(uid) {
  const snapshot = await get(child(ref(db), `roles/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function setUserProfile(uid, profile) {
  // profile: { email, name, role }
  return set(ref(db, `users/${uid}`), profile);
}

export async function getUserProfile(uid) {
  const snapshot = await get(child(ref(db), `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}
