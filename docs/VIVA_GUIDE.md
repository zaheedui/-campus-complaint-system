# DBMS Viva and Live Demonstration Guide

Use the same final code and databases that will be submitted. Do not claim a feature passed until it has been run in the current environment.

## Suggested 8–10 minute demonstration

1. **Architecture (45 seconds):** Explain Next.js → API → MySQL + Neo4j. MySQL owns users, roles, category, status and assignment. Neo4j owns complaint text, category/location graph links and full-text matching.
2. **ER/schema (60 seconds):** Open `docs/er-diagram.md`; show primary keys, foreign keys, unique graph reference, status CHECK and anonymity CHECK in `sql/schema.sql`.
3. **DML (45 seconds):** Run `sql/dml_operations.sql`; point out INSERT, SELECT, UPDATE, DELETE and the final rollback.
4. **Advanced SQL (90 seconds):** In `sql/advanced.sql`, demonstrate the nested query, correlated query, multi-table JOIN, CTE and recursive CTE.
5. **Procedure/function/trigger (60 seconds):** With valid test records, run `CALL assign_complaint(<complaint_id>, <admin_user_id>);`, `SELECT days_open(<complaint_id>);`, and update a complaint to show `last_updated` changes automatically.
6. **Neo4j (90 seconds):** Show constraints/indexes, create/read/update/delete operations and the lost/found match query. Explain `IN_CATEGORY` and `AT_LOCATION`.
7. **Authentication/RBAC (90 seconds):** Sign in as a student and admin. Show page/API restrictions. Separately connect to MySQL as `campus_student` and `campus_admin`, run `SELECT CURRENT_ROLE();`, then show the student UPDATE is denied and admin UPDATE is allowed.
8. **Integration (45 seconds):** File one report; show the same `graph_ref_id` in MySQL and `refId` in Neo4j. Explain the compensating rollback on filing failure and the transaction around deletion.
9. **Contribution (30 seconds):** Each member identifies their own files, commits, and one feature they can modify live.

## SQL snippets for the viva

```sql
USE campus_complaints;
SHOW TABLES;
SHOW CREATE TABLE complaints;
SHOW TRIGGERS;
SELECT * FROM open_complaints_summary;
SELECT CURRENT_ROLE();
```

For the procedure, use IDs that exist in the database:

```sql
SELECT id, name, email FROM users;
SELECT id, status FROM complaints;
CALL assign_complaint(<complaint_id>, <admin_user_id>);
SELECT days_open(<complaint_id>);
```

For the role demonstration, run `sql/database_rbac.sql` as root first. Connect as `campus_student` and execute:

```sql
SELECT CURRENT_ROLE();
SELECT * FROM campus_complaints.complaint_categories;
UPDATE campus_complaints.complaints SET status = 'closed' WHERE id = 1;
```

The final UPDATE is expected to fail for the student account. Connect as `campus_admin` and repeat the UPDATE against a disposable test row; it should be permitted.

## Questions to prepare for

- Why use MySQL and Neo4j together instead of storing everything in one database?
- What is the difference between a primary key and a foreign key?
- Why is `graph_ref_id` unique, and how does it connect the two databases?
- Why can a foreign key not enforce a relationship to a Neo4j node?
- What is the difference between a nested query and a correlated query?
- What does a recursive CTE do in this project?
- What is the difference between a stored procedure, function, trigger and view?
- How does the application prevent a student from reading another student's complaint?
- How do MySQL roles differ from application roles in the NextAuth session?
- What happens if the MySQL insert fails after Neo4j creates a node?
- How does the full-text index contribute to lost/found matching?
- What would you change if the number of complaints increased substantially?

## Individual contribution

Each team member should prepare a truthful list of files/features they personally implemented, their Git commits, one design decision they made, and one small change they can perform without assistance. Update §16 of the project report accordingly.
