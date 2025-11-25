import { ref, push, get, remove, update } from "firebase/database";
import { db } from "../firebase.js";

export async function createService(service) {
  // service = { name, price }
  return push(ref(db, "services"), service);
}

export async function listServices() {
  const snapshot = await get(ref(db, "services"));
  return snapshot.val(); // objek services
}

export async function updateService(serviceId, data) {
  return update(ref(db, `services/${serviceId}`), data);
}

export async function deleteService(serviceId) {
  return remove(ref(db, `services/${serviceId}`));
}
