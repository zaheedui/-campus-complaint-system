-- Campus Lost & Found + Complaint Management System
-- MySQL Schema (structured/workflow data)

USE campus_complaints;

-- ============================
-- Tables
-- ============================

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mongo_ref_id VARCHAR(50) NOT NULL,
  category_id INT NOT NULL,
  filed_by INT,
  assigned_to INT,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
  FOREIGN KEY (filed_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed'))
);

-- ============================
-- Indexes
-- ============================

CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category_id);

-- ============================
-- Seed data
-- ============================

INSERT INTO roles (name) VALUES ('student'), ('admin');

INSERT INTO complaint_categories (name) VALUES
  ('lost_item'), ('found_item'), ('maintenance'), ('ragging');

INSERT INTO users (name, email, password_hash, role_id) VALUES
  ('Test Student', 'student@test.com', 'placeholder_hash_1', 1),
  ('Test Admin', 'admin@test.com', 'placeholder_hash_2', 2);

-- ============================
-- Trigger: auto-update last_updated on any change
-- ============================

DELIMITER $$

CREATE TRIGGER trg_update_last_updated
BEFORE UPDATE ON complaints
FOR EACH ROW
BEGIN
  SET NEW.last_updated = NOW();
END$$

DELIMITER ;