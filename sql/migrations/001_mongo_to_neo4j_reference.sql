-- Run ONLY on an existing database created by the earlier MongoDB version.
-- This migration is safe to rerun: it renames the old column only if needed.
USE campus_complaints;

SET @has_old := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'complaints'
    AND column_name = 'mongo_ref_id'
);
SET @has_new := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'complaints'
    AND column_name = 'graph_ref_id'
);
SET @migration_sql := IF(@has_old = 1 AND @has_new = 0,
  'ALTER TABLE complaints RENAME COLUMN mongo_ref_id TO graph_ref_id',
  'SELECT ''No reference-column migration required'' AS migration_status');
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
