import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex w-full h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
