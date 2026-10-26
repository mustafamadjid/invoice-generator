-- +goose Up

-- ============================================
-- 1. ROLES
-- ============================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role VARCHAR(20) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_roles_role
        CHECK (LENGTH(TRIM(role)) > 0)
);


-- ============================================
-- 2. USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID NOT NULL,

    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT users_role_id_fkey
        FOREIGN KEY (role_id)
        REFERENCES roles(id),

    CONSTRAINT uq_username
        UNIQUE (username),

    CONSTRAINT uq_email
        UNIQUE (email),

    CONSTRAINT chk_username
        CHECK (LENGTH(TRIM(username)) > 0),

    CONSTRAINT chk_email
        CHECK (LENGTH(TRIM(email)) > 0)
);


-- ============================================
-- 3. CATEGORIES
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT uq_category_name
        UNIQUE (name),

    CONSTRAINT chk_category_name
        CHECK (LENGTH(TRIM(name)) > 0)
);


-- ============================================
-- 4. PRODUCTS
-- ============================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL,

    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,

    unit_of_measure VARCHAR(50)
        NOT NULL DEFAULT 'pcs',

    price BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT products_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT uq_product_code
        UNIQUE (code),

    CONSTRAINT chk_product_price
        CHECK (price >= 0),

    CONSTRAINT chk_product_name
        CHECK (LENGTH(TRIM(name)) > 0),

    CONSTRAINT chk_product_code
        CHECK (LENGTH(TRIM(code)) > 0),

    CONSTRAINT chk_product_unit
        CHECK (LENGTH(TRIM(unit_of_measure)) > 0)
);


-- ============================================
-- 5. ORDER NUMBER SEQUENCE
-- ============================================

CREATE SEQUENCE order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO CYCLE;


-- ============================================
-- 6. ORDERS
-- ============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    customer_name VARCHAR(100) NOT NULL,

    order_number VARCHAR(50) NOT NULL
        DEFAULT (
            'GCK-' ||
            TO_CHAR(
                CURRENT_TIMESTAMP
                    AT TIME ZONE 'Asia/Jakarta',
                'YYYYMMDD'
            ) ||
            '-' ||
            LPAD(
                nextval('order_number_seq')::TEXT,
                4,
                '0'
            )
        ),

    order_status VARCHAR(20)
        NOT NULL DEFAULT 'pending',

    subtotal BIGINT NOT NULL DEFAULT 0,

    delivery_fee BIGINT NOT NULL DEFAULT 0,

    total_amount BIGINT NOT NULL DEFAULT 0,

    payment_method VARCHAR(20) NOT NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT orders_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT uq_order_number
        UNIQUE (order_number),

    CONSTRAINT chk_customer_name
        CHECK (LENGTH(TRIM(customer_name)) > 0),

    CONSTRAINT chk_order_status
        CHECK (
            order_status IN (
                'pending',
                'processing',
                'completed',
                'cancelled'
            )
        ),

    CONSTRAINT chk_payment_method
        CHECK (LENGTH(TRIM(payment_method)) > 0),

    CONSTRAINT chk_order_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_delivery_fee
        CHECK (delivery_fee >= 0),

    CONSTRAINT chk_total_amount
        CHECK (total_amount >= 0),

    CONSTRAINT chk_total_calculation
        CHECK (
            total_amount = subtotal + delivery_fee
        )
);


-- ============================================
-- 7. ORDER ITEMS
-- ============================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,
    product_id UUID NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price BIGINT NOT NULL,

    subtotal BIGINT GENERATED ALWAYS AS (
        quantity::BIGINT * unit_price
    ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT order_items_order_id_fkey
        FOREIGN KEY (order_id)
        REFERENCES orders(id),

    CONSTRAINT order_items_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT chk_order_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_item_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_order_item_product_name
        CHECK (LENGTH(TRIM(product_name)) > 0)
);


-- ============================================
-- 8. INDEXES
-- ============================================

CREATE INDEX idx_users_role_id
    ON users(role_id);

CREATE INDEX idx_products_category_id
    ON products(category_id);

CREATE INDEX idx_orders_user_id
    ON orders(user_id);

CREATE INDEX idx_orders_created_at
    ON orders(created_at);

CREATE INDEX idx_orders_status
    ON orders(order_status);

CREATE INDEX idx_order_items_order_id
    ON order_items(order_id);

CREATE INDEX idx_order_items_product_id
    ON order_items(product_id);


-- ============================================
-- GOOSE DOWN
-- ============================================

-- +goose Down

DROP TABLE IF EXISTS order_items;

DROP TABLE IF EXISTS orders;

DROP SEQUENCE IF EXISTS order_number_seq;

DROP TABLE IF EXISTS products;

DROP TABLE IF EXISTS categories;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS roles;