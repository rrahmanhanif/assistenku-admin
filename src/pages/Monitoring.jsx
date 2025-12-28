import React, { useEffect, useMemo, useRef, useState } from "react";
import MonitoringDashboard from "../components/MonitoringDashboard";
import { fetchMonitoringStatus } from "../services/monitoring";
import Navbar from "../components/Navbar";

export default function Monitoring() {
  const [data, setData] = useState({ partners: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const lastAlerted = useRef([]);

  const services = useMemo(
    () => [
      ...data.partners.map((item) => ({ ...item, type: "Mitra" })),
      ...data.customers.map((item) => ({ ...item, type: "Customer" })),
    ],
    [data]
  );

  const loadData = async (opts = { useMock: false }) => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchMonitoringStatus(opts);
      setData(result);
    } catch (e) {
      setError(e.message || "Gagal memuat data monitoring");

      if (!opts.useMock) {
        try {
          const fallback = await fetchMonitoringStatus({ useMock: true });
          setData(fallback);
        } catch (mockError) {
          console.error("Gagal memuat mock monitoring:", mockError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData({ useMock: true });
  }, []);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  useEffect(() => {
    const downServices = services.filter((s) => s.status === "down");
    const ids = downServices.map((s) => s.id).sort();
    const lastIds = lastAlerted.current.join(",");
    const newIds = ids.join(",");

    if (downServices.length && newIds !== lastIds) {
      alert(
        `Ada layanan down: ${downServices
          .map((s) => `${s.name} (${s.type})`)
          .join(", ")}`
      );
      lastAlerted.current = ids;
    }
  }, [services]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-6">
        <MonitoringDashboard
          data={data}
          loading={loading}
          error={error}
          onRetry={() => loadData()}
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
