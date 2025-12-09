import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function adminGetAllRatings() {
  const { data, error } = await supabaseAdmin
    .from("ratings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
