import { getAuth } from "firebase/auth";
import { firebaseApp } from "../../../config/firebase.js";

export async function getToken() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Gagal mengambil token Firebase:", error);
    return null;
  }
}
