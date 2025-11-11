import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExportButtons({ data }) {
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Transaksi Assistenku", 14, 10);
    const tableData = data.map((t) => [
      new Date(t.timestamp?.toDate()).toLocaleString(),
      t.userEmail,
      t.type,
      t.amount.toLocaleString(),
      t.status,
      t.description || "-",
    ]);

    doc.autoTable({
      head: [["Tanggal", "User", "Tipe", "Jumlah (Rp)", "Status", "Keterangan"]],
      body: tableData,
      startY: 20,
    });

    doc.save(`laporan_assistenku_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((t) => ({
        Tanggal: new Date(t.timestamp?.toDate()).toLocaleString(),
        User: t.userEmail,
        Tipe: t.type,
        Jumlah: t.amount,
        Status: t.status,
        Keterangan: t.description || "-",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `laporan_assistenku_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={exportPDF}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ekspor PDF
      </button>
      <button
        onClick={exportExcel}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Ekspor Excel
      </button>
    </div>
  );
                                   }
