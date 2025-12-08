import React, { useState, useEffect } from "react";
import { subscribeAllMitraLocation } from "../lib/adminLocation";

export default function LiveMap() {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const sub = subscribeAllMitraLocation((loc) => {
      setLocations((prev) => ({
        ...prev,
        [loc.mitra_id]: loc,
      }));
    });

    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Live GPS Mitra</h2>
      {Object.values(locations).map((loc) => (
        <p key={loc.mitra_id}>
          Mitra {loc.mitra_id}: {loc.lat}, {loc.lng}
        </p>
      ))}
    </div>
  );
}
