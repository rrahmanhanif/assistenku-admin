import { getDatabase, push, ref } from "firebase/database";

export function logError(error, location = "unknown") {
  const db = getDatabase();
  const logsRef = ref(db, "error_logs");

  push(logsRef, {
    message: error?.message || String(error),
    location,
    timestamp: Date.now(),
  });
}
