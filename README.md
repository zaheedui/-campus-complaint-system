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

5. **Create the MySQL schema**
   In MySQL Workbench, connect to `127.0.0.1`, port `3307`, user `appuser`, password `apppass`. Open `sql/schema.sql` and run the whole script.

6. **Set up Neo4j**
   Open the Neo4j Browser at `http://localhost:7474` and log in with `neo4j` / `neo4jpass123`. Paste the contents of `neo4j/setup.cypher` into the command bar and run it. This creates the constraints, the full-text index and the four categories.

7. **Run the app**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`....

## Verifying Everything Works
- Visit `/api/health`. It should return `{"mysql":"ok","neo4j":"ok"}`.
- Sign up a student at `/signup`, log in, and file a complaint at `/file-complaint`.
- Sign up an admin, log in, and open `/admin` to see the complaint list, the open-complaints summary and the lost/found match check.

## Accounts
Create accounts at `/signup` and choose the **Student** or **Admin** role. The two sample rows in `sql/schema.sql` (`student@test.com` and `admin@test.com`) have placeholder password hashes and cannot be used to log in.

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
sql/              MySQL schema (schema.sql)
neo4j/            Neo4j setup script (setup.cypher)
docs/             report, data dictionary, test cases, ER diagram, screenshots
```

## Database Architecture
A complaint is split across the two databases and linked by one shared id: the MySQL column `complaints.graph_ref_id` equals the `refId` of the matching `Complaint` node in Neo4j.

- **MySQL** holds the structured, consistency-critical data: who filed what, current status, who is assigned. It enforces this with foreign keys, a CHECK constraint, a transaction, a trigger and a view.
- **Neo4j** holds the report content as a graph: `Complaint` nodes linked to `Category` and `Location` nodes. Lost and found reports that share a location are connected through the same node, and a full-text index on descriptions powers the matching feature.

See `docs/PROJECT_REPORT.md` for the full justification and `docs/er-diagram.md` for the ER diagram.
