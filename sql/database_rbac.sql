-- Database-level RBAC demonstration (MySQL 8.0+).
-- Run as MySQL root/admin after schema.sql and advanced.sql.
-- Change the demonstration passwords before using this outside a local demo.
USE campus_complaints;

CREATE ROLE IF NOT EXISTS 'student_role', 'admin_role';

-- Least-privilege student permissions. Application logic additionally restricts
-- each student to their own complaints; MySQL table grants alone are not row-level.
GRANT SELECT ON campus_complaints.complaint_categories TO 'student_role';
GRANT SELECT, INSERT ON campus_complaints.complaints TO 'student_role';

-- Admin role can manage all project tables and execute the stored routine.
GRANT ALL PRIVILEGES ON campus_complaints.* TO 'admin_role';
GRANT EXECUTE ON PROCEDURE campus_complaints.assign_complaint TO 'admin_role';

-- Separate database identities make the role grants testable in Workbench.
CREATE USER IF NOT EXISTS 'campus_student'@'%' IDENTIFIED BY 'CHANGE_THIS_BEFORE_RUNNING';
CREATE USER IF NOT EXISTS 'campus_admin'@'%' IDENTIFIED BY 'CHANGE_THIS_BEFORE_RUNNING';
GRANT 'student_role' TO 'campus_student'@'%';
GRANT 'admin_role' TO 'campus_admin'@'%';
SET DEFAULT ROLE 'student_role' TO 'campus_student'@'%';
SET DEFAULT ROLE 'admin_role' TO 'campus_admin'@'%';

SHOW GRANTS FOR 'student_role';
SHOW GRANTS FOR 'admin_role';
SHOW GRANTS FOR 'campus_student'@'%';
SHOW GRANTS FOR 'campus_admin'@'%';

-- Verification (run separately after connecting as each account):
-- SELECT CURRENT_ROLE();
-- SELECT * FROM campus_complaints.complaint_categories; -- student: allowed
-- UPDATE campus_complaints.complaints SET status='closed' WHERE id=1; -- student: denied
-- UPDATE campus_complaints.complaints SET status='closed' WHERE id=1; -- admin: allowed
-- IMPORTANT: The Next.js server uses DATABASE_URL's appuser service account.
-- These named accounts demonstrate actual MySQL role enforcement independently;
-- API-level authorization remains mandatory for per-student row ownership.
