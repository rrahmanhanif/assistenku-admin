import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Panel Admin Assistenku</h1>

      <div className="mt-4 space-y-3">
        <Link className="block text-blue-600" href="/dashboard">Dashboard</Link>
        <Link className="block text-blue-600" href="/users">Pengguna</Link>
        <Link className="block text-blue-600" href="/mitra">Data Mitra</Link>
      </div>
    </div>
  );
}
