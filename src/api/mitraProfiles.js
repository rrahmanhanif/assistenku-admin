import { ref, push, get, update, remove } from "firebase/database";
import { db } from "../firebase.js";

export async function createMitra(profile) {
  // profile = { name, email, available }
  return push(ref(db, "mitra_profiles"), profile);
}

export async function listMitra() {
  const snapshot = await get(ref(db, "mitra_profiles"));
  return snapshot.val();
}

export async function updateMitra(mitraId, data) {
  return update(ref(db, `mitra_profiles/${mitraId}`), data);
}

export async function deleteMitra(mitraId) {
  return remove(ref(db, `mitra_profiles/${mitraId}`));
}
