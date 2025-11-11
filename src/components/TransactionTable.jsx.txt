export default function TransactionTable({ data }) {
  if (!data.length) {
    return <p style={{ marginTop: "1rem" }}>Belum ada transaksi.</p>;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <thead style={{ background: "#0d6efd", color: "white" }}>
        <tr>
          <th style={th}>ID Transaksi</th>
          <th style={th}>Total (Rp)</th>
          <th style={th}>Gateway (Rp)</th>
          <th style={th}>Mitra (75%)</th>
          <th style={th}>Core (25%)</th>
          <th style={th}>Customer Charge</th>
          <th style={th}>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {data.map((trx) => (
          <tr key={trx.id} style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}>
            <td style={td}>{trx.id}</td>
            <td style={td}>{trx.totalAmount.toLocaleString()}</td>
            <td style={td}>{trx.gatewayFee.toLocaleString()}</td>
            <td style={td}>{trx.mitraShare.toLocaleString()}</td>
            <td style={td}>{trx.coreShare.toLocaleString()}</td>
            <td style={td}>
              {trx.customerCharge > 0 ? trx.customerCharge.toLocaleString() : "-"}
            </td>
            <td style={td}>{trx.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { padding: "10px", fontWeight: "bold" };
const td = { padding: "8px" };
