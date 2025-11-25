export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("assistenku_admin");
    window.location.href = "/login";
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
