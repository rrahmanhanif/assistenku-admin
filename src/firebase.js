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

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✔ Ganti konfigurasi dengan milik kamu
const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",
  messagingSenderId: "119530003693",
  appId: "1:119530003693:web:xxxxxxxxxxxxxxxx",
};

// **Initialize Firebase App**
const app = initializeApp(firebaseConfig);

// **Firestore (Database)**
export const db = getFirestore(app);
