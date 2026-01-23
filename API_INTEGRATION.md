# API Integration Guide (Assistenku Admin)

Dokumen ini menjelaskan cara menghubungkan Admin Dashboard ke API terpusat Assistenku.

## Base URL

Default base URL berada di `https://api.assistenku.com` dan dapat dioverride lewat environment:

```bash
VITE_API_BASE_URL=https://api.assistenku.com
Lokasi konfigurasi:

src/services/http/baseUrl.js menggunakan import.meta.env.VITE_API_BASE_URL dengan default https://api.assistenku.com.

Token (Firebase)
Semua request memakai bearer token dari Firebase currentUser.getIdToken().

Implementasi:

src/services/http/getToken.js mengambil token dari Firebase auth.

src/services/http/httpClient.js otomatis menyisipkan header Authorization: Bearer <token> jika tersedia.

Jika user belum login, request akan tetap jalan (tanpa token) untuk endpoint publik.

Helper HTTP
Gunakan helper httpClient.request dan definisi endpoint dari src/services/http/endpoints.js:

js
Salin kode
import { httpClient } from "../services/http/httpClient";
import { endpoints } from "../services/http/endpoints";

const { data } = await httpClient.request({
  endpoint: endpoints.auth.whoami
});
Contoh: Whoami
js
Salin kode
import { httpClient } from "../services/http/httpClient";
import { endpoints } from "../services/http/endpoints";

export async function fetchWhoami() {
  const { data } = await httpClient.request({
    endpoint: endpoints.auth.whoami
  });

  return data?.data?.actor || data?.actor || data;
}
Contoh: Ledger Overview
js
Salin kode
import { httpClient } from "../services/http/httpClient";
import { endpoints } from "../services/http/endpoints";

export async function fetchLedgerOverview() {
  const { data } = await httpClient.request({
    endpoint: endpoints.admin.ledgerOverview
  });

  return data;
}
Catatan Integrasi
Semua request API wajib menggunakan httpClient.request dan endpoints untuk menjaga konsistensi.

Untuk endpoint eksternal (misal: Flip), gunakan endpoint absolute URL (lihat endpoints.flip.disbursement).

Jika endpoint belum tersedia, tampilkan fallback di UI dengan pesan FEATURE NOT READY (API missing) dan log detail error (status + data).

markdown
Salin kode

---

### Ringkas & tegas
- Tidak ada sisa format diff
- Tidak ada metadata Git
- Aman untuk **replace file** atau **commit langsung**
- Konsisten dengan arsitektur API terpusat `api.assistenku.com`
