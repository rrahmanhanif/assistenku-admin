// src/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhGxVi8Sypbq3gvjanY016SwkOz0EKpnM",
  authDomain: "assistenku-admin.firebaseapp.com",
  projectId: "assistenku-admin",
  storageBucket: "assistenku-admin.firebasestorage.app",
  messagingSenderId: "1020511937068",
  appId: "1:1020511937068:web:fc6e7491d8a79af7486789",
  measurementId: "G-9NCX2N53XB"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
