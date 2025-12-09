import { supabase } from "./supabaseClient";

// (1) Hitung total pendapatan platform
export async function getPlatformRevenue() {
  const { data, error } = await supabase.rpc("get_platform_revenue_total");

  if (error) {
    console.error("Gagal hitung pendapatan platform:", error);
    return null;
  }
  return data;
}

// (2) Daftar pendapatan mitra
export async function getMitraSummary(mitraId) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, amount, mitra_receive, platform_fee, created_at")
    .eq("mitra_id", mitraId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal ambil data mitra:", error);
    return [];
  }
  return data;
}

// (3) Daftar order lengkap untuk laporan
export async function getOrderReport() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal ambil laporan order:", error);
    return [];
  }
  return data;
}
