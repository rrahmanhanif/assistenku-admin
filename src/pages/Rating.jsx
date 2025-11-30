import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Rating() {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    supabase
      .from("ratings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRatings(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Semua Rating Pesanan</h2>
      {ratings.length === 0 && <p>Tidak ada rating saat ini.</p>}

      <ul>
        {ratings.map((r) => (
          <li key={r.id}>
            Pesanan #{r.order_id} — Customer: {r.customer_id} — Mitra: {r.mitra_id} — ⭐ {r.rating} — "{r.review}"
          </li>
        ))}
      </ul>
    </div>
  );
}
