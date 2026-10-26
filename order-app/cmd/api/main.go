package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/mustafamadjid/invoice-generator/order-app/internal/database"
)

func main() {
	ctx := context.Background()

	cfg := database.PostgresConfig{
		DSN: os.Getenv("DB_URL"),
		MaxOpenConns:    20,
        MaxIdleConns:    5,
        ConnMaxLifetime: time.Hour,
        ConnMaxIdleTime: 30 * time.Minute,
        HealthTimeout:   3 * time.Second,
	}	

	// Database
	db, err := database.OpenPostgres(ctx, cfg)
    if err != nil {
        log.Fatal(err)
    }

	sqlDB,err := db.DB()
	if err != nil {
		log.Fatal(err)
	}
	defer sqlDB.Close()

	// HTTP Server
	app := fiber.New()

	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	log.Fatal(app.Listen(":3000"))
}
