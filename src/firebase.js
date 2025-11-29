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
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",
  messagingSenderId: "119530003693",
  appId: "1:119530003693:web:xxxxx",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
