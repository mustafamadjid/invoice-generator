package auth

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID			uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	RoleID  	uuid.UUID `gorm:"column:role_id"`
	Username 	string `gorm:"column:username"`
	Email 		string `gorm:"column:email"`
	Password 	string `gorm:"column:password_hash"`
	CreatedAt 	time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt 	time.Time `gorm:"column:updated_at;autoCreateTime;autoUpdateTime"`
	DeletedAt 	time.Time `gorm:"column:deleted_at"`
}

type UserIdentity struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID         uuid.UUID `gorm:"column:user_id"`
    Provider       string    `gorm:"column:provider"`
    ProviderUserID string    `gorm:"column:provider_user_id"`
}

func(t *User) TableName() string {
	return "users"
}

func (UserIdentity) TableName() string {
    return "user_identities"
}