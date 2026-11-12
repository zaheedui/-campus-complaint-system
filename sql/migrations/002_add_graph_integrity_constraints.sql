-- Run after 001_mongo_to_neo4j_reference.sql on a pre-existing database.
-- Adds the integrity guarantees present in the fresh-install schema.
USE campus_complaints;

SET @has_graph_unique := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'complaints'
    AND index_name = 'uq_complaints_graph_ref'
);
SET @ddl := IF(@has_graph_unique = 0,
  'ALTER TABLE complaints ADD CONSTRAINT uq_complaints_graph_ref UNIQUE (graph_ref_id)',
  'SELECT ''Graph reference unique constraint already exists'' AS migration_status');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_anonymity_check := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE constraint_schema = DATABASE() AND table_name = 'complaints'
    AND constraint_name = 'chk_complaint_anonymity'
);
SET @ddl := IF(@has_anonymity_check = 0,
  'ALTER TABLE complaints ADD CONSTRAINT chk_complaint_anonymity CHECK ((is_anonymous = TRUE AND filed_by IS NULL) OR (is_anonymous = FALSE AND filed_by IS NOT NULL))',
  'SELECT ''Anonymity check already exists'' AS migration_status');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
