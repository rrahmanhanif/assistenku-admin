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

const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",
  messagingSenderId: "742556046497",
  appId: "1:742556046497:web:e4c43f4d9ab07fad62bd97"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
