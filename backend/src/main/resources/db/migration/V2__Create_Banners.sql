CREATE TABLE banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    subtitle VARCHAR(320),
    button_label VARCHAR(60),
    target_url VARCHAR(1000),
    image_url VARCHAR(500) NOT NULL,
    image_filename VARCHAR(500) NOT NULL,
    image_alt_text VARCHAR(255),
    display_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_active_display_order ON banners(active, display_order);
