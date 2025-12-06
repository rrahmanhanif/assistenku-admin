import { supabase } from "./supabaseClient";
import { auth } from "./firebaseAuth";

export async function syncAdminToSupabase() {
  const user = auth.currentUser;
  if (!user) return;

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.uid)
    .single();

  // Jika sudah ada, selesai
  if (existing) return;

  // 1. Insert ke tabel users
  await supabase.from("users").insert({
    id: user.uid,
    fullname: user.displayName || "Admin",
    email: user.email,
    created_at: new Date(),
  });

  // 2. Tambahkan role admin
  await supabase.from("user_roles").insert({
    user_id: user.uid,
    role: "admin",
  });

  console.log("Admin berhasil disinkronkan ke Supabase");
}
