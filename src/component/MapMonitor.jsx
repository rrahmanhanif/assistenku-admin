import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
      <MapContainer center={[-6.2, 106.8]} zoom={12} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mitraData.map((mitra, idx) => (
          <Marker key={idx} position={[mitra.lat, mitra.lng]}>
            <Popup>Mitra: {mitra.name}</Popup>
          </Marker>
        ))}
        {customerData.map((cust, idx) => (
          <Marker key={idx} position={[cust.lat, cust.lng]}>
            <Popup>Customer: {cust.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapMonitor;
