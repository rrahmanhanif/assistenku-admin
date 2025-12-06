import { supabase } from "../libs/supabaseClient";

export async function isAdmin(uid) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .single();

  return data?.role === "admin";
}
