import { supabase } from "../lib/supabaseClient";

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  return data;
}
