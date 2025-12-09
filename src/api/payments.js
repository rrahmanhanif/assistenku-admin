import { supabase } from "../lib/supabase.js";

export async function handlePaymentCallback(payload) {
  const { order_id, reference, provider, status, amount } = payload;

  const { data, error } = await supabase
    .from("payments")
    .update({
      status,
      provider_reference: reference,
      provider,
      amount
    })
    .eq("order_id", order_id)
    .select()
    .single();

  return { data, error };
}
