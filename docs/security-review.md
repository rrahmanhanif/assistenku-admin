# Tinjauan Akses Kontrol & Peran

## Ikhtisar
Aplikasi memanfaatkan kombinasi Realtime Database (tabel `roles`/`users`) dan tabel Supabase (`user_roles`) untuk menentukan hak akses. Dashboard admin juga mengonsumsi data withdraw melalui API tanpa lapisan autentikasi eksplisit.

## Temuan
- **Validasi admin di dashboard HTML** (`src/pages/DashboardAdmin.jsx`)
  - Memeriksa `auth.currentUser` dan memanggil `getUserRole` dari Realtime Database untuk memastikan role `admin` sebelum merender konten.
  - Tidak ada fallback ketika `auth.currentUser` memiliki sesi tetapi role belum disetel (potensi akses kosong/blank page).

- **Helper pengecekan admin Supabase** (`src/utils/adminGuard.js`)
  - Mengambil peran dari tabel `user_roles` Supabase dan hanya mengembalikan boolean; tidak ada log atau alasan kegagalan untuk audit.

- **API withdraw tidak tervalidasi** (`src/pages/api/withdraw/list.js`)
  - Endpoint dapat diakses publik; rate limiting dan logging dasar sudah ditambahkan, tetapi belum ada verifikasi peran atau API key sehingga data finansial masih dapat dibaca siapa saja yang mengetahui URL.

- **Penetapan peran** (`src/api/role.js`)
  - API klien menuliskan peran ke Realtime Database tanpa validasi konteks pemanggil sehingga fungsi sisi klien lain bisa menyalahgunakannya jika diekspos tanpa guard.

## Rekomendasi
1. Tambahkan middleware autentikasi/otorisasi pada seluruh endpoint `pages/api`, minimal memeriksa token admin (mis. header bearer atau API key server-side) sebelum menjalankan query Supabase/Firestore.
2. Perkuat `adminGuard` agar mengembalikan alasan kegagalan dan mencatat upaya akses tidak sah untuk audit trail.
3. Saat menetapkan peran melalui `setUserRole`/`setUserProfile`, pastikan hanya dipanggil dari konteks admin (mis. protected server actions atau admin SDK) dan bukan dari klien publik.
4. Untuk dashboard admin versi HTML, tampilkan pesan error yang jelas dan redirect ke login apabila role tidak ditemukan untuk mencegah akses abu-abu.
