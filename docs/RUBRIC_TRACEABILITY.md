# DBMS Evaluation Rubric — Traceability Matrix

This matrix maps each of the 14 evaluation criteria to the implementation and the evidence to demonstrate. It does not claim a runtime test passed unless a fresh result is recorded in `test-cases.md`.

| # | Criterion | Implementation / evidence | Live demonstration |
|---|---|---|---|
| 1 | ER diagram (2) | `docs/er-diagram.md`, `docs/screenshots/project_er_diagram.png` | Explain entities, cardinalities and the MySQL–Neo4j reference link. |
| 2 | Relational schema with keys, relationships and constraints (3) | `sql/schema.sql`, `docs/data-dictionary.md` | Show PK, FK, UNIQUE, CHECK, NOT NULL and indexes in Workbench. |
| 3 | SQL database implementation / DDL (4) | `sql/schema.sql` | Execute the schema on a fresh MySQL 8 database and show tables, trigger and view. |
| 4 | NoSQL/Vector database creation (4) | `docker-compose.yml`, `neo4j/setup.cypher` | Show Neo4j labels, relationships, constraints and full-text index. Neo4j is the project's NoSQL graph database. |
| 5 | Technology justification (1) | `docs/PROJECT_REPORT.md` §8 | Explain why workflow data is relational and report content/matching is graph-oriented. |
| 6 | DML operations (4) | `sql/dml_operations.sql` | Run INSERT, SELECT, UPDATE and DELETE; verify the test row is gone and transaction rolls back. |
| 7 | Nested/correlated/recursive/JOIN queries (4) | `sql/advanced.sql` | Execute and explain each query block and its output. |
| 8 | Procedure/function/trigger/CTE (6) | `sql/advanced.sql`, `sql/schema.sql` | Call `assign_complaint`, call `days_open`, update a row to fire the trigger, run both CTE queries. |
| 9 | NoSQL features and RUD (7) | `neo4j/setup.cypher`, `app/api/complaints/route.ts`, `app/api/complaints/[id]/route.ts`, `app/api/complaints/[id]/matches/route.ts` | Create, read, edit, delete a complaint and demonstrate full-text lost/found matching in Neo4j. |
| 10 | Next.js interface (3) | `app/`, `components/` | Demonstrate login, student dashboard, filing, complaint list and admin dashboard. |
| 11 | Backend/API and database integration (2) | `app/api/`, `lib/mysql.js`, `lib/neo4j.ts` | File a complaint and show its linked MySQL row and Neo4j node. |
| 12 | Authentication, two roles and database RBAC (4) | `app/api/auth/`, `middleware.ts`, `lib/authz.ts`, `sql/database_rbac.sql` | Demonstrate student/admin website access plus MySQL `CURRENT_ROLE()` and permission-denied student UPDATE. |
| 13 | Documentation and Git/GitHub (2) | `README.md`, `docs/`, GitHub repository | Show the README, report, data dictionary, test plan and actual commit history. |
| 14 | Originality, individual contribution, modification/viva (4) | Application-specific lost/found matching, anonymous filing, role workflows and graph model; `docs/VIVA_GUIDE.md` | Explain and make a small live modification. Each member must truthfully explain their own commits and contribution. |

## Submission blockers to close manually

1. Run the final SQL scripts and application; replace pending test results with actual results.
2. Capture fresh screenshots for the new DML and database-RBAC demonstrations.
3. Complete the real contribution of every team member in `docs/PROJECT_REPORT.md` §16. Do not copy another member's contribution.
4. Push the modified files to the original GitHub repository so the teacher can inspect the real commit history.
