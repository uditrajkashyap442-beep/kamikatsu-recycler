-- Kamikatsu Zero-Waste Navigator Database Schema
-- PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enum Types
CREATE TYPE cost_status AS ENUM ('free', 'paid', 'donation');
CREATE TYPE item_classification AS ENUM ('hazardous', 'recyclable', 'compostable', 'reusable');

-- Main Types Table
CREATE TABLE main_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50),
  color_hex VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  main_type_id INTEGER NOT NULL REFERENCES main_types(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  disposal_method TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  classification item_classification,
  cost_status cost_status DEFAULT 'free',
  kurukuru_location VARCHAR(255),
  home_only BOOLEAN DEFAULT FALSE,
  preparation_steps TEXT,
  image_url VARCHAR(500),
  search_vector tsvector,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Scans Log Table
CREATE TABLE qr_scans (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_session_id VARCHAR(100),
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_categories_main_type ON categories(main_type_id);
CREATE INDEX idx_products_search ON products USING gin(search_vector);
CREATE INDEX idx_qr_scans_product ON qr_scans(product_id);

-- Trigger for full-text search
CREATE OR REPLACE FUNCTION products_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_trigger BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_update();

-- Seed Data
INSERT INTO main_types (name, icon_name, color_hex) VALUES
('Combustibles', 'flame', '#FF6B35'),
('Metals', 'circle', '#FFD700'),
('Glass', 'bottle', '#87CEEB'),
('Ceramics & Pottery', 'bowl', '#CD853F'),
('Plastics', 'square', '#FF69B4'),
('Rubber & Leather', 'circle', '#8B4513'),
('Textiles', 'shirt', '#9370DB'),
('Paper & Cardboard', 'file', '#DAA520'),
('Wood & Bamboo', 'tree', '#228B22'),
('Garden Waste', 'leaf', '#32CD32'),
('Food Scraps', 'apple', '#FF4500'),
('Hazardous Waste', 'warning', '#DC143C'),
('Used Goods (Reusable)', 'recycle', '#20B2AA');

INSERT INTO categories (main_type_id, code, name, description, disposal_method) VALUES
(1, 'CB01', 'Cardboard', 'Flattened cardboard boxes', 'Flatten and bundle'),
(1, 'CB02', 'Paper', 'Newspaper and paper waste', 'Bundle or bag'),
(2, 'MT01', 'Steel Cans', 'Food/beverage cans', 'Rinse and place in bag'),
(2, 'MT02', 'Aluminum', 'Aluminum cans and foil', 'Rinse and flatten'),
(3, 'GL01', 'Clear Glass', 'Clear glass bottles', 'Rinse, no lids'),
(3, 'GL02', 'Colored Glass', 'Brown, green glass', 'Separate by color'),
(4, 'CR01', 'Ceramics', 'Plates, bowls, pottery', 'Wrap in newspaper'),
(4, 'CR02', 'Porcelain', 'Fine porcelain items', 'Handle carefully'),
(5, 'PL01', 'PET Plastic', 'Water bottles, soft drinks', 'Rinse, flatten'),
(5, 'PL02', 'HDPE Plastic', 'Milk jugs, detergent bottles', 'Rinse and flatten'),
(6, 'RB01', 'Rubber', 'Rubber items', 'Place in designated bin'),
(6, 'LE01', 'Leather', 'Leather goods', 'Clean before disposal'),
(7, 'TX01', 'Cotton Textiles', 'Cotton clothing', 'Bundle together'),
(7, 'TX02', 'Mixed Textiles', 'Poly/cotton blends', 'Bundle together'),
(8, 'PD01', 'Pamphlets', 'Small paper items', 'Bag or bundle'),
(9, 'WD01', 'Wood Scraps', 'Small wood pieces', 'Tie in bundle'),
(10, 'GD01', 'Leaves & Branches', 'Garden vegetation', 'Tie in bundle'),
(11, 'FS01', 'Food Waste', 'Vegetable scraps, etc', 'Place in bin');

INSERT INTO products (category_id, name, description, classification, cost_status, home_only, preparation_steps, image_url) VALUES
(1, 'Cardboard Boxes', 'Flattened shipping boxes', 'recyclable', 'free', FALSE, 'Flatten and remove tape. Stack neatly.', NULL),
(1, 'Newspaper', 'Old newspapers and magazines', 'recyclable', 'free', FALSE, 'Bundle with twine. Keep dry.', NULL),
(2, 'Beer Cans', 'Aluminum beer cans', 'recyclable', 'free', FALSE, 'Rinse inside. Crush if desired. Flatten.', NULL),
(2, 'Soda Cans', 'Aluminum soda cans', 'recyclable', 'free', FALSE, 'Rinse and flatten. Remove labels if needed.', NULL),
(3, 'Clear Wine Bottles', 'Clear glass wine bottles', 'recyclable', 'free', FALSE, 'Remove cork. Rinse thoroughly. No labels needed.', NULL),
(4, 'Brown Beer Bottles', 'Brown glass bottles', 'recyclable', 'free', FALSE, 'Rinse and separate by color. Remove caps.', NULL),
(5, 'Ceramic Plates', 'Unwanted ceramic dinnerware', 'recyclable', 'free', TRUE, 'Wrap each plate in newspaper. Secure with tape.', NULL),
(6, 'Rubber Bands', 'Old rubber bands', 'recyclable', 'free', FALSE, 'Bundle together in a bag.', NULL),
(7, 'Cotton T-Shirts', 'Used cotton clothing', 'reusable', 'free', FALSE, 'Wash and dry. Fold neatly.', NULL),
(8, 'Old Pamphlets', 'Flyers and brochures', 'recyclable', 'free', FALSE, 'No binding removal needed. Stack and bag.', NULL),
(9, 'Wood Scrap', 'Small pieces of untreated wood', 'recyclable', 'free', FALSE, 'Bundle with twine. Keep dry.', NULL),
(10, 'Fall Leaves', 'Autumn leaves for composting', 'compostable', 'free', FALSE, 'Bag or bundle. Do not include branches.', NULL),
(11, 'Vegetable Scraps', 'Carrot peels, lettuce trimmings', 'compostable', 'free', FALSE, 'Keep in sealed container. Avoid meat/dairy.', NULL);

-- Sample QR scans
INSERT INTO qr_scans (product_id, user_session_id) VALUES
(1, 'user_session_001'),
(2, 'user_session_001'),
(3, 'user_session_002');
