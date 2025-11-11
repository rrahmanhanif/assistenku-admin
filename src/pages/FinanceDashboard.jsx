import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FinanceSummary from "../components/FinanceSummary";
import ChartsDashboard from "../components/ChartsDashboard";

const FinanceDashboard = () => {
  const [totalMitra, setTotalMitra] = useState(0);
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const unsubTransactions = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const transactions = snapshot.docs.map((doc) => doc.data());
      const total = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
      setTotalRevenue(total);

      const daily = {};
      transactions.forEach((t) => {
        const day = new Date(t.date).toLocaleDateString("id-ID", { weekday: "short" });
        daily[day] = (daily[day] || 0) + (t.amount || 0);
      });
      setChartData(Object.keys(daily).map((d) => ({ day: d, revenue: daily[d] })));
    });

    const unsubMitra = onSnapshot(collection(db, "mitra"), (snap) => {
      let total = 0;
      snap.docs.forEach((d) => (total += d.data().balance || 0));
      setTotalMitra(total);
    });

    const unsubCustomer = onSnapshot(collection(db, "customer"), (snap) => {
      let total = 0;
      snap.docs.forEach((d) => (total += d.data().balance || 0));
      setTotalCustomer(total);
    });

    const unsubWithdraw = onSnapshot(collection(db, "withdrawRequests"), (snap) => {
      let total = 0;
      snap.docs.forEach((d) => (total += d.data().amount || 0));
      setTotalWithdraw(total);
    });

    return () => {
      unsubTransactions();
      unsubMitra();
      unsubCustomer();
      unsubWithdraw();
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Dashboard Keuangan</h1>
        <p className="text-gray-500">Laporan transaksi dan saldo Mitra & Customer</p>
      </header>

      <FinanceSummary
        totalMitra={totalMitra}
        totalCustomer={totalCustomer}
        totalRevenue={totalRevenue}
        totalWithdraw={totalWithdraw}
      />

      <ChartsDashboard data={chartData} />
    </div>
  );
};

export default FinanceDashboard;
