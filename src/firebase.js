// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Deteksi role otomatis dari .env
const appRole = import.meta.env.VITE_APP_ROLE || "core";

// Firebase config universal (gunakan variabel dari .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inisialisasi tunggal
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Instance universal
export const auth = getAuth(app);
export const db = getFirestore(app);

// Logging otomatis agar mudah debugging
console.log(`🔗 Firebase connected (${appRole.toUpperCase()}) using project: ${firebaseConfig.projectId}`);

export default app;
