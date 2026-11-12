```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    USERS |o--o{ COMPLAINTS : "files"
    USERS |o--o{ COMPLAINTS : "assigned to"
    COMPLAINT_CATEGORIES ||--o{ COMPLAINTS : "classifies"
    COMPLAINTS ||..|| COMPLAINT_NODE : "graph_ref_id = refId"
    COMPLAINT_NODE }o--|| CATEGORY_NODE : "IN_CATEGORY"
    COMPLAINT_NODE }o--o| LOCATION_NODE : "AT_LOCATION"

    ROLES {
        int id PK
        varchar name UK
    }
    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password_hash
        int role_id FK
        timestamp created_at
    }
    COMPLAINT_CATEGORIES {
        int id PK
        varchar name UK
    }
    COMPLAINTS {
        int id PK
        char graph_ref_id UK "unique link to Neo4j refId"
        int category_id FK
        int filed_by FK "NULL if anonymous"
        int assigned_to FK "NULL until assigned"
        varchar status "CHECK constraint"
        boolean is_anonymous "CHECK: anonymous iff filed_by is NULL"
        timestamp created_at
        timestamp last_updated "set by trigger"
    }
    COMPLAINT_NODE {
        string refId PK "unique"
        int mysqlId
        string description
        boolean isAnonymous
        datetime createdAt
        string roomNumber "optional"
        string issueType "optional"
    }
    CATEGORY_NODE {
        string name PK
    }
    LOCATION_NODE {
        string name PK
    }
```


### Relational constraints summary
- `roles.name`, `users.email`, `complaint_categories.name`, and `complaints.graph_ref_id` are UNIQUE.
- `users.role_id`, `complaints.category_id`, `complaints.filed_by`, and `complaints.assigned_to` are foreign keys.
- `complaints.status` is restricted to `open`, `assigned`, `in_progress`, `resolved`, or `closed`.
- Anonymous complaints must have `filed_by IS NULL`; non-anonymous complaints must have a filer.
- `last_updated` is refreshed by `trg_update_last_updated` on every complaint update.
