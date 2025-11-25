import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../../firebase";

export function useOrdersListener() {
  const [orders, setOrders] = useState({});
  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const callback = (snap) => setOrders(snap.val() || {});
    onValue(ordersRef, callback);
    return () => { off(ordersRef); };
  }, []);
  return orders;
}
