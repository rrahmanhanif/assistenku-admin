// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Konfigurasi Firebase Client SDK
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_WEB_API_KEY || "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  databaseURL: "https://assistenku-8ef85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.firebasestorage.app",
  messagingSenderId: "320243806907",
  appId: "1:320243806907:web:50ecedb9a20063d7ee2f9e",
  measurementId: "G-ZKVLZGE552"
};

// Init
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);      // jika ingin realtime database
export const storage = getStorage(app);    // jika ingin upload foto/video
export default app;
