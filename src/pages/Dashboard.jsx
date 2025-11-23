import CardStat from "../components/CardStat";

export default function Dashboard() {
  return (
    <div className="ml-64 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStat title="Total Customers" value="0" />
        <CardStat title="Total Mitra" value="0" />
        <CardStat title="Order Hari Ini" value="0" />
      </div>
    </div>
  );
}
