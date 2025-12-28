// src/services/monitoring.js
// Service untuk mengambil data status layanan mitra & customer

const BASE_URL = import.meta.env.VITE_MONITORING_API_URL;

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Gagal mengambil data dari ${url}`);
  }
  return response.json();
}

function buildMockData() {
  const now = new Date();
  const isoNow = now.toISOString();

  return {
    partners: [
      {
        id: "mitra-1",
        name: "Mitra Jakarta",
        status: "healthy",
        uptime: 99.92,
        latency: 180,
        lastDowntime: isoNow,
      },
      {
        id: "mitra-2",
        name: "Mitra Bandung",
        status: "degraded",
        uptime: 98.4,
        latency: 460,
        lastDowntime: isoNow,
      },
    ],
    customers: [
      {
        id: "cust-1",
        name: "Customer App - Android",
        status: "healthy",
        uptime: 99.8,
        latency: 210,
        lastDowntime: isoNow,
      },
      {
        id: "cust-2",
        name: "Customer App - iOS",
        status: "down",
        uptime: 95.1,
        latency: 0,
        lastDowntime: isoNow,
      },
    ],
  };
}

export async function fetchMonitoringStatus({ signal, useMock = false } = {}) {
  if (useMock || !BASE_URL) {
    return buildMockData();
  }

  const partnerEndpoint = `${BASE_URL}/partners/status`;
  const customerEndpoint = `${BASE_URL}/customers/status`;

  const [partners, customers] = await Promise.all([
    fetchJson(partnerEndpoint, { signal }),
    fetchJson(customerEndpoint, { signal }),
  ]);

  return { partners, customers };
}
