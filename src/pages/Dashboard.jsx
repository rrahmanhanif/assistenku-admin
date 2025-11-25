import CardStat from "../components/CardStat";

export default function Dashboard({ onLogout }) {
  return (
    <div className="ml-64 p-8">

      {/* Bar atas */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStat title="Total Customers" value="0" />
        <CardStat title="Total Mitra" value="0" />
        <CardStat title="Order Hari Ini" value="0" />
      </div>
    </div>
  );
}
