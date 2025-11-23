export default function Topbar() {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-700">
        Admin Panel
      </h2>

      <div className="flex items-center gap-3">
        <img
          src="/admin.png"
          className="w-10 h-10 rounded-full"
          alt="admin"
        />
        <span className="font-medium">Admin</span>
      </div>
    </div>
  );
}
