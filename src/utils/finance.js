// src/utils/finance.js
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { sendEmail, pushPopup } from "./notify";

/* ================================
   PEMBAYARAN (CASH / CASHLESS)
   ================================ */
export async function processPayment(orderId, total, mitraId, customerId) {
  const coreFee = total * 0.25;
  const mitraFee = total * 0.75;
  const gatewayFee = total * 0.02;

  const customerRef = doc(db, "customers", customerId);
  const mitraRef = doc(db, "mitra", mitraId);
  const coreRef = doc(db, "core", "saldo");

  const customerSnap = await getDoc(customerRef);
  const mitraSnap = await getDoc(mitraRef);
  const coreSnap = await getDoc(coreRef);

  const customerSaldo = (customerSnap.data()?.saldo || 0) - total;
  const mitraSaldo = (mitraSnap.data()?.saldo || 0) + mitraFee;
  const coreSaldo = (coreSnap.data()?.saldo || 0) + (coreFee - gatewayFee);

  await updateDoc(customerRef, { saldo: customerSaldo });
  await updateDoc(mitraRef, { saldo: mitraSaldo });
  await updateDoc(coreRef, { saldo: coreSaldo });

  await sendEmail(
    "customer@email.com",
    "Pembayaran Berhasil",
    `Transaksi #${orderId} sebesar Rp${total.toLocaleString()} telah diproses.`
  );
  await sendEmail(
    "mitra@email.com",
    "Order Selesai",
    `Anda menerima Rp${mitraFee.toLocaleString()} dari order #${orderId}.`
  );

  await pushPopup(customerId, "customer", "Transaksi", "Pembayaran berhasil!");
  await pushPopup(mitraId, "mitra", "Pendapatan", "Saldo anda bertambah!");
  await pushPopup("admin", "core", "Notifikasi", `Order #${orderId} sukses.`);

  return { success: true };
}

/* ================================
   PENARIKAN DANA MITRA
   ================================ */
export async function withdrawMitra(mitraId, amount) {
  const mitraRef = doc(db, "mitra", mitraId);
  const mitraSnap = await getDoc(mitraRef);
  const saldoSekarang = mitraSnap.data()?.saldo || 0;

  if (saldoSekarang < amount) {
    throw new Error("Saldo tidak cukup untuk penarikan.");
  }

  const saldoBaru = saldoSekarang - amount;
  await updateDoc(mitraRef, { saldo: saldoBaru });

  await pushPopup(mitraId, "mitra", "Penarikan", `Penarikan Rp${amount.toLocaleString()} disetujui.`);
  await sendEmail("mitra@email.com", "Penarikan Disetujui", `Dana Rp${amount.toLocaleString()} telah dikirim.`);
  await pushPopup("admin", "core", "Penarikan", `Mitra ${mitraId} menarik Rp${amount.toLocaleString()}`);

  await setDoc(doc(db, "withdrawLogs", mitraId), {
    lastWithdraw: new Date().toISOString(),
    amount,
    status: "approved",
  });

  return { success: true };
}

/* ================================
   FINALISASI ORDER
   ================================ */
export async function finalizeOrder(orderId) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error("Order tidak ditemukan.");

  const order = orderSnap.data();
  if (order.status === "completed") throw new Error("Order sudah selesai sebelumnya.");

  await updateDoc(orderRef, {
    status: "completed",
    finishedAt: serverTimestamp(),
  });

  const custRef = doc(db, "customers", order.customerId);
  const custSnap = await getDoc(custRef);
  const holdAmount = custSnap.data()?.holdAmount || 0;
  if (holdAmount > 0) await updateDoc(custRef, { holdAmount: 0 });

  return { success: true };
}
