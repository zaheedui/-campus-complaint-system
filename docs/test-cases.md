# Test Cases

| # | Area | Test case | Expected result | Actual result | Status |
|---|---|---|---|---|---|
| 1 | Filing | File a non-anonymous complaint through the form | A MySQL row and a Neo4j Complaint node are created and linked by `graph_ref_id` = `refId` | Confirmed. Complaint 24 was created and the ids matched | Pass |
| 2 | Filing | File an anonymous complaint | `filed_by` is NULL in MySQL, and the Neo4j node has no property that identifies the filer | Confirmed in both databases | Pass |
| 3 | Filing | MySQL insert fails after the Neo4j node is created (category id 99 does not exist) | An error is returned and the Neo4j node is deleted by the compensating rollback | Error returned and no leftover node found | Pass |
| 4 | Filing | Tick "anonymous" under Ragging, then switch to another category and submit | The anonymous flag resets and the complaint is stored as non-anonymous | Confirmed after the fix | Pass |
| 5 | MySQL integrity | Insert a complaint with an invalid status directly in MySQL | The CHECK constraint rejects it | Error 3819 raised | Pass |
| 6 | MySQL integrity | Insert a complaint whose `filed_by` user does not exist | The foreign key rejects it | Error 1452 raised | Pass |
| 7 | MySQL integrity | Sign up with an email that is already registered | Rejected with a 409 error | "Email already registered" returned | Pass |
| 8 | Neo4j integrity | Create a second Category node named `lost_item` | The uniqueness constraint rejects it | Rejected with a constraint error | Pass |
| 9 | Access control | A student opens `/admin` | Redirected to `/dashboard` | Confirmed | Pass |
| 10 | Access control | An admin opens `/admin` | Access granted | Confirmed | Pass |
| 11 | Transaction | Admin changes a complaint's status from the dashboard | The transaction commits and the new status is shown | Confirmed | Pass |
| 12 | Validation | Send a status update with an invalid status through the API | Rejected with 400 and no database change | "Invalid status" returned | Pass |
| 13 | Trigger | Update a complaint row | `last_updated` is set automatically | Confirmed. The timestamp changed without application code setting it | Pass |
| 14 | View | Open the admin dashboard | `open_complaints_summary` shows open counts per category | Confirmed | Pass |
| 15 | Matching | Click Check Matches on a lost report | The found report is returned, ranked higher when it shares the location | Complaint 25 was returned for complaint 24 with `sameLocation: true` and a score of about 1.23 | Pass |
| 16 | Retrieval | Open My Complaints as a student | Only that student's non-anonymous complaints are shown | Confirmed | Pass |
| 17 | Retrieval | Request a complaint id that does not exist | 404 with an error message | "Complaint not found" returned | Pass |
| 18 | API security | Call the admin summary, status update and matches routes while logged out | Rejected with 401 and no data change | Confirmed. Status of complaint 24 did not change | Pass |
| 19 | API security | A logged-in student opens `/api/admin/summary` | Rejected with 403 "Admins only" | Confirmed | Pass |
| 20 | API security | Call the list, detail and filing routes while logged out | Rejected with 401 | Confirmed | Pass |
| 21 | API security | A student opens `/api/complaints` | Only that student's own complaints are returned | Confirmed | Pass |
| 22 | API security | A student opens another user's complaint through the API | Rejected with 403 "Not allowed" | Confirmed | Pass |
| 23 | Signup | Sign up as admin with a missing or wrong admin code | Rejected with 403 "Invalid admin code" | Confirmed from both curl and the signup page | Pass |
| 24 | Signup | Sign up as admin with the correct admin code | Account created, and the user can reach the admin panel | Confirmed | Pass |

## Known limitations
- If the MySQL insert fails after a new location was created in Neo4j, the rollback deletes the Complaint node but leaves an unused Location node behind. It is harmless and could be cleaned up in a future version.

## Evidence
Screenshots are in `docs/screenshots/`: `project_er_diagram.png`, `neo4j_schema.png` and `neo4j_constraint_error.png`.