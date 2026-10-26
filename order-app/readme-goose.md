# Panduan Goose Migration — Go + PostgreSQL di Windows

Panduan ini menggunakan `go tool goose` untuk menjalankan migrasi database PostgreSQL pada proyek Go (misalnya Garchick Kitchen).

## 1. Struktur proyek

```text
project/
├── .env
├── go.mod
├── migrations/
│   └── 20261025170000_create_initial_tables.sql
└── readme-goose.md
```

Jalankan perintah berikut dari root proyek, agar direktori `migrations` terdeteksi.

## 2. Konfigurasi `.env`

### Opsi A — Konfigurasi khusus Goose (paling mudah)

```dotenv
GOOSE_DRIVER=postgres
GOOSE_DBSTRING=postgres://postgres:password@localhost:5432/garchick_db?sslmode=disable
GOOSE_MIGRATION_DIR=migrations
```

Sesuaikan nama pengguna, kata sandi, port, dan nama database. Gunakan `sslmode=disable` hanya untuk PostgreSQL lokal yang memang tidak menggunakan TLS. Jangan commit `.env` yang berisi rahasia ke Git.

Di **PowerShell**:

```powershell
go tool goose -env .env status
go tool goose -env .env up
```

Goose membaca variabel `GOOSE_DRIVER`, `GOOSE_DBSTRING`, dan `GOOSE_MIGRATION_DIR` dari `.env`.

### Opsi B — Tetap menggunakan `DB_URL` aplikasi

Misalnya `.env` berisi:

```dotenv
DB_URL=postgres://postgres:password@localhost:5432/garchick_db?sslmode=disable
```

Goose **tidak otomatis** memakai `DB_URL` sebagai koneksi database. Pada PowerShell, untuk file `.env` sederhana dengan baris `DB_URL=...`, muat nilainya terlebih dahulu:

```powershell
$line = Get-Content .env | Where-Object { $_ -match '^DB_URL=' } | Select-Object -First 1
if (-not $line) { throw 'DB_URL tidak ditemukan dalam .env' }
$env:DB_URL = ($line -replace '^DB_URL=', '').Trim().Trim('"').Trim("'")
```

Lalu jalankan:

```powershell
go tool goose -dir migrations postgres "$env:DB_URL" up
```

Alternatifnya, jika `$env:DB_URL` **sudah tersedia** di sesi PowerShell:

```powershell
$env:GOOSE_DRIVER = 'postgres'
$env:GOOSE_DBSTRING = $env:DB_URL
$env:GOOSE_MIGRATION_DIR = 'migrations'
go tool goose up
```

> Parser `.env` sederhana di atas hanya menangani nilai satu baris. Untuk `.env` kompleks (interpolasi, multiline, atau escape), gunakan parser dotenv yang sesuai.

## 3. Perintah Goose yang sering digunakan

Jika memakai **Opsi A**:

| Operasi | PowerShell |
|---|---|
| Validasi file migrasi | `go tool goose -dir migrations validate` |
| Lihat status | `go tool goose -env .env status` |
| Jalankan seluruh migrasi baru | `go tool goose -env .env up` |
| Jalankan satu migrasi | `go tool goose -env .env up-by-one` |
| Batalkan satu migrasi terakhir | `go tool goose -env .env down` |
| Lihat versi database | `go tool goose -env .env version` |
| Buat migrasi SQL baru | `go tool goose -dir migrations create add_table sql` |

**Perhatian:** Perintah `down` menjalankan bagian `-- +goose Down`. Jika berisi `DROP TABLE`, data tabel itu ikut terhapus. Jangan jalankan sembarangan pada database produksi.

## 4. Perbedaan PowerShell, CMD, dan Git Bash

Cara mengakses variabel lingkungan berbeda antar-shell.

**PowerShell:**

```powershell
$env:DB_URL = 'postgres://postgres:password@localhost:5432/garchick_db?sslmode=disable'
go tool goose -dir migrations postgres "$env:DB_URL" up
```

**Command Prompt (CMD):**

```bat
set "DB_URL=postgres://postgres:password@localhost:5432/garchick_db?sslmode=disable"
go tool goose -dir migrations postgres "%DB_URL%" up
```

**Git Bash:**

```bash
export DB_URL='postgres://postgres:password@localhost:5432/garchick_db?sslmode=disable'
go tool goose -dir migrations postgres "$DB_URL" up
```

## 5. Troubleshooting

### Hanya muncul halaman `Usage: goose ...`

Kemungkinan string koneksi kosong atau argumen kurang. Cek variabel tanpa mencetak kata sandi:

```powershell
if ([string]::IsNullOrWhiteSpace($env:DB_URL)) {
    Write-Host 'DB_URL kosong / belum diset'
} else {
    Write-Host 'DB_URL sudah terisi'
}
```

`"$DB_URL"` adalah sintaks Bash, **bukan** PowerShell. Gunakan `"$env:DB_URL"` pada PowerShell.

### Gagal terhubung ke PostgreSQL

- Pastikan layanan PostgreSQL berjalan dan database tujuan sudah dibuat.
- Periksa hostname, port, username, password, dan `sslmode`.
- Bila kata sandi mengandung karakter khusus dalam URL (misalnya `@`, `#`, `/`), URL-encode karakter tersebut.

### Migration tidak ditemukan

Pastikan menjalankan perintah dari root proyek dan direktori `migrations` benar. Gunakan `-dir migrations` atau `GOOSE_MIGRATION_DIR=migrations`.

### `go tool goose` tidak dikenali

Pastikan Goose sudah terdaftar sebagai tool pada `go.mod` dan versi Go mendukung perintah `go tool` untuk tool yang didaftarkan. Jika Goose dipasang sebagai executable terpisah, gunakan perintah `goose` sebagai pengganti `go tool goose`.

## Referensi

- [Goose CLI Commands](https://pressly.github.io/goose/documentation/cli-commands/)
- [Goose SQL Migration Annotations](https://pressly.github.io/goose/documentation/annotations/)

