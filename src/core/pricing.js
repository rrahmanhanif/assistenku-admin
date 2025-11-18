// src/core/pricing.js

export const PRICING = {
  ART: { unit: "hour", min: 20600, max: 23400, defaultPerHour: 22000 },
  CAREGIVER: { unit: "hour", min: 35000, max: 43000, defaultPerHour: 39000 },
  DRIVER: { unit: "hour", min: 35000, max: 45000, defaultPerHour: 40000 },
  PENJAGA_TOKO: { unit: "hour", min: 22000, max: 27000, defaultPerHour: 24500 },
  LAINNYA: { unit: "hour", min: 25000, max: 32000, defaultPerHour: 28500 },
};

// Hitung biaya lengkap
export function hitungBiaya({ serviceKey, duration }) {
  const s = PRICING[serviceKey];
  if (!s) throw new Error("Unknown serviceKey " + serviceKey);

  const biaya = s.defaultPerHour * duration;
  const platformFee = Math.round(biaya * 0.15);
  const grandTotal = biaya + platformFee;

  return { biaya, platformFee, grandTotal };
}
