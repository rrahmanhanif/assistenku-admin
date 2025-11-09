import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "customers"), (snapshot) => {
      setCustomers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h3>Daftar Customer</h3>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>{c.name} - {c.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerList;
