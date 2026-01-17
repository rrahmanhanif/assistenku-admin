import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGet, adminPost } from "../lib/adminApi.js";
import { enforceAdminSession, logoutAdmin } from "../lib/adminAuth.js";
import { getAdminSession } from "../lib/adminSession.js";

const STATUS_FIELDS = ["status", "state", "verificationStatus", "orderStatus", "paymentStatus"];
const SERVICE_FIELDS = ["service", "serviceName", "serviceType", "serviceId", "serviceCode"];
const MITRA_ID_FIELDS = ["id", "mitraId", "partnerId", "uid"];

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getStatusValue(row) {
  for (const field of STATUS_FIELDS) {
    if (row?.[field]) return String(row[field]);
  }
  return "";
}

function getServiceValue(row) {
  for (const field of SERVICE_FIELDS) {
    if (row?.[field]) return String(row[field]);
  }
  return "";
}

function resolveMitraId(row) {
  for (const field of MITRA_ID_FIELDS) {
    if (row?.[field]) return row[field];
  }
  return null;
}

function formatCell(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DataTable({ rows, renderAction }) {
  if (!rows.length) {
    return <div style={{ fontSize: 13, opacity: 0.7 }}>Belum ada data.</div>;
  }

  const columns = Object.keys(rows[0] || {});
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.08)" }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  fontWeight: 700
                }}
              >
                {col}
              </th>
            ))}
            {renderAction && (
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  fontWeight: 700
                }}
              >
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row?.id || row?.uid || idx}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              {columns.map((col) => (
                <td key={col} style={{ padding: "10px 12px", verticalAlign: "top" }}>
                  {formatCell(row?.[col])}
                </td>
              ))}
              {renderAction && <td style={{ padding: "10px 12px" }}>{renderAction(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({ title, description, onRefresh, loading }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
        {description && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{description}</div>}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          background: "rgba(255,255,255,0.12)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "8px 12px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 700
        }}
      >
        {loading ? "Memuat..." : "Refresh"}
      </button>
    </div>
  );
}

function StatusFilter({ rows, value, onChange }) {
  const options = useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      const status = getStatusValue(row);
      if (status) set.add(status);
    });
    return Array.from(set);
  }, [rows]);

  if (!options.length) return null;

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 12
      }}
    >
      <option value="">Semua Status</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function ServiceFilter({ rows, value, onChange }) {
  const options = useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      const service = getServiceValue(row);
      if (service) set.add(service);
    });
    return Array.from(set);
  }, [rows]);

  if (!options.length) return null;

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 12
      }}
    >
      <option value="">Semua Layanan</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const session = getAdminSession();

  const [servicesState, setServicesState] = useState({ status: "idle", items: [], error: "" });
  const [pricingState, setPricingState] = useState({ status: "idle", items: [], error: "" });
  const [ordersState, setOrdersState] = useState({ status: "idle", items: [], error: "" });
  const [ledgerState, setLedgerState] = useState({ status: "idle", items: [], error: "" });
  const [auditState, setAuditState] = useState({ status: "idle", items: [], error: "" });
  const [mitraState, setMitraState] = useState({ status: "idle", items: [], error: "" });

  const [servicePayload, setServicePayload] = useState("{");
  const [pricingPayload, setPricingPayload] = useState("{");
  const [serviceFilter, setServiceFilter] = useState("");
  const [pricingFilter, setPricingFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [orderServiceFilter, setOrderServiceFilter] = useState("");
  const [ledgerFilter, setLedgerFilter] = useState("");
  const [auditFilter, setAuditFilter] = useState("");
  const [mitraFilter, setMitraFilter] = useState("");

  useEffect(() => {
    (async () => {
      const ok = await enforceAdminSession();
      if (!ok) {
        nav("/admin-login");
        return;
      }
      await loadAll();
    })();
  }, [nav]);

  async function loadList(path, setter) {
    setter((prev) => ({ ...prev, status: "loading", error: "" }));
    try {
      const data = await adminGet(path);
      setter({ status: "success", items: extractList(data), error: "" });
    } catch (error) {
      setter({ status: "error", items: [], error: error?.message || "Gagal memuat data." });
    }
  }

  async function loadAll() {
    await Promise.all([
      loadList("/assistenku/admin/services", setServicesState),
      loadList("/assistenku/admin/pricing", setPricingState),
      loadList("/assistenku/admin/orders", setOrdersState),
      loadList("/assistenku/admin/ledger", setLedgerState),
      loadList("/assistenku/admin/audit", setAuditState),
      loadList("/assistenku/admin/mitra", setMitraState)
    ]);
  }

  async function handleCreate(path, payload, setter) {
    try {
      const parsed = JSON.parse(payload || "{}");
      setter((prev) => ({ ...prev, status: "loading", error: "" }));
      await adminPost(path, parsed);
      await loadList(path, setter);
    } catch (error) {
      setter((prev) => ({
        ...prev,
        status: "error",
        error: error?.message || "Gagal membuat data."
      }));
    }
  }

  async function handleToggleMitra(row) {
    const mitraId = resolveMitraId(row);
    if (!mitraId) {
      setMitraState((prev) => ({ ...prev, error: "ID mitra tidak ditemukan pada data." }));
      return;
    }

    const currentStatus = String(getStatusValue(row) || "").toUpperCase();
    const nextStatus = currentStatus === "VERIFIED" ? "BLOCKED" : "VERIFIED";

    try {
      setMitraState((prev) => ({ ...prev, status: "loading", error: "" }));
      await adminPost("/assistenku/admin/verify-mitra", { id: mitraId, status: nextStatus });
      await loadList("/assistenku/admin/mitra", setMitraState);
    } catch (error) {
      setMitraState((prev) => ({
        ...prev,
        status: "error",
        error: error?.message || "Gagal memperbarui status mitra."
      }));
    }
  }

  function applyStatusFilter(items, filter) {
    if (!filter) return items;
    return items.filter((row) => getStatusValue(row) === filter);
  }

  function applyServiceFilter(items, filter) {
    if (!filter) return items;
    return items.filter((row) => getServiceValue(row) === filter);
  }

  const filteredServices = applyStatusFilter(servicesState.items, serviceFilter);
  const filteredPricing = applyStatusFilter(pricingState.items, pricingFilter);
  const filteredOrders = applyServiceFilter(
    applyStatusFilter(ordersState.items, orderFilter),
    orderServiceFilter
  );
  const filteredLedger = applyStatusFilter(ledgerState.items, ledgerFilter);
  const filteredAudit = applyStatusFilter(auditState.items, auditFilter);
  const filteredMitra = applyStatusFilter(mitraState.items, mitraFilter);

  return (
    <div style={{ minHeight: "100vh", background: "#061a4a", padding: 18, color: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Control Center Assistenku</div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>Admin: {session?.email || "-"}</div>
          </div>

          <button
            onClick={async () => {
              await logoutAdmin();
              nav("/admin-login");
            }}
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "10px 12px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Service Management"
              description="Kelola layanan utama Assistenku."
              onRefresh={() => loadList("/assistenku/admin/services", setServicesState)}
              loading={servicesState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <StatusFilter rows={servicesState.items} value={serviceFilter} onChange={setServiceFilter} />
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Endpoint: GET /assistenku/admin/services | POST /assistenku/admin/services
              </div>
            </div>
            {servicesState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{servicesState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable rows={filteredServices} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tambah Service (JSON)</div>
              <textarea
                value={servicePayload}
                onChange={(event) => setServicePayload(event.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  padding: 12,
                  fontFamily: "monospace"
                }}
              />
              <button
                onClick={() => handleCreate("/assistenku/admin/services", servicePayload, setServicesState)}
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#9fd0ff",
                  color: "#0b2d7a",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Simpan Service
              </button>
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Pricing Management"
              description="Kelola skema harga dan paket layanan."
              onRefresh={() => loadList("/assistenku/admin/pricing", setPricingState)}
              loading={pricingState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <StatusFilter rows={pricingState.items} value={pricingFilter} onChange={setPricingFilter} />
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Endpoint: GET /assistenku/admin/pricing | POST /assistenku/admin/pricing
              </div>
            </div>
            {pricingState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{pricingState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable rows={filteredPricing} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tambah Pricing (JSON)</div>
              <textarea
                value={pricingPayload}
                onChange={(event) => setPricingPayload(event.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  padding: 12,
                  fontFamily: "monospace"
                }}
              />
              <button
                onClick={() => handleCreate("/assistenku/admin/pricing", pricingPayload, setPricingState)}
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#9fd0ff",
                  color: "#0b2d7a",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Simpan Pricing
              </button>
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Order Monitor"
              description="Pantau order aktif dan status operasional."
              onRefresh={() => loadList("/assistenku/admin/orders", setOrdersState)}
              loading={ordersState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <StatusFilter rows={ordersState.items} value={orderFilter} onChange={setOrderFilter} />
                <ServiceFilter
                  rows={ordersState.items}
                  value={orderServiceFilter}
                  onChange={setOrderServiceFilter}
                />
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Endpoint: GET /assistenku/admin/orders</div>
            </div>
            {ordersState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{ordersState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable rows={filteredOrders} />
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Ledger / Finance"
              description="Rekap finansial dan transaksi ledger."
              onRefresh={() => loadList("/assistenku/admin/ledger", setLedgerState)}
              loading={ledgerState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <StatusFilter rows={ledgerState.items} value={ledgerFilter} onChange={setLedgerFilter} />
              <div style={{ fontSize: 12, opacity: 0.7 }}>Endpoint: GET /assistenku/admin/ledger</div>
            </div>
            {ledgerState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{ledgerState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable rows={filteredLedger} />
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Audit Log"
              description="Jejak audit aktivitas admin dan sistem."
              onRefresh={() => loadList("/assistenku/admin/audit", setAuditState)}
              loading={auditState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <StatusFilter rows={auditState.items} value={auditFilter} onChange={setAuditFilter} />
              <div style={{ fontSize: 12, opacity: 0.7 }}>Endpoint: GET /assistenku/admin/audit</div>
            </div>
            {auditState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{auditState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable rows={filteredAudit} />
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Mitra Verification"
              description="Verifikasi atau blokir mitra sesuai kebutuhan operasional."
              onRefresh={() => loadList("/assistenku/admin/mitra", setMitraState)}
              loading={mitraState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <StatusFilter rows={mitraState.items} value={mitraFilter} onChange={setMitraFilter} />
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Endpoint: GET /assistenku/admin/mitra | POST /assistenku/admin/verify-mitra
              </div>
            </div>
            {mitraState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{mitraState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable
                rows={filteredMitra}
                renderAction={(row) => (
                  <button
                    onClick={() => handleToggleMitra(row)}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    Toggle VERIFIED / BLOCKED
                  </button>
                )}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
