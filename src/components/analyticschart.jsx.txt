import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getCoreRevenueDaily } from "../services/analytics";

export default function AnalyticsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await getCoreRevenueDaily();
      setData(result);
    })();
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4 w-full h-72">
      <h3 className="font-bold text-lg mb-3">Pendapatan Harian Core</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(val) => `Rp ${val.toLocaleString()}`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
