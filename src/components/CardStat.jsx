export default function CardStat({ title, value }) {
  return (
    <div className="p-5 bg-white shadow rounded-xl">
      <p className="text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
