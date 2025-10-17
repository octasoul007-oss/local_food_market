CREATE DATABASE IF NOT EXISTS local_food_marketplace;
USE local_food_marketplace;

-- Users table (both farmers and buyers)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,                                                -- PK [web:6]
  email VARCHAR(255) NOT NULL UNIQUE,                                               -- unique email [web:6]
  password VARCHAR(255) NOT NULL,                                                   -- hashed password [web:6]
  user_type ENUM('farmer','buyer') NOT NULL,                                        -- role enum [web:6]
  name VARCHAR(255) NOT NULL,                                                       -- full name [web:6]

  -- Store phone as text and validate 10 digits (adjust regex for your locale)
  phone VARCHAR(15) DEFAULT NULL,                                                   -- allow +country codes if needed [web:10]
  CONSTRAINT chk_phone_10_digits CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$'), -- exactly 10 digits [web:10]

  address TEXT,                                                                     -- free-form address [web:6]
  city VARCHAR(100),                                                                -- city [web:6]
  state VARCHAR(100),                                                               -- state [web:6]
  pincode VARCHAR(10),                                                              -- postal code as text [web:6]

  -- Coordinate precision: lat [-90,90], lon [-180,180]
  latitude  DECIMAL(10,8),                                                          -- lat with ~cm precision [web:8]
  longitude DECIMAL(11,8),                                                          -- lon with ~cm precision [web:8]
  CONSTRAINT chk_lat_range CHECK (latitude  IS NULL OR (latitude  >= -90  AND latitude  <= 90)),   -- valid range [web:11]
  CONSTRAINT chk_lon_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),  -- valid range [web:11]

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,                          -- auto init [web:6]
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- auto update [web:6]
);

-- Farmer profiles
CREATE TABLE farmer_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  farm_name VARCHAR(255),
  farm_size DECIMAL(10, 2),
  farm_description TEXT,
  delivery_radius INT DEFAULT 50,
  profile_image VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Products
CREATE TABLE products(
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  quantity_available DECIMAL(10, 2) DEFAULT 0,
  image VARCHAR(255),
  is_organic BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Availability calendar
CREATE TABLE availability_calendar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  product_id INT,
  available_date DATE NOT NULL,
  quantity DECIMAL(10, 2),
  notes TEXT,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  farmer_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
  delivery_address TEXT,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Messages
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  buyer_id INT NOT NULL,
  order_id INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Inventory tracking
CREATE TABLE inventory_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  change_type ENUM('add', 'remove', 'sale') NOT NULL,
  quantity_change DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
