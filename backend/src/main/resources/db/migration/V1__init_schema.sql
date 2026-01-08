CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(255) NOT NULL
);

CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT,
    symbol VARCHAR(255),
    quantity FLOAT8,
    CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    symbol VARCHAR(255),
    type VARCHAR(50),
    category VARCHAR(50),
    quantity FLOAT8,
    price FLOAT8,
    target_price FLOAT8,
    status VARCHAR(50),
    timestamp TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE price_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    symbol VARCHAR(255),
    target_price FLOAT8,
    condition VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    CONSTRAINT fk_alert_user FOREIGN KEY (user_id) REFERENCES users(id)
);
