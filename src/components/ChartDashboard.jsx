import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ChartsDashboard = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Grafik Pendapatan Mingguan</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
          <CartesianGrid stroke="#e5e7eb" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartsDashboard;
