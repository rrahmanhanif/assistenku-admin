import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutButton() {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/login";
      })
      .catch((err) => {
        console.error("Logout gagal:", err);
      });
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
    >
      Logout
    </button>
  );
}
