# Data Dictionary

# Part 1: MySQL (structured workflow data)

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
| role_id | INT | FK → roles(id), NOT NULL | User's role |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

## complaint_categories
| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Unique category identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Category (lost_item, found_item, maintenance, ragging) |

## complaints
| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Unique complaint identifier |
| graph_ref_id | VARCHAR(50) | NOT NULL | Links to the Neo4j Complaint node (equals its `refId`) |
| category_id | INT | FK → complaint_categories(id), NOT NULL | Complaint category |
| filed_by | INT | FK → users(id), NULLABLE | Filer (NULL if anonymous) |
| assigned_to | INT | FK → users(id), NULLABLE | Admin handling the complaint |
| status | VARCHAR(20) | CHECK (open, assigned, in_progress, resolved, closed), DEFAULT 'open' | Workflow status |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymity flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| last_updated | TIMESTAMP | Updated by trigger | Last modification time |

**Indexes:** `idx_complaints_status` on `complaints(status)`, `idx_complaints_category` on `complaints(category_id)`.

## View and trigger
| Object | Type | Description |
|---|---|---|
| open_complaints_summary | VIEW | Count of open, assigned and in-progress complaints per category (columns: category, open_count). Used by the admin dashboard. |
| trg_update_last_updated | TRIGGER (BEFORE UPDATE on complaints) | Sets `last_updated` to the current time on every update. |

# Part 2: Neo4j (graph model for complaint content)

## Nodes

### Complaint
| Property | Type | Present when | Description |
|---|---|---|---|
| refId | String | Always | Unique id (UUID). Equals MySQL `complaints.graph_ref_id`. |
| mysqlId | Integer | Always (set after the MySQL insert) | Equals MySQL `complaints.id`. |
| description | String | Always | Complaint or report text. Full-text indexed. |
| isAnonymous | Boolean | Always | Anonymity flag. |
| createdAt | DateTime | Always | Creation time. |
| roomNumber | String | Maintenance complaints only | Room affected. |
| issueType | String | Maintenance complaints only | Type of maintenance issue. |

### Category
| Property | Type | Description |
|---|---|---|
| name | String (unique) | lost_item, found_item, maintenance or ragging. Four nodes. |

### Location
| Property | Type | Description |
|---|---|---|
| name | String (unique) | Place name, stored in lowercase so "Library" and "library" are one node. |

## Relationships
| Relationship | From → To | Cardinality | Present when |
|---|---|---|---|
| IN_CATEGORY | Complaint → Category | Each complaint has exactly one category | Always |
| AT_LOCATION | Complaint → Location | Each complaint has at most one location; a location can have many complaints | Lost and found reports only |

## Constraints and indexes
- Uniqueness constraints: `Complaint.refId`, `Category.name`, `Location.name`.
- Full-text index `complaint_text` on `Complaint.description`.
- The setup script is in `neo4j/setup.cypher`.

## Retrieval strategy: lost/found matching
1. Take the description of the selected report and remove punctuation and common stop words.
2. Search the full-text index with the cleaned text.
3. Keep only reports in the opposite category (lost ↔ found).
4. Add a bonus of 1.0 to the score of any candidate that shares the same `Location` node as the selected report.
5. Return the top 5 by score.

## Design rationale
- Node properties are schema-optional, so category-specific fields (such as `roomNumber`) exist only on the nodes that need them. No empty columns and no migrations are needed when a category gains new fields.
- Lost and found reports are connected through shared `Location` nodes, which makes the matching a natural graph question.
- **Anonymity:** Neo4j never stores who filed a complaint. The filer's identity exists only in MySQL (`filed_by`), which is NULL for anonymous complaints. An anonymous report therefore has no identity anywhere in either database.

# Cross-database link and consistency
There is no foreign key between MySQL and Neo4j. The link is `complaints.graph_ref_id = Complaint.refId`, maintained by the application:
1. The Neo4j node is created first.
2. The MySQL row is then inserted.
3. If the MySQL insert fails, the Neo4j node is deleted (a compensating rollback), so no orphaned node is left behind.

# Design Decisions

**Admin access to student-facing features:** Admin accounts keep access to "File Complaint" and "My Complaints" alongside the admin tools, because an administrator may also be a member of the campus community who wants to file their own report (for example, a lost item). This exposes no privileged data. The `/admin` page is restricted to admins by middleware, which redirects non-admins to `/dashboard`.