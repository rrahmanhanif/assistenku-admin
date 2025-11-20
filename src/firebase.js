// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.firebasestorage.app",
  messagingSenderId: "320243806907",
  appId: "1:320243806907:web:50ecedb9a20063d7ee2f9e",
  measurementId: "G-ZKVLZGE552"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// Optional Analytics (tidak error di HP, hanya running di HTTPS)
isSupported().then((yes) => {
  if (yes) {
    getAnalytics(app);
  }
});

export default app;
