import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./libs/firebaseAuth";
import { syncAdminToSupabase } from "./libs/adminBridge";
import { isAdmin } from "./utils/adminGuard";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await syncAdminToSupabase();
    const admin = await isAdmin(user.uid);

    if (!admin) {
      alert("Akses ditolak. Anda bukan admin.");
      window.location.href = "/login";
    }
  }
});
