// =============================================================
// PRICING ENTERPRISE ASSISTENKU
// Per Jam - Harian - Mingguan - Bulanan + Lembur + Surge
// =============================================================

export const PRICING = {
  ART: {
    hour: { min: 20600, max: 23400, default: 22000 },
    daily: { min: 149600, max: 170000, default: 160000 },
    weekly: { min: 888000, max: 1010000, default: 950000 },
    monthly: { min: 3740000, max: 4250000, default: 4000000 },
  },

  CAREGIVER: {
    hour: { min: 35000, max: 43000, default: 39000 },
    daily: { min: 250000, max: 310000, default: 280000 },
    weekly: { min: 1500000, max: 1860000, default: 1650000 },
    monthly: { min: 5600000, max: 6900000, default: 6200000 },
  },

  DRIVER: {
    hour: { min: 35000, max: 45000, default: 40000 },
    daily: { min: 250000, max: 320000, default: 290000 },
    weekly: { min: 1500000, max: 1920000, default: 1700000 },
    monthly: { min: 5600000, max: 7000000, default: 6300000 },
  },

  PENJAGA_TOKO: {
    hour: { min: 22000, max: 27000, default: 24500 },
    daily: { min: 160000, max: 190000, default: 175000 },
    weekly: { min: 960000, max: 1140000, default: 1050000 },
    monthly: { min: 4000000, max: 4900000, default: 4500000 },
  },

  LAINNYA: {
    hour: { min: 25000, max: 32000, default: 28500 },
    daily: { min: 180000, max: 220000, default: 200000 },
    weekly: { min: 1080000, max: 1320000, default: 1200000 },
    monthly: { min: 4400000, max: 5500000, default: 5000000 },
  },
};

// =============================================================
// Hitung Semua Biaya (Enterprise)
// =============================================================

export function hitungSemuaBiaya({
  serviceKey,
  paket, // hour / daily / weekly / monthly
  duration = 1,
  lemburHours = 0,
  surgeRate = 1,
}) {
  const svc = PRICING[serviceKey];
  if (!svc) throw new Error("Invalid serviceKey: " + serviceKey);

  const base = svc[paket];
  if (!base) throw new Error(`Tidak ada paket ${paket} untuk ${serviceKey}`);

  // -------------------------------------------------------------
  // HITUNG SUBTOTAL DASAR (PAKET)
  // -------------------------------------------------------------
  const subtotal = base.default * duration;

  // -------------------------------------------------------------
  // HITUNG LEMBUR (PAKAI HARGA PER JAM DEFAULT)
  // -------------------------------------------------------------
  const lemburRate = svc.hour.default;
  const biayaLembur = lemburHours * lemburRate;

  // -------------------------------------------------------------
  // SURGE (Multiplied pada subtotal dasar, bukan lembur)
  // -------------------------------------------------------------
  const surgeAmount = Math.round(subtotal * (surgeRate - 1));

  // -------------------------------------------------------------
  // TOTAL SEBELUM GATEWAY
  // -------------------------------------------------------------
  const beforeGateway = subtotal + biayaLembur + surgeAmount;

  // -------------------------------------------------------------
  // GATEWAY FEE (dibayar customer)
  // 2% dari total jika lebih dari 2% → Customer bayar
  // Jika < 2% → Core yang menanggung (sudah didiskusikan model B)
  // -------------------------------------------------------------
  const gatewayCal = Math.round(beforeGateway * 0.02);
  const gatewayFee = gatewayCal; // customer bayar full 2%

  // -------------------------------------------------------------
  // TOTAL YANG DIBAYAR CUSTOMER
  // -------------------------------------------------------------
  const total = beforeGateway + gatewayFee;

  // -------------------------------------------------------------
  // SPLIT 75% - 25% (Core & Mitra)
  // -------------------------------------------------------------
  const mitraGet = Math.round(beforeGateway * 0.75);
  const coreGet = Math.round(beforeGateway * 0.25);

  return {
    subtotal,
    biayaLembur,
    surgeAmount,
    beforeGateway,
    gatewayFee,
    total,

    mitraGet,
    coreGet,
  };
      }
