// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",   // ✔️ diperbaiki
  messagingSenderId: "320243806907",
  appId: "1:320243806907:web:50ecedb9a20063d7ee2f9e",
  measurementId: "G-ZKVLZGE552"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

// Storage
export const storage = getStorage(app);

// Analytics (hanya aktif di https)
isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});

export default app;
