import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export const startCustomerGPS = async (custId, custName) => {
  if (!navigator.geolocation) {
    alert("Perangkat tidak mendukung GPS");
    return;
  }

  // Update posisi setiap 10 detik
  navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await setDoc(
        doc(db, "customerGPS", custId),
        {
          name: custName,
          lat: latitude,
          lng: longitude,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`Customer ${custName} update lokasi:`, latitude, longitude);
    },
    (err) => console.error("GPS Error:", err),
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
  );
};
