-- ============================================================
-- advanced.sql  (run in MySQL Workbench after schema.sql)
-- Covers: procedure, function, CTE, recursive CTE, nested,
-- correlated queries and multi-table joins
-- ============================================================
USE campus_complaints;

-- ---------- FUNCTION ----------
DROP FUNCTION IF EXISTS days_open;
DELIMITER $$
CREATE FUNCTION days_open(p_id INT) RETURNS INT
READS SQL DATA
BEGIN
  DECLARE d INT;
  SELECT DATEDIFF(NOW(), created_at) INTO d FROM complaints WHERE id = p_id;
  RETURN d;
END$$
DELIMITER ;

-- ---------- STORED PROCEDURE ----------
DROP PROCEDURE IF EXISTS assign_complaint;
DELIMITER $$
CREATE PROCEDURE assign_complaint(IN p_complaint INT, IN p_admin INT)
BEGIN
  DECLARE v_role VARCHAR(20) DEFAULT NULL;
  DECLARE v_complaint_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_complaint_count
  FROM complaints WHERE id = p_complaint;
  IF v_complaint_count = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Complaint does not exist';
  END IF;

  SELECT r.name INTO v_role
  FROM users u JOIN roles r ON u.role_id = r.id
  WHERE u.id = p_admin;
  IF v_role IS NULL OR v_role <> 'admin' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Assignee must be an admin';
  END IF;

  UPDATE complaints
  SET assigned_to = p_admin, status = 'assigned'
  WHERE id = p_complaint;
END$$
DELIMITER ;
-- usage: CALL assign_complaint(1, 2);  SELECT days_open(1);

-- ---------- CTE ----------
WITH category_stats AS (
  SELECT category_id, COUNT(*) AS total,
         SUM(status IN ('resolved','closed')) AS resolved
  FROM complaints GROUP BY category_id
)
SELECT cc.name AS category, s.total, s.resolved,
       ROUND(100 * s.resolved / s.total, 1) AS resolution_pct
FROM category_stats s JOIN complaint_categories cc ON cc.id = s.category_id
ORDER BY resolution_pct DESC;

-- ---------- RECURSIVE CTE (complaints per day, last 7 days) ----------
WITH RECURSIVE days AS (
  SELECT CURDATE() - INTERVAL 6 DAY AS d
  UNION ALL
  SELECT d + INTERVAL 1 DAY FROM days WHERE d < CURDATE()
)
SELECT days.d AS day, COUNT(c.id) AS complaints_filed
FROM days LEFT JOIN complaints c ON DATE(c.created_at) = days.d
GROUP BY days.d ORDER BY days.d;

-- ---------- NESTED query (subquery in subquery) ----------
SELECT u.name, u.email
FROM users u
WHERE (SELECT COUNT(*) FROM complaints c WHERE c.filed_by = u.id) >
      (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM complaints
                             WHERE filed_by IS NOT NULL GROUP BY filed_by) t);

-- ---------- CORRELATED query ----------
-- Unresolved complaints that have been open longer than the average for their category
SELECT c.id, c.status, days_open(c.id) AS days_open
FROM complaints c
WHERE c.status IN ('open','assigned','in_progress')
  AND DATEDIFF(NOW(), c.created_at) >
      (SELECT AVG(DATEDIFF(NOW(), c2.created_at))
       FROM complaints c2 WHERE c2.category_id = c.category_id);

-- ---------- MULTI-TABLE JOIN ----------
SELECT c.id, cc.name AS category, c.status,
       filer.name AS filed_by, admin_u.name AS assigned_admin
FROM complaints c
JOIN complaint_categories cc ON cc.id = c.category_id
LEFT JOIN users filer   ON filer.id   = c.filed_by
LEFT JOIN users admin_u ON admin_u.id = c.assigned_to;

-- DML INSERT/SELECT/UPDATE/DELETE demonstration is in sql/dml_operations.sql.

-- Database-level roles and test accounts are implemented in
-- sql/database_rbac.sql. Run that file as a MySQL administrator after this file.
