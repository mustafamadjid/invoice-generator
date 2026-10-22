# Invoice Generator — Garchick's Kitchen

Aplikasi web satu halaman untuk membuat struk transaksi, melihat preview PDF, mencetak, dan mengunduh struk. Aplikasi berjalan di browser tanpa backend atau database.

## Fitur

- Mengisi informasi toko, transaksi, pembayaran, dan beberapa produk.
- Menambahkan catatan order opsional yang dicetak setelah informasi pembayaran.
- Menghitung jumlah item dan total transaksi secara otomatis, dengan validasi input.
- Menyediakan menu bawaan dengan harga yang bisa dipilih, sekaligus mempertahankan input nama dan harga manual:
  - Paket Kotak — Rp19.000
  - Ricebowl — Rp12.000
  - Ricebowl Spesial — Rp14.000
  - Ricebowl Spesial + Kulit — Rp16.000
  - Add-ons: Kulit — Rp2.000, Telur — Rp3.000, dan Tempe — Rp3.000
- Membuat preview struk PDF di browser. Ukuran **58 mm** menjadi pilihan awal; ukuran **80 mm** juga tersedia.
- Menyediakan tombol **Cetak Struk** yang membuka dialog cetak browser dan tombol **Download PDF**.
- Menyertakan data contoh dan tombol reset form.

## Persyaratan

- Node.js **20.19 atau lebih baru**, atau **22.12 atau lebih baru**.
- npm.
- Browser modern. Chrome atau Edge disarankan untuk preview PDF dan pencetakan.

Tidak diperlukan database, server API, atau environment variable untuk menjalankan aplikasi.

## Instalasi dan menjalankan

> Dari root repository, jalankan:

```bash
cd invoice-generator
npm ci
npm run dev
```

Buka alamat lokal yang ditampilkan Vite di terminal (biasanya `http://localhost:5173`). `npm ci` memasang dependency sesuai `package-lock.json`.

## Perintah yang tersedia

Jalankan semua perintah dari folder `invoice-generator/`.

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server development. |
| `npm run build` | Membuat build produksi di `invoice-generator/dist/`. |
| `npm run preview` | Menjalankan preview dari build produksi. Jalankan `npm run build` terlebih dahulu. |
| `npm run lint` | Memeriksa kode dengan Oxlint. |
| `npm test` | Menjalankan tes unit dan interaksi dengan Vitest. |
| `npm run test:e2e` | Menjalankan tes browser dengan Playwright. |
| `npm run test:pdf:browser` | Memeriksa PDF yang dibuat di browser. |
| `npm run test:e2e:production` | Membuat build produksi lalu menjalankan smoke test Playwright. |

> Playwright memerlukan browser yang sesuai dengan konfigurasi lokal. Jika Firefox belum terpasang, jalankan `npx playwright install firefox` dari `invoice-generator/`.

## Teknologi

- **React 19** untuk antarmuka dan state form.
- **Vite 8** untuk server development dan build statis.
- **pdfmake 0.3** untuk membuat PDF di browser.
- **JavaScript ES modules** dan CSS.
- **Vitest**, **React Testing Library**, dan **Playwright** untuk pengujian.
- **Oxlint** untuk linting.

## Struktur repository

```text
.
├── README.md
├── plan.md
├── Struk_Garchicks_Kitchen_58mm.pdf  # Referensi visual; tidak diperlukan untuk menjalankan aplikasi
└── invoice-generator/
    ├── package.json
    ├── package-lock.json
    ├── public/
    └── src/
        ├── components/                # Form, ringkasan, dan preview struk
        ├── data/                       # Data awal dan preset produk
        ├── hooks/                      # Pembuatan serta pengelolaan preview PDF
        └── lib/                        # Validasi, kalkulasi, format, dan template PDF
```

[`plan.md`](plan.md) berisi rencana dan catatan teknis proyek. PDF referensi di root hanya dipakai sebagai acuan tampilan.

## Data dan penyesuaian

- Draft transaksi disimpan sementara di state halaman. Refresh atau menutup halaman akan menghapus isian; unduh struk sebelum meninggalkan halaman.
- Data transaksi diproses di browser dan tidak dikirim ke backend.
- Ubah preset produk dan harganya di `invoice-generator/src/data/defaultProducts.js`.
- Ubah nilai awal toko di `invoice-generator/src/data/initialInvoice.js`.
- Ubah tata letak PDF di `invoice-generator/src/lib/receiptPdf.js` dan gaya aplikasi di `invoice-generator/src/index.css`.
- Tombol cetak membuka dialog cetak browser; pilih printer thermal dan ukuran kertas yang sesuai di dialog atau pengaturan driver printer.

## Deployment ke Vercel

Atur proyek Vercel dengan nilai berikut:

- **Root Directory:** `invoice-generator`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Konfigurasi tersebut relatif terhadap Root Directory. Untuk aplikasi statis ini tidak diperlukan `vercel.json` atau environment variable.
