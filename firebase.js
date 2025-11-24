// Firebase Core
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  databaseURL: "https://assistenku-8ef85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.firebasestorage.app",
  messagingSenderId: "320243806907",
  appId: "1:320243806907:web:50ecedb9a20063d7ee2f9e",
  measurementId: "G-ZKVLZGE552",
};

// Initialize
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export service untuk digunakan di seluruh aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
