import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const MitraList = () => {
  const [mitras, setMitras] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mitra"), (snapshot) => {
      setMitras(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h3>Daftar Mitra</h3>
      <ul>
        {mitras.map((m) => (
          <li key={m.id}>{m.name} - {m.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default MitraList;
