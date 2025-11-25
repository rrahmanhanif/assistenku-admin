import { ref, get, update } from "firebase/database";
import { db } from "../firebase.js";

export async function listOrders() {
  const snapshot = await get(ref(db, "orders"));
  return snapshot.val();
}

export async function assignMitra(orderId, mitraId) {
  return update(ref(db, `orders/${orderId}`), {
    mitraId,
    status: "assigned"
  });
}

export async function updateOrderStatus(orderId, status) {
  return update(ref(db, `orders/${orderId}`), { status });
}
