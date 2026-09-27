# Campus Complaint Management System

A role-based complaint management system for campus lost & found, hostel maintenance, and ragging reports, built on a polyglot persistence architecture (MySQL + MongoDB) with a Next.js frontend.

## Tech Stack
- **Frontend/Backend:** Next.js (App Router, TypeScript)
- **SQL Database:** MySQL 8.0 (Docker) — structured workflow data
- **NoSQL Database:** MongoDB 7.0 (Docker) — flexible complaint report content
- **Auth:** NextAuth (Credentials provider, JWT sessions, bcrypt password hashing)

## Prerequisites
- Node.js (v18+)
- Docker Desktop (running)
- MySQL Workbench (optional, for inspecting the database)
- MongoDB Compass (optional, for inspecting collections)

## Setup Instructions

1. **Clone the repository**
```bash
   git clone https://github.com/zaheedui/-campus-complaint-system.git
   cd -campus-complaint-system
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
```bash
   cp .env.example .env.local
```
   Then edit `.env.local` if needed — default values already match the Docker Compose setup below, so no changes are required for local development.

4. **Start the databases**
```bash
   docker compose up -d
```
   Verify both containers are running:
```bash
   docker ps
```
   You should see `mysql:8.0` (port 3307) and `mongo:7.0` (port 27018).

5. **Create the MySQL schema**
   Open MySQL Workbench, connect to `127.0.0.1:3307` with user `appuser` / password `apppass`, and run the full script in `sql/schema.sql`.

   *(Alternatively, from the command line: `docker exec -i campus-complaint-system-mysql-1 mysql -uappuser -papppass campus_complaints < sql/schema.sql`)*

6. **Run the development server**
```bash
   npm run dev
```

7. **Open the app**
   Visit `http://localhost:3000`

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Student | student@test.com | *(set during your own signup/seeding)* |
| Admin | admin@test.com | *(set during your own signup/seeding)* |

*(Fill in the real passwords here once finalized, or note that fresh accounts can be created via `/signup`.)*

## Verifying Everything Works
- Visit `/api/health` — should return `{"mysql":"ok","mongo":"ok"}`
- Sign up a student account at `/signup`, log in, file a complaint at `/file-complaint`
- Sign up an admin account, log in, view all complaints and the open-complaints summary at `/admin`

## Project Structure
app/
api/ → backend routes (auth, complaints, admin)
login/ → login page
signup/ → signup page
dashboard/ → role-aware landing page after login
file-complaint/→ student complaint filing form
my-complaints/ → student's own complaint history
admin/ → admin dashboard
lib/ → shared MySQL/MongoDB connection helpers
models/ → Mongoose schema for complaint reports
sql/ → consolidated MySQL DDL (schema.sql)
docs/ → project report, data dictionary, test cases, screenshots


## Database Architecture
See `docs/PROJECT_REPORT.md` for the full justification, ER diagram, and data dictionary. In short: MySQL handles structured, consistency-critical workflow data (users, roles, complaint status); MongoDB handles flexible, category-dependent complaint content.