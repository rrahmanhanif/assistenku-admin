// src/services/finance.js
import { doc, getDoc, runTransaction, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { calculateOrder } from "./calcPricing";
import { sendEmail, pushPopup } from "../notify";

function round(v) { return Math.round(v); }

/**
 * Jalankan pembayaran otomatis: customer → core + mitra
 */
export async function processPayment({
  orderId,
  serviceKey,
  durationType = "HOURLY",
  baseRatePerHour,
  demand = 1,
  supply = 1,
  mitraId,
  customerId,
  nightShift = false,
}) {
  const coreFeePercent = Number(import.meta.env.VITE_CORE_FEE_PERCENT || 0.25);
  const gatewayFeePercent = Number(import.meta.env.VITE_GATEWAY_FEE_PERCENT || 0.015);
  const gatewayThreshold = Number(import.meta.env.VITE_GATEWAY_THRESHOLD || 0.02);

  const calc = calculateOrder({
    serviceKey,
    durationType,
    baseRatePerHour,
    demand,
    supply,
    coreFeePercent,
    gatewayFeePercent,
    gatewayThreshold,
    nightShift,
  });

  const txRecord = {
    orderId,
    serviceKey,
    durationType,
    totalOrderAllIn: calc.totalOrderAllIn,
    totalChargedToCustomer: calc.totalChargedToCustomer,
    mitraAmount: calc.mitraAmount,
    coreAmount: calc.coreAmount,
    gatewayRecorded: calc.gatewayRecorded,
    createdAt: serverTimestamp(),
  };

  try {
    await runTransaction(db, async (t) => {
      const mitraRef = doc(db, "mitra", mitraId);
      const custRef = doc(db, "customers", customerId);
      const coreRef = doc(db, "core", "balance");

      const [mSnap, cSnap, coreSnap] = await Promise.all([
        t.get(mitraRef),
        t.get(custRef),
        t.get(coreRef),
      ]);

      if (!mSnap.exists()) throw new Error("Mitra tidak ditemukan");
      if (!cSnap.exists()) throw new Error("Customer tidak ditemukan");
      if (!coreSnap.exists()) t.set(coreRef, { saldo: 0 });

      const saldoCust = cSnap.data().saldo || 0;
      if (saldoCust < calc.totalChargedToCustomer)
        throw new Error("Saldo customer tidak cukup");

      const saldoMitra = mSnap.data().saldo || 0;
      const saldoCore = coreSnap.exists() ? coreSnap.data().saldo || 0 : 0;

      t.update(custRef, { saldo: round(saldoCust - calc.totalChargedToCustomer) });
      t.update(mitraRef, { saldo: round(saldoMitra + calc.mitraAmount) });
      t.update(coreRef, { saldo: round(saldoCore + calc.coreAmount) });

      const txCol = collection(db, "transactions");
      t.set(doc(txCol, orderId), { ...txRecord, status: "success", processedAt: serverTimestamp() });
    });

    await Promise.all([
      pushPopup(customerId, "customer", "Transaksi", `Order ${orderId} sukses Rp${calc.totalChargedToCustomer.toLocaleString("id-ID")}`),
      pushPopup(mitraId, "mitra", "Pendapatan", `Saldo +Rp${calc.mitraAmount.toLocaleString("id-ID")}`),
      pushPopup("admin", "core", "Info", `Transaksi ${orderId} selesai.`),
      sendEmail("customer@email.com", "Pembayaran Berhasil", `Transaksi #${orderId} senilai Rp${calc.totalChargedToCustomer.toLocaleString("id-ID")} berhasil.`),
      sendEmail("mitra@email.com", "Pendapatan Baru", `Anda menerima Rp${calc.mitraAmount.toLocaleString("id-ID")} dari order #${orderId}.`)
    ]);

    return { success: true, detail: calc };
  } catch (e) {
    console.error("processPayment error:", e);
    return { success: false, error: e.message };
  }
        }
