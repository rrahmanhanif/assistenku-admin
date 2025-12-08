// src/lib/adminRealtime.js
import { supabase } from "./supabase";

export function subscribeAllOrders(callback) {
  return supabase
    .channel("admin-orders")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders" },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
