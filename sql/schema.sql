-- ============================================================
-- Campus Complaint Management System — MySQL Schema
-- Structured, consistency-critical workflow data
-- ============================================================

USE campus_complaints;

-- ============================
-- Tables
-- ============================

-- User roles: student or admin
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL
);

-- All registered users (students and admins share this table, distinguished by role_id)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,       -- bcrypt hash, never plaintext
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- The four complaint categories the system supports
CREATE TABLE complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Core workflow table: one row per complaint, linked to its full
-- content in MongoDB via mongo_ref_id
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mongo_ref_id VARCHAR(50) NOT NULL,          -- links to MongoDB complaintreports._id
  category_id INT NOT NULL,
  filed_by INT,                                -- NULL when is_anonymous = TRUE
  assigned_to INT,                             -- admin handling this complaint
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- auto-updated by trigger below
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

-- Note: these are placeholder test accounts with fake password hashes,
-- kept only for early development/testing. Real accounts are created
-- via the /signup page, which properly bcrypt-hashes passwords.
INSERT INTO users (name, email, password_hash, role_id) VALUES
  ('Test Student', 'student@test.com', 'placeholder_hash_1', 1),
  ('Test Admin', 'admin@test.com', 'placeholder_hash_2', 2);

-- ============================
-- Trigger: auto-update last_updated on any row change
-- Advanced feature #2 — demonstrates automatic auditing at the DB level
-- ============================

DELIMITER $$

CREATE TRIGGER trg_update_last_updated
BEFORE UPDATE ON complaints
FOR EACH ROW
BEGIN
  SET NEW.last_updated = NOW();
END$$

DELIMITER ;

-- ============================
-- View: open complaints summary, for admin dashboard
-- Advanced feature #3 — derived, always-current aggregate data
-- ============================

CREATE VIEW open_complaints_summary AS
SELECT cc.name AS category, COUNT(*) AS open_count
FROM complaints c
JOIN complaint_categories cc ON c.category_id = cc.id
WHERE c.status IN ('open', 'assigned', 'in_progress')
GROUP BY cc.name;