// src/components/MapMonitor.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix untuk leaflet icon (Vercel tidak otomatis load icon)
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapMonitor = () => {
  const [mitraData, setMitraData] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    const unsubMitra = onSnapshot(collection(db, "mitraGPS"), (snapshot) => {
      setMitraData(snapshot.docs.map((doc) => doc.data()));
    });
    const unsubCustomer = onSnapshot(collection(db, "customerGPS"), (snapshot) => {
      setCustomerData(snapshot.docs.map((doc) => doc.data()));
    });
    return () => {
      unsubMitra();
      unsubCustomer();
    };
  }, []);

  return (
    <div className="map-container">
      <MapContainer
        center={[-6.2, 106.8]}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mitraData.map((mitra, idx) => (
          <Marker key={`mitra-${idx}`} position={[mitra.lat, mitra.lng]}>
            <Popup>Mitra: {mitra.name}</Popup>
          </Marker>
        ))}
        {customerData.map((cust, idx) => (
          <Marker key={`cust-${idx}`} position={[cust.lat, cust.lng]}>
            <Popup>Customer: {cust.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapMonitor;
