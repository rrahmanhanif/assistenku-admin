import React, { useMemo } from "react";

function StatusBadge({ status }) {
  const color =
    {
      healthy: "bg-green-100 text-green-700",
      degraded: "bg-yellow-100 text-yellow-700",
      down: "bg-red-100 text-red-700",
    }[status] || "bg-gray-100 text-gray-700";

  const label =
    {
      healthy: "Normal",
      degraded: "Terganggu",
      down: "Down",
    }[status] || status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function SummaryCard({ title, value, subtitle, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
      <span
        className={`text-xs font-medium px-2 py-1 rounded ${
          toneMap[tone] || toneMap.blue
        }`}
      >
        {subtitle}
      </span>
    </div>
  );
}

export default function MonitoringDashboard({
  data,
  loading,
  error,
  onRetry,
  filter,
  onFilterChange,
  search,
  onSearchChange,
}) {
  const { partners = [], customers = [] } = data || {};

  const safeFilter = filter || "all";
  const safeSearch = (search || "").toLowerCase();

  const services = useMemo(
    () => [
      ...partners.map((item) => ({ ...item, type: "Mitra" })),
      ...customers.map((item) => ({ ...item, type: "Customer" })),
    ],
    [partners, customers]
  );

  const filtered = useMemo(
    () =>
      services.filter((service) => {
        const matchesStatus =
          safeFilter === "all" || service.status === safeFilter;
        const matchesKeyword = String(service.name || "")
          .toLowerCase()
          .includes(safeSearch);
        return matchesStatus && matchesKeyword;
      }),
    [services, safeFilter, safeSearch]
  );

  const summary = useMemo(() => {
    const healthy = services.filter((s) => s.status === "healthy").length;
    const degraded = services.filter((s) => s.status === "degraded").length;
    const down = services.filter((s) => s.status === "down").length;

    const avgUptime = services.length
      ? (
          services.reduce((acc, s) => acc + (Number(s.uptime) || 0), 0) /
          services.length
        ).toFixed(2)
      : "0";

    return { healthy, degraded, down, avgUptime };
  }, [services]);

  const uptimeBars = useMemo(
    () =>
      services.map((service) => ({
        id: service.id,
        name: service.name,
        uptime: Number(service.uptime) || 0,
        status: service.status,
      })),
    [services]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Monitoring</h1>
          <p className="text-gray-500 mt-1">
            Pantau status layanan mitra & customer secara real-time.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={safeFilter}
            onChange={(e) => onFilterChange?.(e.target.value)}
          >
            <option value="all">Semua status</option>
            <option value="healthy">Normal</option>
            <option value="degraded">Terganggu</option>
            <option value="down">Down</option>
          </select>

          <input
            type="text"
            placeholder="Cari layanan"
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={search || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />

          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Terjadi kesalahan</p>
            <button
              onClick={onRetry}
              className="text-sm underline font-medium hover:text-red-800"
            >
              Coba lagi
            </button>
          </div>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Layanan Normal"
          value={summary.healthy}
          subtitle="Berjalan tanpa gangguan"
          tone="green"
        />
        <SummaryCard
          title="Sedang Terganggu"
          value={summary.degraded}
          subtitle="Perlu investigasi"
          tone="yellow"
        />
        <SummaryCard
          title="Down"
          value={summary.down}
          subtitle="Kritikal"
          tone="red"
        />
        <SummaryCard
          title="Rata-rata Uptime"
          value={`${summary.avgUptime}%`}
          subtitle="24 jam terakhir"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Snapshot Uptime
        </h2>

        <div className="space-y-3">
          {uptimeBars.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium text-gray-800">{item.name}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span>{item.uptime}%</span>
                </div>
              </div>

              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.status === "down"
                      ? "bg-red-500"
                      : item.status === "degraded"
                        ? "bg-yellow-400"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(item.uptime, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Detail Layanan
          </h2>
          <p className="text-sm text-gray-500">
            {filtered.length} layanan ditampilkan
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Memuat data monitoring...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-gray-400">
                      {service.type}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {service.name}
                    </h3>
                  </div>
                  <StatusBadge status={service.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <p className="text-xs text-gray-400">Uptime</p>
                    <p className="font-medium">{service.uptime ?? "-"}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Latency</p>
                    <p className="font-medium">
                      {service.latency ? `${service.latency} ms` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Downtime Terakhir</p>
                    <p className="font-medium">
                      {service.lastDowntime
                        ? new Date(service.lastDowntime).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ID</p>
                    <p className="font-medium">{service.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
