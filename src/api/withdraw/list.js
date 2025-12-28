import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestBuckets = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = requestBuckets.get(ip) || { start: now, count: 0 };

  if (now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    bucket.start = now;
    bucket.count = 0;
  }

  bucket.count += 1;
  requestBuckets.set(ip, bucket);

  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req, res) {
  const ip = getClientIp(req);
  console.info(`[withdraw/list] Incoming ${req.method} from ${ip}`);

  if (req.method !== "GET") {
    console.warn(`[withdraw/list] Blocked non-GET request from ${ip}`);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (isRateLimited(ip)) {
    console.warn(`[withdraw/list] Rate limit exceeded for ${ip}`);
    return res.status(429).json({ error: "Too Many Requests" });
  }

  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[withdraw/list] Error for ${ip}:`, error);
    return res.status(500).json({ error: error.message });
  }

  console.info(`[withdraw/list] Responded ${data?.length ?? 0} rows to ${ip}`);
  return res.status(200).json(data);
}
