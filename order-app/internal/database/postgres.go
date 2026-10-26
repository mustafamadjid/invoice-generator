package database

import (
    "context"
    "fmt"
    "time"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

type PostgresConfig struct {
    DSN             string
    MaxOpenConns    int
    MaxIdleConns    int
    ConnMaxLifetime time.Duration
    ConnMaxIdleTime time.Duration
    HealthTimeout   time.Duration
}

func OpenPostgres(
    ctx context.Context,
    cfg PostgresConfig,
) (*gorm.DB, error) {

    if cfg.DSN == "" {
        return nil, fmt.Errorf("postgres DSN is required")
    }

    // 1. Inisialisasi GORM
    db, err := gorm.Open(
        postgres.Open(cfg.DSN),
        &gorm.Config{
            DisableAutomaticPing: true,
        },
    )
    if err != nil {
        return nil, fmt.Errorf("open postgres: %w", err)
    }

    // 2. Ambil connection pool dari GORM
    sqlDB, err := db.DB()
    if err != nil {
        return nil, fmt.Errorf("get sql DB: %w", err)
    }

    // 3. Konfigurasi connection pool
    if cfg.MaxOpenConns > 0 {
        sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
    }

    if cfg.MaxIdleConns > 0 {
        sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
    }

    if cfg.ConnMaxLifetime > 0 {
        sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)
    }

    if cfg.ConnMaxIdleTime > 0 {
        sqlDB.SetConnMaxIdleTime(cfg.ConnMaxIdleTime)
    }

    // 4. Health check dengan timeout
    timeout := cfg.HealthTimeout
    if timeout <= 0 {
        timeout = 3 * time.Second
    }

    hctx, cancel := context.WithTimeout(ctx, timeout)
    defer cancel()

    if err := sqlDB.PingContext(hctx); err != nil {
        sqlDB.Close()
        return nil, fmt.Errorf("postgres ping failed: %w", err)
    }

    return db, nil
}