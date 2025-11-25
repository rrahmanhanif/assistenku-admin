import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// CREATE USER
export async function createUser(data) {
  return await addDoc(collection(db, "users"), data);
}

// READ USERS
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// UPDATE USER
export async function updateUser(id, data) {
  return await updateDoc(doc(db, "users", id), data);
}

// DELETE USER
export async function deleteUser(id) {
  return await deleteDoc(doc(db, "users", id));
}
