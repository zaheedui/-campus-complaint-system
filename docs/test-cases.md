# Test Cases

| # | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | File a non-anonymous complaint | MySQL and MongoDB both get linked records via mongo_ref_id / postgresComplaintId | Confirmed — ids matched correctly across both databases | Pass |
| 2 | File an anonymous complaint | filedByUserId field absent entirely from MongoDB document; filed_by is NULL in MySQL | Confirmed on ragging complaint test | Pass |
| 3 | Insert an invalid status directly in MySQL | CHECK constraint rejects the insert | Error Code 1046 / 3819 raised, insert blocked | Pass |
| 4 | Insert a complaint referencing a non-existent filed_by user | Foreign key constraint rejects the insert | Error 1452 raised (ER_NO_REFERENCED_ROW_2) | Pass |
| 5 | Student account accesses /admin directly via URL | Middleware redirects to /dashboard | Confirmed | Pass |
| 6 | Admin account accesses /admin | Access granted, dashboard renders | Confirmed | Pass |
| 7 | Admin updates a complaint's status | Transaction commits; last_updated trigger fires automatically | Confirmed, timestamp updated without app code setting it | Pass |
| 8 | Lost item vs. found item text search matching | Correct match returned with a relevance score | Confirmed — backpack match returned, score 2.75 | Pass |
| 9 | MySQL container fails mid-write during complaint filing | MongoDB document is rolled back (deleted) to avoid orphaned data | Confirmed via forced foreign key failure test | Pass |
| 10 | Duplicate email signup attempt | Signup rejected with 409 error | Confirmed — "Email already registered" returned | Pass |