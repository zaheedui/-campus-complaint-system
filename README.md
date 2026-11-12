# Campus Complaint Management System

A role-based complaint management system for campus lost & found, hostel maintenance, and ragging reports. It uses two databases, each for the kind of data it handles best: MySQL for structured workflow data and Neo4j (a graph database) for complaint content and lost/found matching. The interface is built with Next.js.

## Tech Stack
- **Frontend and backend:** Next.js (App Router, TypeScript)
- **SQL database:** MySQL 8.0 (Docker) for users, roles, categories, complaint status and assignment
- **NoSQL database:** Neo4j 5 (Docker) for complaint content as a graph of complaints, categories and locations
- **Auth:** NextAuth (Credentials provider, JWT sessions, bcrypt password hashing)

## Prerequisites
- Node.js (v18 or newer)
- Docker Desktop (running)
- MySQL Workbench (to run the schema script)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaheedui/-campus-complaint-system.git
   cd ./-campus-complaint-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your environment file**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and set these values. They match the Docker setup below:
   ```env
   DATABASE_URL="mysql://appuser:apppass@localhost:3307/campus_complaints"
   NEO4J_URI="bolt://localhost:7687"
   NEO4J_USER="neo4j"
   NEO4J_PASSWORD="neo4jpass123"
   NEXTAUTH_SECRET="any-long-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_SIGNUP_CODE="choose-a-code"
   ```

4. **Start the databases**
   ```bash
   docker compose up -d
   docker ps
   ```
   You should see two containers: `mysql:8.0` (port 3307) and `neo4j:5` (ports 7474 and 7687). Wait about a minute for Neo4j to finish starting.

5. **Create the MySQL schema and advanced SQL objects**
   In MySQL Workbench, connect to `127.0.0.1`, port `3307`, user `root`, password `rootpass` (local Docker demo only). Run these scripts in order:
   - `sql/schema.sql` — tables, keys, constraints, indexes, trigger and view.
   - `sql/advanced.sql` — procedure, function, CTE, recursive CTE, nested/correlated queries and joins.
   - `sql/database_rbac.sql` — database roles, role grants and separate test accounts.

   The application itself connects as `appuser` using `DATABASE_URL`. For an existing database from the older MongoDB version, first run `sql/migrations/001_mongo_to_neo4j_reference.sql` and `sql/migrations/002_add_graph_integrity_constraints.sql` as root. Do not run these migrations on a fresh database.

6. **Set up Neo4j**
   Open the Neo4j Browser at `http://localhost:7474` and log in with `neo4j` / `neo4jpass123`. Paste the contents of `neo4j/setup.cypher` into the command bar and run it. This creates the constraints, the full-text index and the four categories.

7. **Run the app**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## Verifying Everything Works
- Visit `/api/health`. It should return `{"mysql":"ok","neo4j":"ok"}`.
- Sign up a student at `/signup`, log in, and file a complaint at `/file-complaint`.
- Sign up an admin using the configured `ADMIN_SIGNUP_CODE`, log in, and open `/admin`.
- Run `sql/dml_operations.sql` as `appuser` to demonstrate INSERT, SELECT, UPDATE and DELETE. The script uses a transaction and rolls its test row back.
- Run `sql/database_rbac.sql` as MySQL root. Then connect separately as `campus_student` and `campus_admin`; run `SELECT CURRENT_ROLE()` and verify that a student UPDATE is denied while an admin UPDATE is allowed. The demo passwords in that file must be changed before any non-local use.
- Run the SQL statements in `sql/advanced.sql` in Workbench and capture fresh result screenshots for your submission.

## Accounts
Create application accounts at `/signup`. Admin registration requires the `ADMIN_SIGNUP_CODE`. The schema intentionally does not insert fake application accounts; register real users through the application so passwords are stored as bcrypt hashes. The separate `campus_student` and `campus_admin` MySQL accounts created by `sql/database_rbac.sql` are database-permission demonstration accounts, not website login accounts.

## Project Structure
```
app/
  api/            backend routes (auth, complaints, admin, health)
  login/          login page
  signup/         signup page
  dashboard/      role-aware landing page after login
  file-complaint/ student complaint filing form
  my-complaints/  student's own complaint history
  admin/          admin dashboard
lib/              shared MySQL and Neo4j connection helpers
sql/              MySQL schema, DML demos, advanced SQL, RBAC and migrations
neo4j/            Neo4j setup script (setup.cypher)
docs/             report, data dictionary, test cases, ER diagram, screenshots
```

## Database Architecture
A complaint is split across the two databases and linked by one shared id: the MySQL column `complaints.graph_ref_id` equals the `refId` of the matching `Complaint` node in Neo4j.

- **MySQL** holds the structured, consistency-critical data: who filed what, current status, who is assigned. It enforces this with foreign keys, a CHECK constraint, a transaction, a trigger and a view.
- **Neo4j** holds the report content as a graph: `Complaint` nodes linked to `Category` and `Location` nodes. Lost and found reports that share a location are connected through the same node, and a full-text index on descriptions powers the matching feature.

See `docs/PROJECT_REPORT.md` for the full justification and `docs/er-diagram.md` for the ER diagram.


## Rubric Coverage (50 marks)
| Rubric | Evidence in this repository |
|---|---|
| ER diagram | `docs/er-diagram.md` and `docs/screenshots/` |
| Relational schema, keys and constraints | `sql/schema.sql`, `docs/data-dictionary.md` |
| SQL DDL | `sql/schema.sql` |
| NoSQL database creation | `neo4j/setup.cypher` and Docker Neo4j service |
| Technology justification | `docs/PROJECT_REPORT.md` §8 |
| DML (INSERT/SELECT/UPDATE/DELETE) | `sql/dml_operations.sql` |
| Nested, correlated, recursive and JOIN queries | `sql/advanced.sql` |
| Procedure, function, trigger and CTE | `sql/advanced.sql` and `sql/schema.sql` |
| NoSQL RUD and graph features | `neo4j/setup.cypher`, API routes and `docs/PROJECT_REPORT.md` §9–11 |
| Next.js interface | `app/` and `components/` |
| Backend/API integration | `app/api/`, `lib/mysql.js`, `lib/neo4j.ts` |
| Authentication and two application roles | `app/api/auth/`, `middleware.ts`, `lib/authz.ts` |
| Database-level RBAC | `sql/database_rbac.sql` (separate test accounts and role grants) |
| Documentation and GitHub | `README.md`, `docs/`, GitHub repository history |
| Individual contribution and viva | Complete §16 in `docs/PROJECT_REPORT.md` with each member's real work; demonstrate live modifications |

**Important:** A ZIP file cannot prove Git commit history or personal contribution. Keep the original repository history and fill in every team member's contribution truthfully. Runtime marks also require running the services and collecting fresh execution evidence; source code alone does not prove that a database query succeeded.
