import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

// Hitung total pendapatan Core per hari
export async function getCoreRevenueDaily() {
  const transCol = collection(db, "transactions");
  const q = query(transCol, where("status", "==", "success"));
  const snap = await getDocs(q);

  const revenueMap = {};
  snap.forEach((doc) => {
    const data = doc.data();
    const date = new Date(data.date).toLocaleDateString("id-ID");
    const coreGain = data.total * 0.25;
    if (!revenueMap[date]) revenueMap[date] = 0;
    revenueMap[date] += coreGain;
  });

  return Object.entries(revenueMap).map(([date, value]) => ({
    date,
    value,
  }));
}

// Hitung total mitra aktif
export async function getMitraActivity() {
  const mitraCol = collection(db, "mitra");
  const snap = await getDocs(mitraCol);
  let active = 0,
    total = 0;
  snap.forEach((doc) => {
    const d = doc.data();
    total++;
    if (d.status === "online") active++;
  });
  return { active, total };
}
