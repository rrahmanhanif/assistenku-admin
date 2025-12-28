# Rencana Pengujian Assistenku Admin

## Unit Test: Analytics
Tujuan: memverifikasi perhitungan statistik yang digunakan grafik dan insight operasional.
- **`src/services/analytics.js` – getCoreRevenueDaily**
  - Memastikan hanya transaksi berstatus `success` yang dihitung.
  - Memastikan rumus pembagian pendapatan (25%) diterapkan ke setiap transaksi.
  - Memastikan agregasi per tanggal berjalan benar untuk beberapa entri pada tanggal yang sama dan lintas hari.
  - Memastikan fungsi mengembalikan array objek `{ date, value }` yang terurut deterministik.
- **`src/services/analytics.js` – getMitraActivity**
  - Menghitung total mitra dan jumlah berstatus `online`.
  - Menangani data kosong atau field `status` tidak terisi tanpa error.

## Integration Test: API Client
Tujuan: memastikan klien Supabase berinteraksi dengan skema data yang benar.
- **`src/lib/servicesApi.js` – getServices**
  - Mengecek query memilih tabel `services_master`, filter `active = true`, dan urutan nama layanan naik.
  - Memastikan respons error dicatat ke log dan fungsi mengembalikan array kosong ketika terjadi kegagalan.
- **`src/lib/servicesApi.js` – getServiceDetail**
  - Mengambil satu layanan melalui `service_code` dengan `.single()`.
  - Memastikan skenario data tidak ditemukan menghasilkan `null` dan error dicatat.
  - (Opsional) Uji dengan Supabase mock untuk memvalidasi bentuk hasil data.

## UI Smoke Test: Halaman Monitoring & Otak
Tujuan: memvalidasi halaman penting dapat dimuat dan aksi utama bekerja.
- **Monitoring – `src/pages/OrderChatMonitor.jsx`**
  - Halaman dapat dirender melalui rute yang tersedia (cek integrasi dengan router). 
  - Komponen menampilkan daftar/umpan chat, indikator waktu, serta tidak error ketika data kosong.
  - Aksi utama (refresh/subscribe jika ada) berjalan tanpa crash dan log debug tidak memunculkan error berat di konsol.
- **Otak (Core) – `src/pages/CoreUsers.jsx`**
  - Halaman memuat daftar pengguna core dengan kolom peran serta kontrol pengubahan peran.
  - Form pengaturan peran default (`viewer`) muncul dan dapat disimpan tanpa error runtime.
  - Navigasi kembali ke dashboard/admin tetap berfungsi dan tidak memunculkan 404.
