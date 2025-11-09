import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

export default function PopupNotify({ uid, role }) {
  const [notif, setNotif] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", uid),
      where("role", "==", role),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotif(data);
    });
    return () => unsub();
  }, [uid, role]);

  return (
    <div className="fixed bottom-5 right-5 space-y-2 z-50">
      {notif.slice(0, 3).map((n) => (
        <div
          key={n.id}
          className="bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-bounce"
        >
          <p className="font-semibold">{n.type}</p>
          <p>{n.text}</p>
        </div>
      ))}
    </div>
  );
}
