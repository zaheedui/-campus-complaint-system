# Test Cases

> The first 24 rows are the previously recorded test results from the submitted project snapshot. Because the schema, middleware, role scripts and delete workflow have since been strengthened, rerun the affected tests against this final version and replace any stale result with fresh evidence before claiming final acceptance.

|#|Area|Test case|Expected result|Previously recorded result|Prior status|
|-|-|-|-|-|-|
|1|Filing|File a non-anonymous complaint through the form|A MySQL row and a Neo4j Complaint node are created and linked by `graph\_ref\_id` = `refId`|Confirmed. Complaint 24 was created and the ids matched|Pass|
|2|Filing|File an anonymous complaint|`filed\_by` is NULL in MySQL, and the Neo4j node has no property that identifies the filer|Confirmed in both databases|Pass|
|3|Filing|MySQL insert fails after the Neo4j node is created (category id 99 does not exist)|An error is returned and the Neo4j node is deleted by the compensating rollback|Error returned and no leftover node found|Pass|
|4|Filing|Tick "anonymous" under Ragging, then switch to another category and submit|The anonymous flag resets and the complaint is stored as non-anonymous|Confirmed after the fix|Pass|
|5|MySQL integrity|Insert a complaint with an invalid status directly in MySQL|The CHECK constraint rejects it|Error 3819 raised|Pass|
|6|MySQL integrity|Insert a complaint whose `filed\_by` user does not exist|The foreign key rejects it|Error 1452 raised|Pass|
|7|MySQL integrity|Sign up with an email that is already registered|Rejected with a 409 error|"Email already registered" returned|Pass|
|8|Neo4j integrity|Create a second Category node named `lost\_item`|The uniqueness constraint rejects it|Rejected with a constraint error|Pass|
|9|Access control|A student opens `/admin`|Redirected to `/dashboard`|Confirmed|Pass|
|10|Access control|An admin opens `/admin`|Access granted|Confirmed|Pass|
|11|Transaction|Admin changes a complaint's status from the dashboard|The transaction commits and the new status is shown|Confirmed|Pass|
|12|Validation|Send a status update with an invalid status through the API|Rejected with 400 and no database change|"Invalid status" returned|Pass|
|13|Trigger|Update a complaint row|`last\_updated` is set automatically|Confirmed. The timestamp changed without application code setting it|Pass|
|14|View|Open the admin dashboard|`open\_complaints\_summary` shows open counts per category|Confirmed|Pass|
|15|Matching|Click Check Matches on a lost report|The found report is returned, ranked higher when it shares the location|Complaint 25 was returned for complaint 24 with `sameLocation: true` and a score of about 1.23|Pass|
|16|Retrieval|Open My Complaints as a student|Only that student's non-anonymous complaints are shown|Confirmed|Pass|
|17|Retrieval|Request a complaint id that does not exist|404 with an error message|"Complaint not found" returned|Pass|
|18|API security|Call the admin summary, status update and matches routes while logged out|Rejected with 401 and no data change|Confirmed. Status of complaint 24 did not change|Pass|
|19|API security|A logged-in student opens `/api/admin/summary`|Rejected with 403 "Admins only"|Confirmed|Pass|
|20|API security|Call the list, detail and filing routes while logged out|Rejected with 401|Confirmed|Pass|
|21|API security|A student opens `/api/complaints`|Only that student's own complaints are returned|Confirmed|Pass|
|22|API security|A student opens another user's complaint through the API|Rejected with 403 "Not allowed"|Confirmed|Pass|
|23|Signup|Sign up as admin with a missing or wrong admin code|Rejected with 403 "Invalid admin code"|Confirmed from both curl and the signup page|Pass|
|24|Signup|Sign up as admin with the correct admin code|Account created, and the user can reach the admin panel|Confirmed|Pass|

## Known limitations

* If the MySQL insert fails after a new location was created in Neo4j, the rollback deletes the Complaint node but leaves an unused Location node behind. It is harmless and could be cleaned up in a future version.

## Evidence

Screenshots are in `docs/screenshots/`: `project\_er\_diagram.png`, `neo4j\_schema.png` and `neo4j\_constraint\_error.png`.

## Additional tests for the rubric updates

|#|Area|Test case|Expected result|Actual result|Status|
|-|-|-|-|-|-|
|25|DML|Run `sql/dml\_operations.sql`|INSERT, SELECT, UPDATE and DELETE all execute; transaction rolls back and leaves no test row|Successfully executed. INSERT, SELECT, UPDATE and DELETE completed. Transaction rollback left zero test rows.|Pass|
|26|Database RBAC|Connect as `campus\_student` and run `SELECT CURRENT\_ROLE()`|`student\_role` is active|CURRENT\_ROLE() returned student\_role@%.|Pass|
|27|Database RBAC|As `campus\_student`, attempt UPDATE on `complaints`|MySQL rejects the UPDATE for insufficient privileges|UPDATE rejected with MySQL error 1142 (insufficient privileges).|Pass|
|28|Database RBAC|Connect as `campus\_admin` and run `SELECT CURRENT\_ROLE()`|`admin\_role` is active|CURRENT\_ROLE() returned admin\_role@%.|Pass|
|29|Database RBAC|As `campus\_admin`, update a test complaint|UPDATE succeeds|Admin UPDATE succeeded. Complaint status was restored|Pass|
|30|Page security|Open `/file-complaint` and `/my-complaints` while logged out|Middleware redirects to login|To be run|Pending|
|31|Assignment validation|Admin attempts to assign a complaint to a student account|API rejects with 400; no assignment is changed|To be run|Pending|
|32|Cross-database deletion|Force Neo4j deletion to fail during complaint deletion|MySQL transaction rolls back and complaint row remains|To be run|Pending|



