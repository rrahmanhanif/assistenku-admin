// src/lib/adminLocation.js
import { supabase } from "./supabase";

export function subscribeAllMitraLocation(callback) {
  return supabase
    .channel("admin-mitra-location")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "mitra_location",
      },
      (data) => callback(data.new)
    )
    .subscribe();
}
