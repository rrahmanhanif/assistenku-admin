import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserRole(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().role;
}

export async function getRolePermissions(roleName) {
  const ref = doc(db, "roles", roleName);
  const snap = await getDoc(ref);
  if (!snap.exists()) return {};
  return snap.data();
}
