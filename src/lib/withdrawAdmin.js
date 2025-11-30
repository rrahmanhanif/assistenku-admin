import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function approveWithdraw(reqId) {
  return await supabase.rpc("approve_withdraw", { req_id: reqId });
}
