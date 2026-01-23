import { collection, getDocs } from "firebase/firestore";
import { logError } from "../core/logger";
import { db } from "../firebase";
import { supabase } from "../lib/supabaseClient";
import { env } from "../../config/env";
import { endpoints } from "./http/endpoints";
import { httpClient } from "./http/httpClient";

type CustomerRecord = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  source: "firestore" | "api";
};

type CustomerMetric = {
  totalOrders: number;
  totalSpending: number;
  lastOrderAt?: string | null;
};

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, location: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_ATTEMPTS) {
        await wait(RETRY_DELAY * attempt);
      }
    }
  }

  logError(lastError, location);
  throw lastError;
}

function normalizeCustomer(raw: any, source: CustomerRecord["source"]): CustomerRecord {
  return {
    id: String(raw?.id || raw?.uid || ""),
    name: String(raw?.name || raw?.full_name || raw?.nama || "-"),
    email: raw?.email ? String(raw.email) : undefined,
    phone: raw?.phone ? String(raw.phone) : raw?.phone_number ? String(raw.phone_number) : undefined,
    status: raw?.status ? String(raw.status) : undefined,
    source,
  };
}

function buildAuthHeaders() {
  // Tetap gunakan implementasi existing Anda (jika ada) — fungsi ini tidak ditampilkan pada diff.
  // Jika di file Anda sudah ada buildAuthHeaders(), hapus stub ini.
  return {};
}

function normalizeCustomerMetric(orderRows: any[]): CustomerMetric {
  return orderRows.reduce(
    (acc, row) => {
      acc.totalOrders += 1;
      acc.totalSpending += Number(row.amount || 0);

      if (row.created_at) {
        const time = new Date(row.created_at).toISOString();
        acc.lastOrderAt = acc.lastOrderAt
          ? new Date(acc.lastOrderAt) > new Date(time)
            ? acc.lastOrderAt
            : time
          : time;
      }

      return acc;
    },
    { totalOrders: 0, totalSpending: 0, lastOrderAt: null as string | null }
  );
}

async function fetchCustomerApi(): Promise<CustomerRecord[]> {
  if (!env.customerApiUrl) return [];

  return withRetry(async () => {
    const { data: payload } = await httpClient.request({
      endpoint: endpoints.customer.list,
      baseUrl: env.customerApiUrl,
      includeAuth: false,
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
    });

    const list = Array.isArray((payload as any)?.data) ? (payload as any).data : payload;

    if (!Array.isArray(list)) return [];

    return list.map((item) => normalizeCustomer(item, "api"));
  }, "CustomerClient.fetchCustomerApi");
}

async function fetchCustomerFirestore(): Promise<CustomerRecord[]> {
  return withRetry(async () => {
    const snapshot = await getDocs(collection(db, "customers"));
    return snapshot.docs.map((docSnap) =>
      normalizeCustomer({ id: docSnap.id, ...docSnap.data() }, "firestore")
    );
  }, "CustomerClient.fetchCustomerFirestore");
}

// ====== LANJUTAN FILE ANDA DI BAWAH INI ======
// Tempelkan sisa isi file asli Anda mulai dari `async function fetchCustomerMetrics(...)` dst,
// atau kirim sisa diff agar saya bersihkan full file tanpa stub.
