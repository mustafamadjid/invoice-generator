# Order App

Backend API untuk aplikasi order, menggunakan Go, Fiber, GORM, dan PostgreSQL.

Go `1.26` atau lebih baru diperlukan oleh dependency saat ini.

## Menjalankan API

```powershell
go run ./cmd/api
```

Server berjalan di `http://localhost:3000`. Endpoint `GET /health` mengembalikan status layanan.

Koneksi GORM ke PostgreSQL dapat dibuka melalui `internal/database.OpenPostgres(dsn)`.

## Goose migrations

Goose dikelola sebagai tool di `go.mod`. Jalankan dengan `go tool goose`, contohnya:

```powershell
go tool goose -dir migrations postgres "$env:DATABASE_URL" status
go tool goose -dir migrations postgres "$env:DATABASE_URL" up
```

Siapkan `DATABASE_URL` sebelum menjalankan migrasi. Contoh format DSN PostgreSQL:

```text
postgres://user:password@localhost:5432/order_app?sslmode=disable
```
