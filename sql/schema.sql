-- Campus Complaint Management System — MySQL 8.0+
-- Run against a fresh database. For an older MongoDB-era database, see
-- sql/migrations/001_mongo_to_neo4j_reference.sql before running this file.

CREATE DATABASE IF NOT EXISTS campus_complaints
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE campus_complaints;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  graph_ref_id CHAR(36) NOT NULL,
  category_id INT NOT NULL,
  filed_by INT NULL,
  assigned_to INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_complaints_graph_ref UNIQUE (graph_ref_id),
  CONSTRAINT fk_complaints_category FOREIGN KEY (category_id)
    REFERENCES complaint_categories(id),
  CONSTRAINT fk_complaints_filer FOREIGN KEY (filed_by)
    REFERENCES users(id),
  CONSTRAINT fk_complaints_assignee FOREIGN KEY (assigned_to)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_complaint_status CHECK
    (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT chk_complaint_anonymity CHECK
    ((is_anonymous = TRUE AND filed_by IS NULL) OR
     (is_anonymous = FALSE AND filed_by IS NOT NULL)),
  INDEX idx_complaints_status (status),
  INDEX idx_complaints_category (category_id),
  INDEX idx_complaints_filer (filed_by),
  INDEX idx_complaints_assignee (assigned_to),
  INDEX idx_complaints_created (created_at)
) ENGINE=InnoDB;

-- Idempotent reference data. No fake login accounts are inserted here.
INSERT IGNORE INTO roles (name) VALUES ('student'), ('admin');
INSERT IGNORE INTO complaint_categories (name) VALUES
  ('lost_item'), ('found_item'), ('maintenance'), ('ragging');

DROP TRIGGER IF EXISTS trg_update_last_updated;
DELIMITER $$
CREATE TRIGGER trg_update_last_updated
BEFORE UPDATE ON complaints
FOR EACH ROW
BEGIN
  SET NEW.last_updated = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

CREATE OR REPLACE VIEW open_complaints_summary AS
SELECT cc.name AS category, COUNT(*) AS open_count
FROM complaints c
JOIN complaint_categories cc ON cc.id = c.category_id
WHERE c.status IN ('open', 'assigned', 'in_progress')
GROUP BY cc.name;
