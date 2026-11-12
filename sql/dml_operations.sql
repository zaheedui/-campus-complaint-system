-- DML demonstration for rubric criterion 6 (MySQL 8.0+).
-- Uses one synthetic anonymous row and rolls the transaction back at the end,
-- so the demonstration does not leave test data in the real project database.
USE campus_complaints;
START TRANSACTION;

-- 1. INSERT: create a temporary test complaint.
INSERT INTO complaints
  (graph_ref_id, category_id, filed_by, assigned_to, status, is_anonymous)
SELECT '00000000-0000-4000-8000-000000000006', id, NULL, NULL, 'open', TRUE
FROM complaint_categories WHERE name = 'ragging';

-- 2. SELECT: read the inserted row with its category.
SELECT c.id, c.graph_ref_id, cc.name AS category, c.status, c.is_anonymous
FROM complaints c
JOIN complaint_categories cc ON cc.id = c.category_id
WHERE c.graph_ref_id = '00000000-0000-4000-8000-000000000006';

-- 3. UPDATE: change the temporary row's status.
UPDATE complaints
SET status = 'in_progress'
WHERE graph_ref_id = '00000000-0000-4000-8000-000000000006';

SELECT id, status, last_updated
FROM complaints
WHERE graph_ref_id = '00000000-0000-4000-8000-000000000006';

-- 4. DELETE: remove the temporary row.
DELETE FROM complaints
WHERE graph_ref_id = '00000000-0000-4000-8000-000000000006';

-- Verify that the test row is gone, then undo any remaining test changes.
SELECT COUNT(*) AS remaining_test_rows
FROM complaints
WHERE graph_ref_id = '00000000-0000-4000-8000-000000000006';
ROLLBACK;
