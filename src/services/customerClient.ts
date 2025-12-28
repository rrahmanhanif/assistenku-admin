import { collection, getDocs } from "firebase/firestore";
import { logError } from "../core/logger";
import { db } from "../firebase";
import { supabase } from "../lib/supabaseClient";
import { env } from "../../config/env";

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

async function withRetry<T>(
  fn: () => Promise<T>,
  location: string
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
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

function normalizeCustomer(
  customer: Record<string, any>,
  source: "firestore" | "api"
): CustomerRecord {
  return {
    id: customer.id || customer.uid || customer.customer_id || "unknown",
    name:
      customer.name ||
      customer.full_name ||
      customer.fullName ||
      "Tanpa Nama",
    email: customer.email || customer.contact_email,
    phone: customer.phone || customer.phone_number,
    status: customer.status || customer.tier || "active",
    source,
  };
}

function normalizeCustomerMetric(
  orderRows: any[] = []
): CustomerMetric {
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
    { totalOrders: 0, totalSpending: 0, lastOrderAt: null }
  );
}

async function fetchCustomerApi(): Promise<CustomerRecord[]> {
  if (!env.customerApiUrl) return [];

  return withRetry(async () => {
    const res = await fetch(`${env.customerApiUrl}/customers`, {
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(
        `Gagal memuat data customer API (${res.status})`
      );
    }

    const payload = await res.json();
    const list = Array.isArray(payload?.data)
      ? payload.data
      : payload;

    if (!Array.isArray(list)) return [];

    return list.map((item) => normalizeCustomer(item, "api"));
  }, "CustomerClient.fetchCustomerApi");
}

async function fetchCustomerFirestore(): Promise<CustomerRecord[]> {
  return withRetry(async () => {
    const snapshot = await getDocs(collection(db, "customers"));
    return snapshot.docs.map((doc) =>
      normalizeCustomer({ id: doc.id, ...doc.data() }, "firestore")
    );
  }, "CustomerClient.fetchCustomerFirestore");
}

async function fetchCustomerMetrics(
  customerIds: string[]
): Promise<Record<string, CustomerMetric>> {
  if (!customerIds.length) return {};

  return withRetry(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("customer_id, amount, created_at")
      .in("customer_id", customerIds);

    if (error) throw error;

    const grouped: Record<string, any[]> = {};

    data?.forEach((row) => {
      if (!row.customer_id) return;
      grouped[row.customer_id] = grouped[row.customer_id]
        ? [...grouped[row.customer_id], row]
        : [row];
    });

    return Object.entries(grouped).reduce(
      (acc, [customerId, rows]) => {
        acc[customerId] = normalizeCustomerMetric(rows);
        return acc;
      },
      {} as Record<string, CustomerMetric>
    );
  }, "CustomerClient.fetchCustomerMetrics");
}

export async function fetchCustomersWithAnalytics() {
  const [firestoreCustomers, apiCustomers] = await Promise.all([
    fetchCustomerFirestore(),
    fetchCustomerApi(),
  ]);

  const combined = [...firestoreCustomers, ...apiCustomers];

  const unique = combined.reduce<Record<string, CustomerRecord>>(
    (acc, customer) => {
      acc[customer.id] = customer;
      return acc;
    },
    {}
  );

  const metrics = await fetchCustomerMetrics(Object.keys(unique));

  return Object.values(unique).map((customer) => ({
    ...customer,
    analytics: metrics[customer.id] || {
      totalOrders: 0,
      totalSpending: 0,
      lastOrderAt: null,
    },
  }));
}
