import { db } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

// === Transfer Otomatis ===
export async function processPayment(orderId, total, mitraId, customerId) {
  const coreFee = total * 0.25;
  const mitraFee = total * 0.75;
  const gatewayFee = total * 0.02;

import { sendEmail, pushPopup } from "./notify";

export async function processPayment(orderId, total, mitraId, customerId) {
  // ... kode pembagian hasil seperti tahap 10
  // sesudah update saldo
  await sendEmail(
    "customer@email.com",
    "Pembayaran Berhasil",
    `Transaksi #${orderId} sebesar Rp${total.toLocaleString()} telah diproses.`
  );
  await sendEmail(
    "mitra@email.com",
    "Order Selesai",
    `Anda menerima Rp${(total * 0.75).toLocaleString()} dari order #${orderId}.`
  );

  await pushPopup(customerId, "customer", "Transaksi", "Pembayaran berhasil!");
  await pushPopup(mitraId, "mitra", "Pendapatan", "Saldo anda bertambah!");
  await pushPopup("admin", "core", "Notifikasi", `Order #${orderId} sukses.`);
}
  
  const customerRef = doc(db, "customers", customerId);
  const mitraRef = doc(db, "mitra", mitraId);
  const coreRef = doc(db, "core", "saldo");

  const customerSnap = await getDoc(customerRef);
  const mitraSnap = await getDoc(mitraRef);
  const coreSnap = await getDoc(coreRef);

  const customerSaldo = customerSnap.data().saldo - total;
  const mitraSaldo = mitraSnap.data().saldo + mitraFee;
  const coreSaldo = coreSnap.data().saldo + (coreFee - gatewayFee);

  await updateDoc(customerRef, { saldo: customerSaldo });
  await updateDoc(mitraRef, { saldo: mitraSaldo });
  await updateDoc(coreRef, { saldo: coreSaldo });

  return { success: true };
}

// === Penarikan Dana Mitra ===
export async function withdrawMitra(mitraId, amount) {
  const mitraRef = doc(db, "mitra", mitraId);
  const mitraSnap = await getDoc(mitraRef);
  const saldoSekarang = mitraSnap.data().saldo;

  if (saldoSekarang < amount) {
    throw new Error("Saldo tidak cukup");
  }

  const saldoBaru = saldoSekarang - amount;
  await updateDoc(mitraRef, { saldo: saldoBaru });

  // auto approved (simulasi transfer ke rekening)
  await updateDoc(doc(db, "withdrawLogs", mitraId), {
    lastWithdraw: new Date().toISOString(),
    amount,
    status: "approved",
  });

  import { sendEmail, pushPopup } from "./notify";

export async function processPayment(orderId, total, mitraId, customerId) {
  // ... kode pembagian hasil seperti tahap 10
  // sesudah update saldo
  await sendEmail(
    "customer@email.com",
    "Pembayaran Berhasil",
    `Transaksi #${orderId} sebesar Rp${total.toLocaleString()} telah diproses.`
  );
  await sendEmail(
    "mitra@email.com",
    "Order Selesai",
    `Anda menerima Rp${(total * 0.75).toLocaleString()} dari order #${orderId}.`
  );

  await pushPopup(customerId, "customer", "Transaksi", "Pembayaran berhasil!");
  await pushPopup(mitraId, "mitra", "Pendapatan", "Saldo anda bertambah!");
  await pushPopup("admin", "core", "Notifikasi", `Order #${orderId} sukses.`);
}
  return { success: true };
}
