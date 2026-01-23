import { collection, getDocs } from "firebase/firestore";
import { logError } from "../core/logger";
import { db } from "../firebase";
import { supabase } from "../lib/supabaseClient";
import { env } from "../../config/env";
import { endpoints } from "./http/endpoints";
import { httpClient } from "./http/httpClient";

type PartnerSource = "firestore" | "supabase" | "api";

type PartnerRecord = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  joinedAt?: string | null;
  source: PartnerSource;
};

type PartnerMetric = {
  totalOrders: number;
  totalSpending: number;
  totalMitraRevenue: number;
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
      logError(error, `${location}#${attempt}`);

      if (attempt < RETRY_ATTEMPTS) {
        await wait(RETRY_DELAY * attempt);
      }
    }
  }

  throw lastError;
}

const buildAuthHeaders = () =>
  env.serviceApiKey
    ? {
        Authorization: `Bearer ${env.serviceApiKey}`,
      }
    : {};

function normalizePartner(partner: Record<string, any>, source: PartnerSource): PartnerRecord {
  return {
    id: String(partner.id || partner.uid || partner.mitra_id || "unknown"),
    name: String(
      partner.name || partner.full_name || partner.fullName || partner.nama || "Tanpa Nama"
    ),
    email: partner.email ? String(partner.email) : partner.contact_email ? String(partner.contact_email) : undefined,
    phone: partner.phone ? String(partner.phone) : partner.phone_number ? String(partner.phone_number) : undefined,
    status: partner.status ? String(partner.status) : partner.availability ? String(partner.availability) : "offline",
    joinedAt: partner.joined_at || partner.created_at || partner.createdAt || partner.updatedAt || null,
    source,
  };
}

function normalizePartnerMetric(orderRows: any[] = []): PartnerMetric {
  return orderRows.reduce(
    (acc, row) => {
      acc.totalOrders += 1;
      acc.totalSpending += Number(row.amount || 0);
      acc.totalMitraRevenue += Number(row.mitra_receive || 0);

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
    {
      totalOrders: 0,
      totalSpending: 0,
      totalMitraRevenue: 0,
      lastOrderAt: null as string | null,
    }
  );
}

async function fetchPartnerApi(): Promise<PartnerRecord[]> {
  if (!env.partnerApiUrl) return [];

  return withRetry(async () => {
    const { data: payload } = await httpClient.request({
      endpoint: endpoints.partner.list,
      baseUrl: env.partnerApiUrl,
      includeAuth: false,
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
    });

    const list = Array.isArray((payload as any)?.data) ? (payload as any).data : payload;

    if (!Array.isArray(list)) return [];

    return list.map((item) => normalizePartner(item, "api"));
  }, "PartnerClient.fetchPartnerApi");
}

async function fetchPartnerFirestore(): Promise<PartnerRecord[]> {
  return withRetry(async () => {
    const snapshot = await getDocs(collection(db, "mitra"));
    return snapshot.docs.map((docSnap) =>
      normalizePartner({ id: docSnap.id, ...docSnap.data() }, "firestore")
    );
  }, "PartnerClient.fetchPartnerFirestore");
}

async function fetchOrderMetrics(mitraIds: string[]): Promise<Record<string, PartnerMetric>> {
  if (!mitraIds.length) return {};

  return withRetry(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("mitra_id, amount, mitra_receive, status, created_at")
      .in("mitra_id", mitraIds);

    if (error) throw error;

    const grouped: Record<string, any[]> = {};
    data?.forEach((row) => {
      if (!row.mitra_id) return;
      grouped[row.mitra_id] = grouped[row.mitra_id] ? [...grouped[row.mitra_id], row] : [row];
    });

    return Object.entries(grouped).reduce((acc, [mitraId, rows]) => {
      acc[mitraId] = normalizePartnerMetric(rows);
      return acc;
    }, {} as Record<string, PartnerMetric>);
  }, "PartnerClient.fetchOrderMetrics");
}

export async function fetchPartnersWithAnalytics() {
  const [firestorePartners, apiPartners] = await Promise.all([
    fetchPartnerFirestore(),
    fetchPartnerApi(),
  ]);

  const combined = [...firestorePartners, ...apiPartners];

  const unique = combined.reduce<Record<string, PartnerRecord>>((acc, partner) => {
    acc[partner.id] = partner;
    return acc;
  }, {});

  const metrics = await fetchOrderMetrics(Object.keys(unique));

  return Object.values(unique).map((partner) => ({
    ...partner,
    analytics: metrics[partner.id] || {
      totalOrders: 0,
      totalSpending: 0,
      totalMitraRevenue: 0,
      lastOrderAt: null,
    },
  }));
}
