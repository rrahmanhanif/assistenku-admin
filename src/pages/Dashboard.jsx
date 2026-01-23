import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGet, adminPost } from "../lib/adminApi.js";
import { enforceAdminSession, logoutAdmin } from "../lib/adminAuth.js";
import { getAdminSession } from "../lib/adminSession.js";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

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
    if (row?.[field]) return String(row[field]);
  }
  return "";
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

function SectionHeader({ title, description, onRefresh, loading }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 15 }}>{title}</div>
        <div style={{ opacity: 0.75, fontSize: 12, marginTop: 2 }}>{description}</div>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          background: "rgba(255,255,255,0.10)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.18)",
          padding: "8px 10px",
          borderRadius: 12,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 800,
          fontSize: 12,
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}

function StatusFilter({ rows, value, onChange }) {
  const options = useMemo(() => {
    const values = rows.map((r) => getStatusValue(r)).filter(Boolean);
    return uniq(values);
  }, [rows]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.10)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.18)",
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
    const values = rows.map((r) => getServiceValue(r)).filter(Boolean);
    return uniq(values);
  }, [rows]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.10)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.18)",
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

function DataTable({ rows, renderAction }) {
  const columns = useMemo(() => {
    const keys = new Set();
    for (const row of rows || []) {
      Object.keys(row || {}).forEach((k) => keys.add(k));
    }
    const list = Array.from(keys);
    // batasi agar UI tidak terlalu berat
    return list.slice(0, 10);
  }, [rows]);

  if (!rows?.length) {
    return (
      <div style={{ opacity: 0.7, fontSize: 12, padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.20)" }}>
        Tidak ada data.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.25)" }}>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: "10px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  whiteSpace: "nowrap"
                }}
              >
                {c}
              </th>
            ))}
            {renderAction && (
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  whiteSpace: "nowrap"
                }}
              >
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {columns.map((c) => (
                <td key={c} style={{ padding: "10px 10px", verticalAlign: "top" }}>
                  {typeof row?.[c] === "object" ? JSON.stringify(row?.[c]) : String(row?.[c] ?? "")}
                </td>
              ))}
              {renderAction && <td style={{ padding: "10px 10px" }}>{renderAction(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  const [whoamiState, setWhoamiState] = useState({ status: "idle", data: null, error: "" });
  const [ledgerOverviewState, setLedgerOverviewState] = useState({
    status: "idle",
    data: null,
    error: ""
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  async function loadWhoami() {
    setWhoamiState({ status: "loading", data: null, error: "" });
    try {
      const { data } = await httpClient.request({
        endpoint: endpoints.auth.whoami
      });
      const actor = data?.data?.actor || data?.actor || data;
      setWhoamiState({ status: "success", data: actor, error: "" });
    } catch (error) {
      setWhoamiState({
        status: "error",
        data: null,
        error: error?.message || "Gagal memuat data admin."
      });
    }
  }

  async function loadLedgerOverview() {
    setLedgerOverviewState({ status: "loading", data: null, error: "" });
    try {
      const { data } = await httpClient.request({
        endpoint: endpoints.admin.ledgerOverview
      });
      setLedgerOverviewState({ status: "success", data, error: "" });
    } catch (error) {
      console.error("Ledger overview error:", {
        status: error?.status,
        data: error?.data
      });
      setLedgerOverviewState({
        status: "error",
        data: null,
        error: "FEATURE NOT READY (API missing)"
      });
    }
  }

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
      loadWhoami(),
      loadLedgerOverview(),
      loadList(endpoints.admin.services, setServicesState),
      loadList(endpoints.admin.pricing, setPricingState),
      loadList(endpoints.admin.orders, setOrdersState),
      loadList(endpoints.admin.ledger, setLedgerState),
      loadList(endpoints.admin.audit, setAuditState),
      loadList(endpoints.admin.mitra, setMitraState)
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
      await adminPost(endpoints.admin.verifyMitra, { id: mitraId, status: nextStatus });
      await loadList(endpoints.admin.mitra, setMitraState);
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
  const filteredOrders = applyServiceFilter(applyStatusFilter(ordersState.items, orderFilter), orderServiceFilter);
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

            {whoamiState.data && (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                Whoami: {[whoamiState.data.name, whoamiState.data.email, whoamiState.data.role]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            )}

            {whoamiState.status === "error" && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#ffb3b3" }}>{whoamiState.error}</div>
            )}
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
          {/* Services */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Service Management"
              description="Kelola layanan utama Assistenku."
              onRefresh={() => loadList(endpoints.admin.services, setServicesState)}
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
                onClick={() => handleCreate(endpoints.admin.services, servicePayload, setServicesState)}
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

          {/* Pricing */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Pricing Management"
              description="Kelola skema harga dan paket layanan."
              onRefresh={() => loadList(endpoints.admin.pricing, setPricingState)}
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
                onClick={() => handleCreate(endpoints.admin.pricing, pricingPayload, setPricingState)}
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

          {/* Orders */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Order Monitor"
              description="Pantau order aktif dan status operasional."
              onRefresh={() => loadList(endpoints.admin.orders, setOrdersState)}
              loading={ordersState.status === "loading"}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <StatusFilter rows={ordersState.items} value={orderFilter} onChange={setOrderFilter} />
                <ServiceFilter rows={ordersState.items} value={orderServiceFilter} onChange={setOrderServiceFilter} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Endpoint: GET /assistenku/admin/orders</div>
            </div>
            {ordersState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{ordersState.error}</div>}
            <div style={{ marginTop: 12 }}>
              <DataTable rows={filteredOrders} />
            </div>
          </section>

          {/* Ledger Overview */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Ledger Overview (API)"
              description="Ringkasan ledger dari API pusat."
              onRefresh={loadLedgerOverview}
              loading={ledgerOverviewState.status === "loading"}
            />
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Endpoint: GET {endpoints.admin.ledgerOverview}</div>

            {ledgerOverviewState.status === "loading" && <div style={{ marginTop: 10 }}>Memuat ledger overview...</div>}

            {ledgerOverviewState.status === "error" && (
              <div style={{ marginTop: 10, color: "#ffb3b3" }}>{ledgerOverviewState.error}</div>
            )}

            {ledgerOverviewState.status === "success" && (
              <pre
                style={{
                  marginTop: 12,
                  background: "rgba(0,0,0,0.25)",
                  padding: 12,
                  borderRadius: 12,
                  fontSize: 12,
                  overflowX: "auto"
                }}
              >
                {JSON.stringify(ledgerOverviewState.data, null, 2)}
              </pre>
            )}
          </section>

          {/* Ledger */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Ledger / Finance"
              description="Rekap finansial dan transaksi ledger."
              onRefresh={() => loadList(endpoints.admin.ledger, setLedgerState)}
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

          {/* Audit */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Audit Log"
              description="Jejak audit aktivitas admin dan sistem."
              onRefresh={() => loadList(endpoints.admin.audit, setAuditState)}
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

          {/* Mitra */}
          <section style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <SectionHeader
              title="Mitra Verification"
              description="Verifikasi atau blokir mitra sesuai kebutuhan operasional."
              onRefresh={() => loadList(endpoints.admin.mitra, setMitraState)}
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
                    Toggle
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
