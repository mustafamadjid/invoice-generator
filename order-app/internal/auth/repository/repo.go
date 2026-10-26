package auth

import (
	"context"

	"github.com/mustafamadjid/invoice-generator/order-app/internal/auth"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindOrCreateGoogleUser(ctx context.Context, data auth.GoogleUser) (*auth.User,error)
}

type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}