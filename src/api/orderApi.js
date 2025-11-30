import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function createOrder(customerId, customerName, serviceType, notes) {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_id: customerId,
        customer_name: customerName,
        service_type: serviceType,
        notes: notes,
        status: "waiting", // menunggu admin assign
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error };
}
