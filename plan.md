# PLAN — Invoice Generator

> Dokumen perencanaan dan implementasi aplikasi web sederhana untuk membuat dan mengunduh struk transaksi dalam format PDF.

## 1. Ringkasan Proyek

| Atribut | Spesifikasi |
|---|---|
| Nama aplikasi | **Invoice Generator** |
| Jenis aplikasi | Single-page application (SPA), client-side only |
| Tujuan | Pengguna mengisi data transaksi, melihat preview, dan menghasilkan struk PDF yang mengikuti dokumen referensi |
| Frontend | **React.js + JavaScript** |
| Build tool | **Vite** |
| Generator PDF | **pdfmake 0.3.x** (browser; patch terpilih dikunci saat setup) |
| Styling | CSS biasa / CSS Modules; tidak memerlukan framework UI |
| State | React `useState` / `useReducer` dan `useMemo` seperlunya |
| Backend / API | **Tidak ada** |
| Database / penyimpanan | **Tidak ada**, termasuk `localStorage`, `sessionStorage`, IndexedDB, cookie untuk draft, dan layanan penyimpanan eksternal |
| Deployment | **Vercel** (static site) |
| Referensi visual | `references/Struk_Garchicks_Kitchen_Yuni_19_Oktober_2026.pdf` relatif terhadap root repository |

### Prinsip Utama

1. Semua pengisian dan pemrosesan data berlangsung di browser pengguna.
2. Data hanya hidup selama halaman aktif pada memori React. **Refresh, menutup tab, atau membuka ulang situs menghapus isian transaksi yang belum diunduh.**
3. PDF dihasilkan langsung di browser dan dapat diunduh oleh pengguna.
4. Aplikasi tidak membutuhkan akun, autentikasi, API, database, SSR, serverless function, maupun environment variable.
5. Bentuk struk **mengikuti referensi**, bukan desain invoice A4 generik.
6. Implementasi dibuat sederhana sehingga mudah dipelihara, di-build, dan di-deploy ke Vercel.

## 2. Analisis Dokumen Referensi

Menurut catatan awal, referensi adalah struk **Garchick's Kitchen** satu halaman, berukuran sekitar **226,77 × 498,90 point**, atau sekitar **80 × 176 mm**. Lebar 80 mm dipertahankan; tinggi PDF hasil harus menyesuaikan konten, bukan selalu 176 mm.

**Prasyarat acuan visual:** PDF asli belum tersedia di workspace saat revisi ini. Pemilik proyek perlu menyediakan file tersebut di `references/Struk_Garchicks_Kitchen_Yuni_19_Oktober_2026.pdf` sebelum kalibrasi visual Phase 3. Konten dan ukuran di bawah merupakan catatan awal yang belum diverifikasi ulang terhadap file asli. Setelah tersedia, buka PDF, periksa jumlah halaman, ukuran, teks, dan layout; catat hasilnya di `references/README.md`. Jangan membuat PDF pengganti dari catatan ini lalu menganggapnya sebagai acuan asli.

Phase 1–2 dan kerangka integrasi PDF dapat berjalan lebih dahulu. Kalibrasi visual Phase 3, T-16, dan Definition of Done tetap **tertunda** sampai acuan tersedia dan perbandingan dilakukan. Folder `references/` berada di luar root aplikasi dan tidak disalin ke `public/` atau bundle deployment.

### 2.1 Struktur Visual yang Harus Dipertahankan

1. Ikon toko hitam, **terpusat** di bagian paling atas.
2. Nama bisnis **tebal** dan terpusat.
3. Alamat beberapa baris dan nomor telepon, semuanya terpusat.
4. Garis pemisah **putus-putus**.
5. Informasi transaksi dua kolom:
   - `Tanggal:` di kiri dan `Pelanggan:` di kanan.
   - `Waktu:` di kiri dan `Kasir:` di kanan.
6. Garis pemisah putus-putus.
7. Daftar produk bernomor:
   - Baris pertama: **nomor urut + nama produk** (tebal).
   - Baris kedua: `qty x Rp harga satuan` di kiri; `Rp jumlah` rata kanan.
8. Garis pemisah putus-putus.
9. `Total QTY :`.
10. `Sub Total` dengan nilai rata kanan.
11. `TOTAL` dengan teks dan nilai **tebal**.
12. Garis pemisah putus-putus.
13. `Metode pembayaran:` dan `Status:`.
14. Garis pemisah putus-putus.
15. Ucapan terima kasih di bagian bawah, rata tengah.

**Gaya:** latar putih, teks hitam, sans-serif, layout ringkas seperti struk thermal 80 mm, jarak antarseksi konsisten. Tidak menambahkan pajak, diskon, biaya layanan, ongkir, QR pembayaran, atau nomor invoice karena elemen tersebut tidak ada dalam referensi MVP.

### 2.2 Konten Contoh yang Dibaca dari PDF

| Field | Nilai contoh |
|---|---|
| Nama toko | Garchick's Kitchen |
| Alamat | Perum Beringin Raya, Jl. Perkutut No.2, Kemiling, Bandar Lampung |
| Telepon | 082175673461 |
| Tanggal | 19/10/2026 |
| Waktu | 16:42 |
| Pelanggan | Yuni |
| Kasir | Mustafa Madjid |
| Produk 1 | Ricebowl Spesial + Kulit — 22 × Rp 16.000 = Rp 352.000 |
| Produk 2 | Es Teh Manis — 22 × Rp 2.000 = Rp 44.000 |
| Total QTY | 44 |
| Sub Total | Rp 396.000 |
| TOTAL | Rp 396.000 |
| Metode pembayaran | QRIS |
| Status | Lunas |
| Footer | Terima kasih telah membeli makanan kami! |

**Kriteria kesesuaian visual:** bentuk dan hierarki informasi, pemisah putus-putus, ikon, alignment, penebalan, jarak, dan ukuran lebar harus sedekat mungkin dengan PDF contoh. Preview dan PDF final harus berasal dari definisi dokumen yang sama untuk menghindari perbedaan tampilan.

## 3. Cakupan Produk / MVP

### 3.1 Fitur Wajib

- **F-01 — Form informasi toko.** Edit nama toko, alamat multiline, nomor telepon, dan teks footer. Nilai awal mengikuti PDF contoh dan dapat diubah selama sesi aktif.
- **F-02 — Form transaksi.** Input tanggal, waktu, nama pelanggan, dan nama kasir. Tanggal serta waktu dapat diisi melalui kontrol browser yang sesuai; default transaksi boleh menggunakan tanggal/waktu lokal saat membuka aplikasi, namun pengguna tetap dapat mengeditnya.
- **F-03 — Daftar item dinamis.** Tambah item, edit nama, kuantitas, harga satuan, dan hapus item; minimal tersisa satu baris item pada form.
- **F-04 — Kalkulasi otomatis.** Total per item = kuantitas × harga satuan; total QTY = jumlah kuantitas; Sub Total = jumlah seluruh total item; TOTAL = Sub Total (tanpa biaya tambahan pada MVP).
- **F-05 — Informasi pembayaran.** Pilih metode pembayaran (misalnya QRIS, Tunai, Transfer, Lainnya) dan status (Lunas/Belum Lunas). Jika memilih Lainnya, tampilkan input nama metode.
- **F-06 — Preview PDF.** Menampilkan hasil struk yang mengikuti referensi. Dapat diperbarui setelah input valid berubah, dengan debounce pendek agar perubahan cepat tidak menyebabkan render berlebihan. Tampilkan loading/error bila dibutuhkan.
- **F-07 — Download PDF.** Tombol `Download PDF`, file dihasilkan di browser; nama file aman, misalnya `struk-garchicks-kitchen-yuni-2026-10-19.pdf`.
- **F-08 — Validasi.** Tunjukkan error spesifik pada field yang tidak valid dan nonaktifkan/gagalkan proses generate sampai data valid.
- **F-09 — Reset.** Tombol `Reset Form` dengan konfirmasi untuk mengembalikan data ke default. Tidak ada pemulihan otomatis setelah refresh.
- **F-10 — Responsive UI.** Form dan preview berdampingan pada desktop, bertumpuk atau menggunakan tab pada mobile.

### 3.2 Di Luar Cakupan MVP

- Login, akun, peran, dashboard admin.
- Backend, REST API, database, cloud storage.
- Penyimpanan draft (`localStorage`, `sessionStorage`, IndexedDB), autosave, histori transaksi.
- Integrasi POS, printer thermal melalui ESC/POS, notifikasi, pembayaran sungguhan.
- Upload logo, katalog produk permanen, template multi-desain.
- Perhitungan diskon/pajak/ongkir dan format kertas A4/58 mm.

## 4. Alur Pengguna

1. Pengguna membuka halaman **Invoice Generator**.
2. Informasi toko tampil dengan data default sesuai referensi; form transaksi siap diisi.
3. Pengguna mengisi tanggal/waktu, pelanggan, kasir, item, dan metode pembayaran.
4. Aplikasi menghitung semua total secara otomatis dari data saat ini.
5. Jika semua data valid, aplikasi menampilkan preview PDF struk.
6. Pengguna meninjau struk dan menekan **Download PDF**.
7. File PDF tersimpan melalui mekanisme download browser; **form tetap hanya tersimpan di memori** sampai di-reset/refresh.

## 5. Spesifikasi Form dan Validasi

| Bagian | Input | Tipe UI | Aturan |
|---|---|---|---|
| Toko | Nama toko | Text | Wajib, trim, tidak boleh kosong |
| Toko | Alamat | Textarea | Wajib, multiline, otomatis wrap pada PDF |
| Toko | Nomor telepon | Tel/Text | Wajib, diperlakukan sebagai teks agar nol di depan tidak hilang |
| Toko | Footer | Textarea | Wajib, boleh multiline |
| Transaksi | Tanggal | Date | Wajib, tanggal valid |
| Transaksi | Waktu | Time | Wajib, format jam-menit valid |
| Transaksi | Pelanggan | Text | Wajib, trim |
| Transaksi | Kasir | Text | Wajib, trim |
| Item | Nama produk | Text | Wajib, trim; teks panjang harus terbungkus |
| Item | QTY | Number | Wajib; bilangan bulat 1–999 |
| Item | Harga satuan | Number | Wajib; bilangan bulat Rp 0–Rp 9.999.999; kosong bukan nol |
| Pembayaran | Metode | Select | Wajib, pilihan valid; `Lainnya` wajib diisi namanya |
| Pembayaran | Status | Select | Wajib; `Lunas` / `Belum Lunas` |

**Batas MVP:** batas berikut berlaku di UI dan `validateInvoice()`, bukan hanya atribut HTML.

| Data | Batas |
|---|---|
| Jumlah item | 1–50 baris |
| QTY per item | 1–999 |
| Harga satuan | Rp 0–Rp 9.999.999 |
| Nama toko / pelanggan / kasir / produk | Maksimal 80 karakter per field |
| Alamat | Maksimal 300 karakter dan 6 baris eksplisit |
| Nomor telepon | Maksimal 30 karakter |
| Footer | Maksimal 160 karakter dan 4 baris eksplisit |
| Nama metode pembayaran `Lainnya` | Maksimal 40 karakter |

Panjang teks dihitung dengan `String.length` setelah trim dan normalisasi CRLF menjadi LF; newline ikut dihitung. Semua field teks wajib berisi karakter selain whitespace. Batas baris menghitung newline eksplisit, bukan wrap otomatis. Tolak data yang melampaui batas dengan error spesifik tanpa memotong isian diam-diam. Nonaktifkan tambah item pada 50 baris dan hapus pada satu baris; validator juga menolak array di luar batas ini.

**Aturan numerik:** simpan nilai input QTY dan harga sebagai string mentah selama pengeditan. Tolak string kosong/whitespace sebelum konversi; hanya terima digit desimal `0–9`, tanpa tanda, eksponen, pemisah ribuan, atau pecahan. Sesudah konversi, wajib lolos `Number.isSafeInteger()` dan batas field. `unitPrice: "0"` valid dan berarti gratis; `unitPrice: ""` invalid dengan pesan `Harga satuan wajib diisi`. Jangan menggunakan `Number(value) || 0` atau konversi kosong menjadi nol.

Kalkulasi hanya memakai nilai numerik hasil validasi. Periksa keamanan setiap perkalian dan penjumlahan, termasuk total QTY, dengan `Number.isSafeInteger()`. Total maksimum menurut batas MVP adalah `50 × 999 × 9.999.999 = 499.499.950.050`, masih di bawah `Number.MAX_SAFE_INTEGER`; pemeriksaan tetap wajib untuk menjaga helper kalkulasi. Jika input atau hasil tidak valid, tampilkan error, ringkasan total `—`, dan blokir preview baru serta download sampai diperbaiki.

**Format:** tanggal `DD/MM/YYYY`; waktu `HH:mm`; mata uang `Rp 16.000`, `Rp 396.000` (pemisah ribuan Indonesia, tanpa desimal); seluruh total rata kanan. Form boleh menggunakan format number standar selama nilai yang ditampilkan pada struk terformat dengan benar.

**Kondisi awal:** gunakan satu baris item kosong agar pengguna mudah memulai. Isi toko boleh di-seed dari referensi. Tombol opsional `Isi Data Contoh` mengisikan transaksi Yuni dan kedua item referensi agar pengujian reproduksibel; tidak menyebabkan persistensi.

## 6. Model Data (In-Memory)

Struktur data sederhana yang disimpan dalam React state:

```js
const initialInvoice = {
  store: {
    name: "Garchick's Kitchen",
    address: "Perum Beringin Raya,\nJl. Perkutut No.2, Kemiling,\nBandar Lampung",
    phone: "082175673461",
    footer: "Terima kasih telah membeli\nmakanan kami!",
  },
  transaction: {
    date: "",             // YYYY-MM-DD dari input date
    time: "",             // HH:mm dari input time
    customer: "",
    cashier: "",
    paymentMethod: "QRIS",
    customPaymentMethod: "",
    paymentStatus: "Lunas",
  },
  items: [
    { id: "client-generated-unique-id", name: "", quantity: "1", unitPrice: "" },
  ],
};
```

**Catatan:** `id` hanya identifier untuk key React; gunakan `crypto.randomUUID()` di browser saat menambah baris jika tersedia, atau strategi identifier lokal yang stabil. ID tidak perlu masuk ke PDF. Tidak perlu menyimpan kalkulasi `lineTotal`, `subTotal`, `totalQty`, atau `grandTotal` ke state karena semuanya merupakan derived values.

### Aturan Kalkulasi

Contoh berikut menerima item hasil validasi dengan `quantity` dan `unitPrice` bertipe number, bukan string mentah dari state form. `validateInvoice()` mengembalikan error atau data ternormalisasi; hanya data valid diteruskan ke kalkulasi dan PDF. `sampleInvoice` menggunakan string `"22"`, `"16000"`, dan `"2000"` untuk field numerik pada state form.

```js
lineTotal = quantity * unitPrice;
totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
subTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
grandTotal = subTotal;
```

**Contoh uji dari referensi:** `22 × 16.000 + 22 × 2.000 = Rp 396.000`, dengan total QTY `22 + 22 = 44`.

## 7. Arsitektur dan Pilihan Teknologi

### 7.1 Stack Final

- **React.js + JavaScript:** antarmuka dan state form.
- **Vite:** local development, bundling, dan build statis.
- **pdfmake 0.3.x:** menghasilkan PDF di browser dari sebuah `docDefinition`; mendukung ukuran halaman khusus dan `height: 'auto'` untuk struk panjang dinamis. Saat setup gunakan `npm install --save-exact pdfmake@0.3` untuk memilih patch seri 0.3 dan menyimpan versi eksak di `package.json`; commit `package-lock.json` dan gunakan `npm ci` untuk instalasi ulang.
- **Kontrak integrasi pdfmake:** gunakan dokumentasi 0.3 secara konsisten. Daftarkan font lokal dari `pdfmake/build/vfs_fonts` melalui `addVirtualFileSystem`, lalu gunakan API Promise, misalnya `await pdfMake.createPdf(docDefinition).getBlob()`, dengan penanganan rejection. Jangan menggunakan contoh callback dari dokumentasi 0.1/0.2. Verifikasi import browser/VFS melalui development dan production build sebelum mengerjakan template lengkap.
- **CSS / CSS Modules:** tampilan aplikasi dan responsive layout.
- **Tidak memakai React Router:** MVP hanya satu halaman.
- **Tidak memakai library state global:** state lokal sudah memadai.

### 7.2 Arsitektur Data dan Render

```text
Input form (React)
     |
     v
Invoice state (memory only)
     |
     +--> validateInvoice() --> pesan error
     |
     +--> data valid ternormalisasi --> calculateTotals() --> ringkasan otomatis
     |
     +--> data valid + totals --> buildReceiptDefinition() --> pdfmake
                                      |
                                      +--> Blob URL --> preview PDF
                                      |
                                      +--> PDF download
```

**Keputusan penting:** jangan membuat layout preview HTML dan layout PDF berbeda. Preview MVP menggunakan PDF yang dihasilkan dari **fungsi `buildReceiptDefinition()` yang sama dengan download**, misalnya Blob URL di `<iframe>`/`<object>`. Dengan begitu preview menguji PDF final secara langsung. Saat Blob URL diperbarui, panggil `URL.revokeObjectURL()` untuk URL lama agar tidak terjadi kebocoran memori. Sediakan fallback `Preview tidak tersedia di browser ini — unduh PDF`.

### 7.3 Pengaturan PDF

- Lebar halaman: **226,77 pt** (80 mm, sama dengan acuan).
- Tinggi halaman: **`'auto'`** mengikuti konten (sumber: dokumentasi pdfmake `pageSize`).
- Orientasi: portrait.
- Margin: relatif kecil dan konsisten (mulai dari 6–7 mm, kemudian kalibrasi dengan acuan).
- Header dan footer: bukan fixed overlay; ikut alur konten agar tidak menumpuk pada banyak item.
- Item panjang harus dapat wrap; harga dan total tetap terbaca dengan alignment kanan.
- Pemisah: garis putus-putus dari vector/canvas PDF, bukan string tanda hubung yang mudah berubah lebar.
- Ikon toko: gunakan aset SVG lokal / vector sederhana berbentuk storefront hitam (menyerupai acuan); tidak mengandalkan gambar dari URL pihak ketiga.
- Font: gunakan font yang benar-benar terpaket di PDF (mis. Roboto dari default VFS pdfmake), teruji untuk karakter Indonesia dan tanda baca yang digunakan.
- Judul dan nama produk dibuat bold; nilai `TOTAL` lebih tebal/besar dari teks lain, serupa acuan.

### 7.4 Struktur Folder yang Diusulkan

**Lokasi proyek:** root repository adalah folder workspace `invoice/` yang berisi `plan.md` dan `references/`. Aplikasi berada di subfolder `invoice-generator/`; semua perintah npm setelah scaffold dijalankan dari subfolder ini. Vercel menggunakan **Root Directory `invoice-generator`**. Struktur di bawah hanya menunjukkan isi root aplikasi; `plan.md` tetap di root repository.

```text
invoice-generator/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── StoreForm.jsx
│   │   ├── TransactionForm.jsx
│   │   ├── ItemListForm.jsx
│   │   ├── PaymentForm.jsx
│   │   ├── ReceiptPreview.jsx
│   │   └── Summary.jsx
│   ├── data/
│   │   ├── initialInvoice.js
│   │   └── sampleInvoice.js
│   ├── lib/
│   │   ├── calculateInvoice.js
│   │   ├── validateInvoice.js
│   │   ├── formatters.js
│   │   └── receiptPdf.js
│   ├── assets/
│   │   └── storefront.svg
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

**Penempatan tugas:** `App.jsx` mengoordinasi state dan action; komponen form hanya menangani input; `calculateInvoice.js` dan `validateInvoice.js` menjadi pure functions; `receiptPdf.js` bertanggung jawab untuk membangun `docDefinition`, preview, dan download. Jangan mencampur aturan kalkulasi ke dalam template PDF.

## 8. Desain Antarmuka

### Desktop

```text
+-------------------------------------------------------------+
| Invoice Generator                             [Reset Form]   |
+--------------------------------+----------------------------+
| FORM INPUT                     | PREVIEW STRUK              |
|                                |                            |
| Informasi Toko                 |      [PDF 80 mm]           |
| [Nama] [Telepon]               |                            |
| [Alamat] [Footer]              |      Garchick's Kitchen    |
|                                |      ...                   |
| Informasi Transaksi            |                            |
| [Tanggal] [Waktu]              |                            |
| [Pelanggan] [Kasir]            |                            |
|                                |                            |
| Daftar Produk                  |                            |
| [Nama] [QTY] [Harga] [Hapus]   |                            |
| [+ Tambah Produk]              |                            |
|                                |                            |
| Pembayaran                     |                            |
| [Metode] [Status]              |                            |
|                                |                            |
| QTY / Subtotal / Total         |                            |
|                                |                            |
| [Download PDF]                 |                            |
+--------------------------------+----------------------------+
```

### Mobile

- Form satu kolom dengan input yang cukup besar untuk disentuh.
- Preview di bawah form atau menggunakan tombol/tab `Form` / `Preview`.
- Tombol `Download PDF` mudah dijangkau; tidak menutupi field.
- PDF tetap berukuran fisik 80 mm terlepas dari lebar viewport.
- Gunakan label eksplisit, focus style, pesan validasi terbaca, dan indikator status `Membuat PDF...` saat proses berjalan.

## 9. Tahapan Implementasi (Checklist)

### Phase 1 — Inisialisasi

- [x] Dari root repository `invoice/`, buat proyek: `npm create vite@latest invoice-generator -- --template react`, lalu `cd invoice-generator`.
- [x] Jalankan `npm install` dan `npm install --save-exact pdfmake@0.3`; pastikan versi eksak dan lockfile tersimpan.
- [x] Buat struktur folder minimal dan hapus boilerplate yang tidak diperlukan.
- [x] Atur judul tab, favicon, dan metadata `Invoice Generator`.
- [x] Siapkan skrip `dev`, `build`, dan `preview` dari Vite.

### Phase 2 — State, Form, Validasi

- [x] Implementasi `initialInvoice` dan `sampleInvoice`.
- [x] Bangun input informasi toko dan transaksi.
- [x] Bangun daftar item dinamis; tambah, ubah, hapus.
- [x] Buat helper nominal dan tanggal Indonesia.
- [x] Implementasi pure functions untuk validasi string mentah, normalisasi angka, dan kalkulasi aman sesuai batas bagian 5. Verifikasi T-08, T-09, dan T-17–T-21.
- [x] Buat komponen ringkasan total yang selalu sinkron.
- [x] Buat tombol Reset dengan konfirmasi.

**Catatan implementasi Phase 2:** form pembayaran dan tombol `Isi Data Contoh` juga tersedia agar transaksi dapat divalidasi lengkap. Pengujian Vitest mencakup logika dan interaksi form; Playwright mencakup alur data contoh, error harga kosong, perubahan item, reset batal/konfirmasi, dan kehilangan draft setelah reload pada viewport desktop/mobile. Saat input tidak valid, kalkulasi menampilkan `—`, preview lama dibersihkan, dan unduhan dinonaktifkan; perilaku generate/download ini sekarang diverifikasi pada Phase 4.

### Phase 3 — Template PDF Sesuai Referensi

- [ ] Pastikan PDF asli tersedia pada path bagian 2; verifikasi isi/ukuran dan catat di `references/README.md` sebelum kalibrasi visual.
- [x] Integrasikan pdfmake 0.3, VFS lokal, dan API Promise; uji satu PDF minimal dengan font normal/bold dari development dan production build (T-22).
- [x] Buat `buildReceiptDefinition(invoice, totals)`.
- [x] Implementasikan header ikon toko, nama, alamat, nomor telepon.
- [x] Implementasikan dua baris informasi transaksi, dengan alignment kiri/kanan.
- [x] Implementasikan daftar item bernomor, nama tebal, rincian QTY × harga, total item rata kanan.
- [x] Implementasikan `Total QTY`, `Sub Total`, `TOTAL`, pembayaran, status, dan footer.
- [x] Terapkan ukuran 80 mm, tinggi auto, wrapping, dashed separators, dan pengaturan margin.
- [ ] **Tertunda — PDF acuan belum tersedia.** Bandingkan hasil render dengan `references/Struk_Garchicks_Kitchen_Yuni_19_Oktober_2026.pdf`; sesuaikan styling tanpa memaksakan tinggi tetap.

**Catatan implementasi Phase 3:** generator memvalidasi state mentah sebelum menghasilkan Blob, memakai VFS font Roboto lokal dan API Promise pdfmake 0.3.12, serta menggunakan layout definisi yang sama untuk contoh, item gratis, teks panjang, dan nominal batas maksimum. Pemeriksaan PDF pada browser development dan bundle penguji production memverifikasi lebar 226,77 pt, satu halaman untuk 1/2/10/50 item, teks/footer utuh di dalam halaman, garis putus-putus, dan font regular/bold ter-embed. Hasil sudah dirender dan ditinjau. Perbandingan visual dengan PDF asli, T-16, dan DoD visual tetap menunggu file acuan.

### Phase 4 — Preview dan Download

- [x] Generate PDF Blob dari satu `docDefinition` yang digunakan juga untuk download.
- [x] Tampilkan Blob URL di preview; perbarui dengan debounce ketika input valid berubah.
- [x] Batalkan/abaikan hasil generate usang bila input berubah sebelum proses selesai.
- [x] Revoke Blob URL lama saat berganti data/unmount.
- [x] Tambahkan tombol Download PDF dengan nama file yang disanitasi.
- [x] Tangani browser tanpa inline PDF preview dan kegagalan generate tanpa crash.

**Catatan implementasi Phase 4:** preview menunggu debounce 250 ms, dan nomor generasi mencegah hasil render lama menggantikan data terbaru. Blob URL lama dibersihkan saat input berubah atau komponen dilepas. Tombol unduh memakai URL Blob aktif yang sama dengan iframe; nama file memuat nama toko, pelanggan, dan tanggal. Saat browser tidak menampilkan PDF inline, tautan unduh tetap tersedia. Kegagalan generate menampilkan pesan umum dan menonaktifkan unduhan. Jika pemuatan modul PDF tetap gagal, pengguna diminta memuat ulang halaman; isian yang belum diunduh akan hilang karena form hanya disimpan di memori. Promise pemuatan pdfmake dibuang saat reject agar error tidak tersimpan pada cache aplikasi. Vitest menguji debounce, render usang, cleanup URL, dan error; Playwright desktop/mobile memastikan tombol serta tautan fallback menghasilkan Blob yang sama, hasil terbaru setelah edit, dan unduhan yang diblokir saat generate gagal.

### Phase 5 — Responsiveness dan Quality Assurance

- [x] Selesaikan layout desktop/mobile.
- [x] Uji seluruh validasi dan perhitungan.
- [x] Uji 1, 2, 10, dan 50 item beserta teks/angka pada batas maksimum, termasuk keterbacaan kolom nominal dan footer; uji penolakan 51 item.
- [x] Uji output PDF di Chrome serta minimal satu browser lain.
- [x] Jalankan `npm run build` dan `npm run preview` tanpa error.
- [x] Pastikan tidak ada panggilan API, database, ataupun penyimpanan browser.

**Catatan implementasi Phase 5:** layout diuji dengan transaksi contoh dan preview PDF aktif pada lebar 320, 390, 600, 601, 768, 1000, 1001, dan 1440 px; tidak ditemukan overflow horizontal dan panel preview bertumpuk/berdampingan sesuai breakpoint. Vitest memeriksa validasi field, kalkulasi aman, batas teks/angka, maksimum 50 item, dan penolakan 51 item. Uji PDF memeriksa jumlah 1, 2, 10, dan 50 item serta panjang maksimum untuk semua field teks, nominal terbesar, batas konten, dan footer. Playwright memvalidasi PDF pada Chrome untuk development/production dan Firefox; smoke test aplikasi production pada Chrome desktop/mobile serta Firefox menjalankan `npm run preview`, membuat preview, membandingkan byte unduhan dengan Blob preview, dan memeriksa konten PDF. Uji jaringan tidak menemukan request HTTP eksternal atau XHR/fetch; localStorage, sessionStorage, IndexedDB, dan cookie tetap kosong.

### Phase 6 — Deployment Vercel

- [ ] Push repository ke GitHub (sertakan `package-lock.json`, abaikan `node_modules` dan `dist`).
- [ ] Import repository ke Vercel sebagai proyek Vite dengan **Root Directory `invoice-generator`**.
- [ ] Pastikan **Build Command** `npm run build` dan **Output Directory** `dist`.
- [x] Gunakan konfigurasi default Vercel; **tidak diperlukan `vercel.json`** untuk SPA satu halaman tanpa custom route.
- [x] Tidak menambahkan environment variable, serverless function, atau database.
- [ ] Deploy, lalu verifikasi form, preview, dan download dari URL production.

**Catatan implementasi Phase 6 (sementara):** `package-lock.json` tersedia dan `.gitignore` mengecualikan `node_modules`, `dist`, serta artefak test. Aplikasi tetap statis tanpa file environment, endpoint API, atau folder function; tidak ada `vercel.json`. `npm test` (70 tes), lint, dan build produksi lulus; build memberi peringatan chunk `pdfmake` dan `vfs_fonts` di atas 500 kB. Smoke test production lokal lulus di Chrome desktop/mobile; Firefox berakhir dengan `Target crashed`, dan pengujian URL production belum dapat dilakukan. Repo Git lokal sudah diinisialisasi pada branch `main` dan 44 file sumber/plan sudah di-stage. Target repo privat sudah dipilih: `mustafamadjid/invoice-generator`. Push/import/deploy tertunda karena autentikasi `gh` lokal kedaluwarsa; konektor GitHub yang tersedia tidak menyediakan pembuatan repository, dan proyek Vercel belum dibuat. Setelah autentikasi GitHub dipulihkan, buat repo privat, push branch `main`, lalu hubungkan ke Vercel dengan Root Directory `invoice-generator`.

## 10. Test Case dan Acceptance Criteria

| ID | Skenario | Ekspektasi |
|---|---|---|
| T-01 | Isi contoh dari PDF referensi | Item, pelanggan, kasir, tanggal, pembayaran sesuai contoh |
| T-02 | 22 × Rp 16.000 | Subtotal baris produk = Rp 352.000 |
| T-03 | 22 × Rp 2.000 | Subtotal baris produk = Rp 44.000 |
| T-04 | Kedua produk tersedia | Total QTY = 44; Sub Total = TOTAL = Rp 396.000 |
| T-05 | Tambah dan hapus item | Nomor urut dirender ulang dengan benar; semua total langsung diperbarui |
| T-06 | Nama item/alamat panjang | Teks wrap dan tidak menimpa kolom harga atau keluar margin |
| T-07 | 50 item dengan panjang teks dan nominal maksimum | Ketinggian struk bertambah; footer utuh, teks/nominal tidak terpotong atau saling menimpa |
| T-08 | QTY kosong / nol / negatif / pecahan | Tampilkan error; PDF tidak dapat di-generate |
| T-09 | Harga negatif / tidak finite | Tampilkan error; PDF tidak dapat di-generate |
| T-10 | Pelanggan, kasir, nama toko, atau nama produk kosong | Error ditampilkan di field terkait |
| T-11 | Input normal lalu download | PDF berhasil dibuka, format 80 mm, konten sesuai preview |
| T-12 | Pengguna mengubah item setelah preview | Preview dan hasil download mencerminkan data terbaru, bukan blob lama |
| T-13 | Refresh halaman | Data transaksi yang diinput hilang dan kembali ke state awal |
| T-14 | Akses dari Vercel | Halaman bisa dibuka dan menghasilkan PDF tanpa API/backend |
| T-15 | Mobile | Form, preview, dan tombol download bisa digunakan tanpa overflow horizontal halaman |
| T-16 | Visual | Urutan, ikon, garis, alignment, dan hierarki teks selaras dengan PDF acuan |
| T-17 | Harga kosong, whitespace, pecahan, atau eksponen | Error harga spesifik; tidak dikonversi menjadi nol; generate/download diblokir |
| T-18 | Harga `"0"` dengan field lain valid | Valid; total item Rp 0; preview dan download berhasil |
| T-19 | QTY 999/1000, harga 9.999.999/10.000.000, jumlah item 50/51 | Nilai tepat batas diterima; nilai melewati batas ditolak validator; tambah item dinonaktifkan pada 50 |
| T-20 | Setiap field teks tepat batas dan satu karakter/baris di atas batas bagian 5 | Batas diterima; kelebihan ditolak dengan error tanpa pemotongan diam-diam |
| T-21 | Kalkulasi batas maksimum dan input helper yang menghasilkan perkalian/penjumlahan tidak aman | Total maksimum Rp 499.499.950.050 dan QTY 49.950; helper menolak hasil tidak aman, bukan membulatkannya |
| T-22 | Instalasi ulang `npm ci`, development, dan production build menggunakan pdfmake 0.3 terkunci | VFS normal/bold termuat; Promise `getBlob()` menghasilkan PDF terbaca; kegagalan ditangani sebagai error |
| T-23 | Deployment repository dengan aplikasi di subfolder | Root Directory `invoice-generator`; build menemukan package.json dan menghasilkan dist; URL production lolos T-14 |

### Definition of Done

- Semua fitur F-01 sampai F-10 berfungsi.
- Test case T-01 sampai T-23 lulus.
- PDF acuan asli tersedia dan hasil pemeriksaan tercatat; T-16 tidak boleh dinyatakan lulus hanya berdasarkan deskripsi dalam plan.
- Hasil visual struk dengan data contoh mendekati PDF acuan, dengan prioritas pada struktur dan keterbacaan.
- PDF punya lebar 80 mm dan tinggi yang mengikuti konten.
- Tidak ada persistensi data atau request ke backend untuk proses generate.
- `npm run build` berhasil, deployment Vercel berhasil, dan fungsi generate PDF berjalan pada URL production.

## 11. Catatan Risiko dan Keputusan Teknis

1. **Preview browser bervariasi.** Viewer PDF inline tidak selalu tersedia pada semua browser. Download harus tetap bisa digunakan; berikan pesan fallback.
2. **Biaya render preview.** Generate PDF pada setiap ketikan bisa berat. Terapkan debounce, hindari update ketika form invalid, dan pastikan callback lama tidak menimpa preview baru.
3. **Data tidak persistent.** Ini merupakan requirement, bukan bug. Jelaskan singkat pada UI: `Data hanya tersedia selama halaman ini terbuka.`
4. **Logo dari referensi.** Boleh dibuat ulang sebagai ikon storefront vector sederhana dan disimpan lokal. Jangan memakai logo yang diambil dari layanan eksternal atau mengunggah PDF pengguna ke server.
5. **Perbedaan ukuran struk.** Dokumen contoh adalah 80 mm × ±176 mm. Bila jumlah baris berubah, tinggi yang identik justru berisiko overflow; pertahankan lebarnya dan gunakan tinggi otomatis.
6. **Identitas usaha.** Nama, alamat, dan telepon diberikan sebagai nilai default **yang bisa diedit**, bukan string yang dikunci di template.
7. **Ketahanan data.** Karena tidak ada persistensi, transaksi yang selesai harus diunduh sebelum halaman ditutup. Tidak ada fitur recovery draft pada MVP.

## 12. Instruksi Setup dan Deploy Singkat

```bash
# Dari root repository invoice/ yang berisi plan.md
npm create vite@latest invoice-generator -- --template react
cd invoice-generator
npm install
npm install --save-exact pdfmake@0.3

# Instalasi ulang/CI setelah package-lock.json tersedia
npm ci

# Development
npm run dev

# Verifikasi production build
npm run build
npm run preview
```

**Vercel:** hubungkan repository → **Root Directory `invoice-generator`** → framework `Vite` → install `npm ci` → build `npm run build` → output `dist` → Deploy. Build/output relatif terhadap root aplikasi tersebut. Commit `invoice-generator/package.json` dan `invoice-generator/package-lock.json`; `plan.md` dan `references/` tetap di root repository. Setelah deploy, uji dengan transaksi Yuni dari referensi untuk memeriksa PDF production.

## 13. Sumber Teknis

- [pdfmake 0.3 — Client-side Usage](https://pdfmake.github.io/docs/0.3/getting-started/client-side/)
- [pdfmake 0.3 — Client-side Methods (Promise)](https://pdfmake.github.io/docs/0.3/getting-started/client-side/methods/)
- [pdfmake 0.3 — Migration from 0.1/0.2](https://pdfmake.github.io/docs/0.3/migration-from-0.1/)
- [pdfmake 0.3 — Page Dimensions dan Automatic Page Height](https://pdfmake.github.io/docs/0.3/document-definition-object/page/)
- [Vite — Deploying a Static Site](https://vite.dev/guide/static-deploy.html)
- [Vercel — Vite Framework](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel — Root Directory dan Build Configuration](https://vercel.com/docs/builds/configure-a-build#root-directory)

---

**Hasil akhir yang ditargetkan:** satu website React bernama **Invoice Generator** yang dapat diakses melalui Vercel, menerima input struk seperti dokumen Garchick's Kitchen, menampilkan preview, dan mengunduh PDF secara lokal **tanpa backend, database, atau penyimpanan data persisten**.
