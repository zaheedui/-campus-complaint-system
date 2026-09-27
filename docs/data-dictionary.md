# Data Dictionary — MySQL (Structured Workflow Data)

## roles
| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Unique role identifier |
| name | VARCHAR(20) | UNIQUE, NOT NULL | Role name (student/admin) |

## users
| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| role_id | INT | FK → roles(id) | User's role |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |

## complaint_categories
| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Unique category identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Category (lost_item, found_item, maintenance, ragging) |

## complaints
| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Unique complaint identifier |
| mongo_ref_id | VARCHAR(50) | NOT NULL | Links to MongoDB document |
| category_id | INT | FK → complaint_categories(id) | Complaint category |
| filed_by | INT | FK → users(id), NULLABLE | Filer (NULL if anonymous) |
| assigned_to | INT | FK → users(id), NULLABLE | Assigned admin |
| status | VARCHAR(20) | CHECK (open/assigned/in_progress/resolved/closed) | Workflow status |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymity flag |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| last_updated | TIMESTAMP | Auto-updated via trigger | Last modification time |



# Data Dictionary — MongoDB (Flexible Complaint Reports)

## complaintreports collection

| Field | Type | Present When | Description |
|---|---|---|---|
| _id | ObjectId | Always | MongoDB document identifier |
| postgresComplaintId | Number | Always | Links back to MySQL `complaints.id` |
| category | String (enum) | Always | lost_item / found_item / maintenance / ragging |
| description | String | Always | Complaint/report text |
| location | String | lost_item, found_item only | Where the item was lost/found |
| photoUrl | String | lost_item, found_item only | Optional photo reference |
| roomNumber | String | maintenance only | Room affected |
| issueType | String | maintenance only | Type of maintenance issue |
| isAnonymous | Boolean | Always | Anonymity flag |
| filedByUserId | Number | Only present when NOT anonymous | Filer's user id — **deliberately omitted entirely, not null, when isAnonymous is true** |
| comments | Array | Always (may be empty) | Embedded comment thread |
| createdAt | Date | Always | Document creation time |

**Indexes:** a compound text index on `description` and `location`, supporting the lost/found matching feature (full-text search).

**Design rationale:** category-specific fields (`location`/`photoUrl` vs. `roomNumber`/`issueType`) vary per document rather than being forced into a single rigid table with many nullable columns — this is the core justification for using MongoDB on this side of the system.



# Design Decisions

**Admin access to student-facing features:** Admin accounts retain access to "File Complaint" and "My Complaints" alongside admin-only tools, since an administrator may also be a member of the campus community who wishes to file their own reports (e.g., their own lost item). This does not expose any privileged data or operation — it simply means the admin role is a superset of student capabilities rather than a fully separate, walled-off persona. Role-based restriction is enforced only where it matters: non-admins are blocked from `/admin` and its underlying management actions (status changes, viewing all complaints) via middleware.