import emailjs from "@emailjs/browser";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// === kirim email ===
export async function sendEmail(to, subject, message) {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE,
      import.meta.env.VITE_EMAILJS_TEMPLATE,
      { to_email: to, subject, message },
      import.meta.env.VITE_EMAILJS_PUBLIC
    );
  } catch (e) {
    console.error("Gagal kirim email:", e);
  }
}

// === simpan log notifikasi (popup) ===
export async function pushPopup(uid, role, type, text) {
  await addDoc(collection(db, "notifications"), {
    uid,
    role,
    type,
    text,
    read: false,
    createdAt: serverTimestamp(),
  });
}
