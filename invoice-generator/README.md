# Invoice Generator

Aplikasi React + Vite untuk menyusun struk transaksi langsung di browser. Form mencakup data toko, transaksi, produk, pembayaran, kalkulasi, validasi, data contoh, dan reset dengan konfirmasi. PDF dibuat di browser dari definisi struk yang sama untuk preview dan unduhan. Lihat checklist serta cakupan lengkap di [`../plan.md`](../plan.md).

Preview hanya dibuat saat semua data valid dan menunggu jeda 250 ms setelah perubahan. Jika data berubah ketika PDF sedang dibuat, hasil lama diabaikan. Tombol `Download PDF` mengunduh Blob yang sedang ditampilkan, dengan nama file yang dibersihkan dari karakter yang tidak aman. Bila browser tidak menampilkan PDF langsung, tersedia tautan unduhan di bawah preview.

Jika pembuatan PDF gagal, unduhan dinonaktifkan dan aplikasi menampilkan pesan umum. Kegagalan memuat modul PDF mungkin memerlukan muat ulang halaman; karena form hanya disimpan di memori, isian yang belum diunduh akan hilang.

Data hanya hidup di React state; refresh mengembalikan form ke nilai awal. Harga kosong tidak dianggap nol. Jumlah produk dibatasi 1–50, QTY 1–999, dan harga satuan Rp 0–Rp 9.999.999. Ringkasan menampilkan `—` sampai seluruh isian valid.

## Menjalankan proyek

Gunakan Node.js yang memenuhi syarat versi Vite yang terpasang, lalu jalankan perintah dari folder `invoice-generator/`:

```bash
npm ci
npm run dev
```

Untuk memeriksa build produksi:

```bash
npm test
npm run lint
npm run build
npm run preview
```

Pengujian unit dan interaksi form menggunakan Vitest. Pengujian browser menggunakan Playwright pada viewport desktop dan mobile:

```bash
npm run test:e2e
```

Uji responsivitas memeriksa lebar 320–1440 px dengan transaksi contoh dan preview aktif, overflow horizontal, serta susunan form/preview pada breakpoint. Pengujian juga memastikan localStorage, sessionStorage, IndexedDB, dan cookie tetap kosong serta tidak ada request HTTP eksternal/XHR/fetch.

Pengujian Phase 4 memastikan unduhan memakai byte Blob preview yang sama, perubahan data menghasilkan PDF terbaru, kegagalan generate menampilkan error dan menonaktifkan unduhan, serta tautan fallback mengunduh Blob yang sama bila browser tidak menampilkan PDF inline.

Pemeriksaan generator PDF memvalidasi PDF sungguhan di Chrome pada browser development dan bundle penguji production (terpisah dari `dist/` aplikasi), serta di Firefox:

```bash
npm run test:pdf:browser
```

Pemeriksaan tersebut merender struk 1, 2, 10, dan 50 produk, termasuk nominal dan teks maksimum, lalu memeriksa font lokal, dimensi 80 mm, kolom nominal, batas halaman, dan footer.

Smoke test aplikasi production membangun `dist/`, menjalankan `npm run preview`, lalu menguji preview dan unduhan PDF di Chrome desktop/mobile serta Firefox:

```bash
npm run test:e2e:production
```

File bukti sementara berada di `test-results/` dan diabaikan oleh Git.

Playwright menggunakan Chrome stabil lokal untuk pengujian desktop/mobile. Uji Firefox memerlukan browser yang dikelola Playwright; pasang dengan `npx playwright install firefox` bila belum tersedia. Jika memilih Chromium Playwright, jalankan `npx playwright install chromium` lalu set `PLAYWRIGHT_CHANNEL=chromium`.

Jika ingin memilih browser lain, atur environment variable `PLAYWRIGHT_CHANNEL`. Contoh di PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chromium'
npm run test:e2e
```

Playwright menjalankan server development secara otomatis bila belum aktif. Screenshot dan PDF hasil pengujian tersimpan di `test-results/`, yang diabaikan oleh Git.

Vercel menggunakan Root Directory `invoice-generator`, Build Command `npm run build`, dan Output Directory `dist`.
