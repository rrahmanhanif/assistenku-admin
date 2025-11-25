import { onValue, ref } from "firebase/database";
import { db } from "../../firebase";

export const useOrdersListener = (callback) => {
  onValue(ref(db, "orders"), (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
};
