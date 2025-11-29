// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "assistenku-admin.firebaseapp.com",
  projectId: "assistenku-admin",
  storageBucket: "assistenku-admin.appspot.com",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf"
};

const adminApp = initializeApp(firebaseConfig);

export const auth = getAuth(adminApp);
export const db = getFirestore(adminApp);
