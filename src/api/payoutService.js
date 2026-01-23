// src/api/payoutService.js

import { db } from "../firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

const FLIP_SECRET = import.meta.env.VITE_FLIP_SECRET || "your-flip-secret";

export const payoutToMitra = async (mitraData, amount) => {
  try {
    const payload = {
      account_number: mitraData.rekening,
      bank_code: mitraData.bankCode, // contoh: "bri", "bca", "mandiri"
      amount: amount,
      remark: "Penarikan saldo Mitra Assistenku",
    };

    const { data } = await httpClient.request({
      endpoint: endpoints.flip.disbursement,
      method: "POST",
      includeAuth: false,
      headers: {
        Authorization: `Basic ${btoa(FLIP_SECRET + ":")}`,
      },
      body: payload,
    });

    // Catat hasil penarikan
    await addDoc(collection(db, "withdrawLogs"), {
      mitraId: mitraData.id,
      nama: mitraData.nama,
      amount: amount,
      rekening: mitraData.rekening,
      bank: mitraData.bankCode,
      status: "Berhasil",
      createdAt: new Date(),
    });

    // Update saldo mitra
    const mitraRef = doc(db, "mitraSaldo", mitraData.id);
    await updateDoc(mitraRef, {
      saldo: mitraData.saldo - amount,
    });

    return { success: true, data };
  } catch (err) {
    console.error("Payout gagal:", err);

    await addDoc(collection(db, "withdrawLogs"), {
      mitraId: mitraData.id,
      amount,
      status: "Gagal",
      createdAt: new Date(),
    });

    return { success: false, error: err.message };
  }
};
