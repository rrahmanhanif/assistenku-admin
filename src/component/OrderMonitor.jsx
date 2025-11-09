import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const OrdersMonitor = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    await updateDoc(doc(db, "orders", orderId), { status });
  };

  return (
    <div>
      <h3>📦 Daftar Order</h3>
      {orders.length === 0 ? (
        <p>Tidak ada order aktif.</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="order-card">
            <p><b>ID:</b> {o.orderId}</p>
            <p><b>Layanan:</b> {o.serviceType}</p>
            <p><b>Customer:</b> {o.customerId}</p>
            <p><b>Mitra:</b> {o.mitraId}</p>
            <p><b>Harga:</b> Rp{o.price}</p>
            <p><b>Status:</b> {o.status}</p>

            <select
              value={o.status}
              onChange={(e) => handleStatusChange(o.id, e.target.value)}
            >
              <option value="Menunggu">Menunggu</option>
              <option value="Diterima">Diterima</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersMonitor;
