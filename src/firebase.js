roles/
  {uid}/role = "admin" | "mitra" | "customer"

users/
  {uid}/
    email: string
    name: string
    role: string

orders/
  {orderId}/
    customerId: string
    mitraId: string|null
    service: string
    status: "pending" | "assigned" | "in_progress" | "done"
    timestamp: number

services/
  {serviceId}/
    name: string
    price: number

mitra_profiles/
  {mitraId}/
    name: string
    email: string
    available: boolean

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  databaseURL: "https://assistenku-8ef85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.firebasestorage.app",
  messagingSenderId: "320243806907",
  appId: "1:320243806907:web:50ecedb9a20063d7ee2f9e",
  measurementId: "G-ZKVLZGE552"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
