import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch, adminGet, adminPost } from "../lib/adminApi.js";
import { enforceAdminSession, logoutAdmin } from "../lib/adminAuth.js";
import { getAdminSession } from "../lib/adminSession.js";
import { endpoints } from "../services/http/endpoints.js";

const ORDER_ID_FIELDS = ["id", "order_id", "orderId"];
const SERVICE_FIELDS = ["service", "service_name", "serviceName", "serviceType", "serviceCode"];
const CUSTOMER_FIELDS = ["customer", "customer_name", "customerName", "buyer"];
const MITRA_FIELDS = ["mitra", "mitra_name", "mitraName", "partner", "partnerName"];
const ORDER_STATUS_FIELDS = ["status_order", "order_status", "statusOrder", "orderStatus"];
const PAYMENT_STATUS_FIELDS = ["status_payment", "payment_status", "paymentStatus"];
const TOTAL_FIELDS = ["total", "total_amount", "amount", "grand_total", "totalAmount"];
const EXPIRY_FIELDS = ["expires_at", "expiresAt", "expired_at", "expiredAt"];

const TAX_FIELDS = ["tax", "tax_amount", "taxAmount", "ppn", "vat"];

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getFieldValue(row, fields) {
  for (const field of fields) {
    const value = row?.[field];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function formatCurrency(value) {
  if (value === "" || value === null || value === undefined) return "-";
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(numeric);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID");
}

function formatError(error) {
  if (!error) return "Terjadi kesalahan.";
  const status = error?.status ? `HTTP ${error.status}` : "";
  const requestId = error?.data?.request_id || error?.data?.requestId;
  const message = error?.data?.message || error?.message || "Terjadi kesalahan.";
  const extras = [status, requestId ? `request_id ${requestId}` : ""].filter(Boolean).join(" • ");
  return extras ? `${message} (${extras})` : message;
}

function sumNumericValues(values) {
  return values.reduce((acc, value) => {
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(numeric)) return acc;
    return acc + numeric;
  }, 0);
}

function LedgerRowTable({ rows }) {
  if (!rows?.length) {
    return <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>Belum ada data ledger.</div>;
  }

  const columns = Object.keys(rows[0] || {});

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        marginTop: 8,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.25)" }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: "left",
                  padding: "10px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  whiteSpace: "nowrap",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {columns.map((col) => (
                <td key={col} style={{ padding: "10px 10px", verticalAlign: "top" }}>
                  {typeof row?.[col] === "object" ? JSON.stringify(row?.[col]) : String(row?.[col] ?? "")}
                </td>
              ))}
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

  const [whoamiState, setWhoamiState] = useState({ status: "idle", data: null, error: "" });
  const [ordersState, setOrdersState] = useState({ status: "idle", items: [], error: "" });
  const [payoutsState, setPayoutsState] = useState({ status: "idle", items: [], error: "" });
  const [ledgerState, setLedgerState] = useState({ status: "idle", items: [], error: "", order: null });
  const [actionMessage, setActionMessage] = useState("");
  const [payoutProofs, setPayoutProofs] = useState({});

  useEffect(() => {
    (async () => {
      const ok = await enforceAdminSession();
      if (!ok) {
        nav("/admin-login");
        return;
      }
      await loadWhoami();
      await loadAll();
    })();
  }, [nav]);

  async function loadWhoami() {
    setWhoamiState({ status: "loading", data: null, error: "" });
    try {
      const { data } = await adminFetch(endpoints.auth.whoami);
      const actor = data?.data?.actor || data?.actor || data?.data || data;
      const role = String(actor?.role || "").toUpperCase();

      if (role && role !== "ADMIN") {
        await logoutAdmin();
        setWhoamiState({ status: "error", data: null, error: "Akses ditolak: role bukan ADMIN." });
        nav("/admin-login");
        return;
      }

      setWhoamiState({ status: "success", data: actor, error: "" });
    } catch (error) {
      setWhoamiState({ status: "error", data: null, error: formatError(error) });
    }
  }

  async function loadOrders() {
    setOrdersState((prev) => ({ ...prev, status: "loading", error: "" }));
    try {
      const data = await adminGet(endpoints.admin.orders);
      setOrdersState({ status: "success", items: extractList(data), error: "" });
    } catch (error) {
      setOrdersState({ status: "error", items: [], error: formatError(error) });
    }
  }

  async function loadPayouts() {
    setPayoutsState((prev) => ({ ...prev, status: "loading", error: "" }));
    try {
      const data = await adminGet(endpoints.admin.payouts);
      setPayoutsState({ status: "success", items: extractList(data), error: "" });
    } catch (error) {
      setPayoutsState({ status: "error", items: [], error: formatError(error) });
    }
  }

  async function loadLedger(order) {
    if (!order) return;
    setLedgerState({ status: "loading", items: [], error: "", order });

    const orderId = getFieldValue(order, ORDER_ID_FIELDS);
    try {
      const data = await adminGet(`${endpoints.admin.ledger}?order_id=${orderId}`);
      setLedgerState({ status: "success", items: extractList(data), error: "", order });
    } catch (error) {
      setLedgerState({ status: "error", items: [], error: formatError(error), order });
    }
  }

  async function loadAll() {
    await Promise.all([loadOrders(), loadPayouts()]);
  }

  async function handleMarkPaid(order) {
    const orderId = getFieldValue(order, ORDER_ID_FIELDS);
    if (!orderId) return;

    setActionMessage("");
    try {
      await adminPost(`${endpoints.admin.orders}/${orderId}/mark-paid`, {});
      setActionMessage(`Order ${orderId} berhasil ditandai PAID.`);
      await loadOrders();
    } catch (error) {
      setActionMessage(formatError(error));
    }
  }

  async function handleMarkPayoutPaid(payout) {
    const payoutId = payout?.id || payout?.payout_id || payout?.payoutId;
    if (!payoutId) return;

    const proof = payoutProofs[payoutId];
    if (!proof) {
      setPayoutsState((prev) => ({
        ...prev,
        error: "Upload bukti transfer terlebih dahulu sebelum menandai payout PAID.",
      }));
      return;
    }

    setPayoutsState((prev) => ({ ...prev, status: "loading", error: "" }));

    try {
      const formData = new FormData();
      formData.append("proof", proof);

      await adminFetch(`${endpoints.admin.payouts}/${payoutId}/mark-paid`, {
        method: "POST",
        body: formData,
      });

      setActionMessage(`Payout ${payoutId} berhasil ditandai PAID.`);
      await loadPayouts();
    } catch (error) {
      setPayoutsState((prev) => ({ ...prev, status: "error", error: formatError(error) }));
    }
  }

  const paidOrdersCount = useMemo(() => {
    return ordersState.items.filter(
      (order) => String(getFieldValue(order, PAYMENT_STATUS_FIELDS)).toUpperCase() === "PAID"
    ).length;
  }, [ordersState.items]);

  const payoutPendingItems = useMemo(() => {
    return payoutsState.items.filter(
      (payout) => String(payout?.status || payout?.payout_status || "").toUpperCase() === "PENDING"
    );
  }, [payoutsState.items]);

  const platformFeeTotal = useMemo(() => {
    const paidTotals = ordersState.items
      .filter((order) => String(getFieldValue(order, PAYMENT_STATUS_FIELDS)).toUpperCase() === "PAID")
      .map((order) => getFieldValue(order, TOTAL_FIELDS));
    return sumNumericValues(paidTotals) * 0.1;
  }, [ordersState.items]);

  const ledgerSummary = useMemo(() => {
    const order = ledgerState.order;
    if (!order) return null;

    const total = getFieldValue(order, TOTAL_FIELDS);
    const totalNumeric = Number(String(total).replace(/[^0-9.-]/g, ""));

    const taxTotal = sumNumericValues(
      ledgerState.items
        .flatMap((item) => TAX_FIELDS.map((field) => item?.[field]))
        .filter(Boolean)
    );

    return {
      total,
      mitraShare: Number.isNaN(totalNumeric) ? null : totalNumeric * 0.9,
      platformFee: Number.isNaN(totalNumeric) ? null : totalNumeric * 0.1,
      taxTotal: taxTotal || null,
    };
  }, [ledgerState.items, ledgerState.order]);

  return (
    <div style={{ minHeight: "100vh", background: "#061a4a", padding: 18, color: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Admin Control Center</div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>Admin: {session?.email || "-"}</div>

            {whoamiState.data && (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                Whoami: {[whoamiState.data.name, whoamiState.data.email, whoamiState.data.role].filter(Boolean).join(" • ")}
              </div>
            )}

            {whoamiState.error && (
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
              fontWeight: 800,
            }}
          >
            Logout
          </button>
        </div>

        {actionMessage && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.35)" }}>
            {actionMessage}
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Paid Orders</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{paidOrdersCount}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Payout Pending</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{payoutPendingItems.length}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Platform Fee Total</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{formatCurrency(platformFeeTotal)}</div>
          </div>
        </div>

        <section style={{ marginTop: 18, background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Orders Dashboard</div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Endpoint: GET {endpoints.admin.orders}</div>

          {ordersState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{ordersState.error}</div>}
          {ordersState.status === "loading" && <div style={{ marginTop: 8 }}>Memuat orders...</div>}

          {!ordersState.items.length && ordersState.status !== "loading" && (
            <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>Belum ada order.</div>
          )}

          {ordersState.items.length > 0 && (
            <div
              style={{
                overflowX: "auto",
                marginTop: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                    {["ID", "Service", "Customer", "Mitra", "Status Order", "Status Payment", "Total", "Expires At", "Action"].map(
                      (title) => (
                        <th
                          key={title}
                          style={{
                            textAlign: "left",
                            padding: "10px 10px",
                            borderBottom: "1px solid rgba(255,255,255,0.12)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {title}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ordersState.items.map((order) => {
                    const orderId = getFieldValue(order, ORDER_ID_FIELDS);
                    const paymentStatus = String(getFieldValue(order, PAYMENT_STATUS_FIELDS)).toUpperCase();
                    const rowKey = orderId || JSON.stringify(order);

                    return (
                      <tr key={rowKey} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={{ padding: "10px 10px" }}>{orderId || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{getFieldValue(order, SERVICE_FIELDS) || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{getFieldValue(order, CUSTOMER_FIELDS) || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{getFieldValue(order, MITRA_FIELDS) || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{getFieldValue(order, ORDER_STATUS_FIELDS) || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{paymentStatus || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{formatCurrency(getFieldValue(order, TOTAL_FIELDS))}</td>
                        <td style={{ padding: "10px 10px" }}>{formatDate(getFieldValue(order, EXPIRY_FIELDS))}</td>
                        <td style={{ padding: "10px 10px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={() => loadLedger(order)}
                            style={{
                              background: "rgba(255,255,255,0.12)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              padding: "6px 10px",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Detail
                          </button>

                          {paymentStatus !== "PAID" && (
                            <button
                              onClick={() => handleMarkPaid(order)}
                              style={{
                                background: "#9fd0ff",
                                color: "#0b2d7a",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              Mark PAID
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ marginTop: 18, background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Order Ledger Detail</div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Endpoint: GET {endpoints.admin.ledger}?order_id=</div>

          {!ledgerState.order && <div style={{ marginTop: 8, opacity: 0.7 }}>Pilih order untuk melihat detail ledger.</div>}
          {ledgerState.status === "loading" && <div style={{ marginTop: 8 }}>Memuat ledger...</div>}
          {ledgerState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{ledgerState.error}</div>}

          {ledgerState.order && ledgerSummary && (
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Split 90/10 + Pajak</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                <div style={{ background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Total Order</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{formatCurrency(ledgerSummary.total)}</div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Mitra (90%)</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {ledgerSummary.mitraShare === null ? "-" : formatCurrency(ledgerSummary.mitraShare)}
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Platform Fee (10%)</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {ledgerSummary.platformFee === null ? "-" : formatCurrency(ledgerSummary.platformFee)}
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Pajak</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {ledgerSummary.taxTotal === null ? "-" : formatCurrency(ledgerSummary.taxTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <LedgerRowTable rows={ledgerState.items} />
        </section>

        <section style={{ marginTop: 18, background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Payout Management (Manual)</div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Endpoint: GET {endpoints.admin.payouts}</div>

          {payoutsState.error && <div style={{ marginTop: 8, color: "#ffb3b3" }}>{payoutsState.error}</div>}
          {payoutsState.status === "loading" && <div style={{ marginTop: 8 }}>Memuat payout...</div>}

          {!payoutPendingItems.length && payoutsState.status !== "loading" && (
            <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>Tidak ada payout pending.</div>
          )}

          {payoutPendingItems.length > 0 && (
            <div
              style={{
                overflowX: "auto",
                marginTop: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                    {["ID", "Mitra", "Amount", "Status", "Proof", "Action"].map((title) => (
                      <th
                        key={title}
                        style={{
                          textAlign: "left",
                          padding: "10px 10px",
                          borderBottom: "1px solid rgba(255,255,255,0.12)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payoutPendingItems.map((payout) => {
                    const payoutId = payout?.id || payout?.payout_id || payout?.payoutId;
                    const mitraName = payout?.mitra || payout?.mitra_name || payout?.mitraName || payout?.partner;
                    const amount = payout?.amount || payout?.total || payout?.total_amount;
                    const status = payout?.status || payout?.payout_status || "";
                    const rowKey = payoutId || JSON.stringify(payout);

                    return (
                      <tr key={rowKey} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={{ padding: "10px 10px" }}>{payoutId || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{mitraName || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>{formatCurrency(amount)}</td>
                        <td style={{ padding: "10px 10px" }}>{status || "-"}</td>
                        <td style={{ padding: "10px 10px" }}>
                          <input
                            type="file"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              setPayoutProofs((prev) => ({ ...prev, [payoutId]: file }));
                            }}
                            style={{ fontSize: 12 }}
                          />
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <button
                            onClick={() => handleMarkPayoutPaid(payout)}
                            style={{
                              background: "#9fd0ff",
                              color: "#0b2d7a",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Mark Payout PAID
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
