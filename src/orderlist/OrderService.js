import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";

// Customer creates order
export const createOrder = (uid) => {
  return push(ref(db, "orders"), {
    customerId: uid,
    status: "pending",
    createdAt: Date.now(),
  });
};

// Admin assigns order
export const assignOrder = (orderId, mitraId) => {
  return update(ref(db, "orders/" + orderId), {
    mitraId,
    status: "assigned",
  });
};
