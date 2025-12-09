import { supabase } from "./supabaseClient";

export async function updatePaymentStatus(orderId, newStatus = "paid") {
  const { error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      updated_at: new Date()
    })
    .eq("id", orderId);

  return { error };
}

export async function fetchOrdersWaitingPayment() {
  return await supabase
    .from("orders")
    .select("*")
    .eq("status", "waiting_payment")
    .order("created_at", { ascending: false });
}
