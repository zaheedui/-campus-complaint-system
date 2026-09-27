# Campus Lost & Found + Complaint Management System

## 1. Problem Statement
Campus complaint handling — lost items, hostel/mess maintenance issues, and sensitive matters like ragging — is typically managed informally through registers, word of mouth, or scattered spreadsheets. This leads to lost records, no accountability for resolution, and no safe channel for anonymous reporting of sensitive issues.

## 2. Objectives
- Provide a centralized system for students to file and track complaints across multiple categories
- Give administrators tools to view, assign, and resolve complaints
- Support anonymous filing for sensitive complaints (e.g., ragging) without compromising genuine anonymity at the data level
- Automatically suggest matches between lost and found item reports

## 3. Scope
- Two roles: Student, Admin
- Four complaint categories: Lost Item, Found Item, Maintenance, Ragging
- Complaint lifecycle: Open → Assigned → In Progress → Resolved → Closed

## 4. Functional Requirements
- User signup/login with role assignment
- Students can file complaints (with category-specific fields), view their own complaint history
- Admins can view all complaints, a category-wise open-complaint summary, update complaint status, and check lost/found matches
- Anonymous filing available for ragging complaints

## 5. System Architecture
Next.js (App Router) serves both the frontend and the backend API routes. API routes connect to two databases:
- **MySQL** — structured, consistency-critical workflow data (users, roles, categories, complaint status/assignment)
- **MongoDB** — flexible, category-dependent complaint report content

A complaint is represented as one row in MySQL (`complaints`) linked via a shared identifier (`mongo_ref_id` / `postgresComplaintId`) to one document in MongoDB (`complaintreports`). The two are kept consistent at the application layer using a create-then-verify pattern with compensating rollback (see Section 11).

## 6. ER Diagram
![ER Diagram](screenshots/campus_complaints_ERR_Diagram.png)

## 7. Relational Schema & Data Dictionary
See `docs/data-dictionary.md` for full column-level detail. Summary:
- `roles(id, name)`
- `users(id, name, email, password_hash, role_id → roles)`
- `complaint_categories(id, name)`
- `complaints(id, mongo_ref_id, category_id → complaint_categories, filed_by → users, assigned_to → users, status, is_anonymous, created_at, last_updated)`

## 8. Database Choice and Justification
The system's data naturally splits into two categories with different requirements:

- **Structurally rigid, consistency-critical data** (who filed what, current status, who's assigned) needs referential integrity and atomic updates — well suited to a relational database with foreign keys, constraints, and transactions. MySQL was chosen here.
- **Structurally variable data** (a lost item report needs location/photo; a maintenance complaint needs room number/issue type; a ragging complaint needs anonymity handling and no identity field at all) does not fit a single rigid table without excessive nullable columns or an EAV pattern. MongoDB's document model handles this naturally.

This is a deliberate polyglot persistence design, not two databases used for their own sake — each was chosen because of what its part of the data actually needs.

## 9. NoSQL Data Model
See `docs/data-dictionary.md` for the full `complaintreports` document shape. Key design point: anonymous complaints omit the `filedByUserId` field entirely rather than storing and hiding it — verified in `docs/screenshots/Cc_MongoDB_Complaint_reports.png`.

## 10. Important Queries
**Cross-database join (list complaints):**
```sql
SELECT c.id, c.mongo_ref_id, c.status, c.is_anonymous, c.created_at,
       cc.name AS category, c.filed_by, c.assigned_to
FROM complaints c
JOIN complaint_categories cc ON c.category_id = cc.id
ORDER BY c.created_at DESC;
```

**Open complaints summary (view):**
```sql
SELECT * FROM open_complaints_summary;
```

**Full-text match search (MongoDB):**
```js
db.complaintreports.find(
  { category: "found_item", $text: { $search: "backpack library" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });
```

## 11. Advanced Database Features
1. **Transactions** — status updates and assignment changes are wrapped in a MySQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`), ensuring both fields update atomically.
2. **Trigger** — `trg_update_last_updated` automatically sets `last_updated` on any row change, without application code managing it.
3. **View** — `open_complaints_summary` provides a derived, always-current count of open complaints per category for the admin dashboard.
4. **Full-text search / NoSQL aggregation** — a MongoDB text index on `description` and `location` powers the lost/found matching feature, returning ranked results by relevance score.
5. **Cross-database consistency (application-level)** — since MySQL and MongoDB cannot share a native transaction, complaint filing uses a create-then-verify pattern: the MongoDB document is created first, then the MySQL row; if the MySQL insert fails (e.g., a foreign key violation), the MongoDB document is deleted as a compensating action. Verified under test case 9.

## 12. Authentication and Authorization
NextAuth (Credentials provider) with bcrypt-hashed passwords and JWT sessions. Two roles: Student, Admin. Role-based route protection is enforced via Next.js middleware, blocking non-admin access to `/admin` at the request level (verified under test cases 5 and 6). Admin accounts retain access to student-facing features by design — see `docs/data-dictionary.md`, Design Decisions section.

## 13. Screenshots
See `docs/screenshots/` — covers login, student dashboard, file-complaint form (multiple categories), my-complaints, admin dashboard, MySQL schema, MongoDB documents, and the ER diagram.

## 14. Testing Results
See `docs/test-cases.md` — 10 test cases covering cross-database writes, anonymity, constraint enforcement, role-based access, transactions, triggers, and matching. All passing.

## 15. Individual Contribution
## 15. Individual Contribution

**Syed Zaheed (PES2UG24AM168)** — Database design (MySQL schema, MongoDB document model), all backend API routes, cross-database write/rollback logic, authentication (NextAuth, role-based middleware), advanced database features (transactions, trigger, view, full-text search matching), initial functional UI.

**Tharun Ganesh (PES2UG24AM172)** — Frontend styling and UI/UX polish across all pages (login, signup, dashboard, file-complaint, my-complaints, admin panel), updated screenshots reflecting final UI.

Individual commits are visible in the project's Git history at [your repo URL].

## 16. Conclusion and Future Enhancements
The system demonstrates a justified polyglot persistence architecture solving a real campus problem, going beyond CRUD through role-based workflows, cross-database consistency handling, and a practical matching feature. Future enhancements could include: a dedicated category-specific staff role (e.g., separate handlers for maintenance vs. ragging complaints), real photo upload storage, email notifications on status changes, and a more sophisticated matching algorithm (e.g., embedding-based similarity instead of keyword text search).