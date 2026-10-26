-- +goose Up
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_user_identities_user_id
        FOREIGN KEY (user_id)
        REFERENCES users (id),

    UNIQUE(provider, provider_user_id)
);

-- +goose Down
DROP TABLE user_identities;
