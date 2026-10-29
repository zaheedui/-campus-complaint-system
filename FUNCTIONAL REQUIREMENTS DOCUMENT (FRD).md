# FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)
## Campus Complaint Management System

**Version:** 1.0  
**Project Type:** Web-Based Complaint Management System  
**Frontend and Backend:** Next.js (App Router), TypeScript  
**Relational Database:** MySQL 8.0  
**Graph Database:** Neo4j 5  
**Authentication:** NextAuth, Credentials Provider, JWT Sessions, bcrypt Password Hashing

---

## 1. Introduction

### 1.1 Purpose

The purpose of this Functional Requirements Document is to specify the functional requirements of the Campus Complaint Management System. The document defines the system's expected behavior, user roles, core features, database interactions, and requirements for handling campus complaints.

It serves as a reference for developers, testers, project evaluators, and stakeholders to understand what the system must accomplish.

### 1.2 Project Overview

The Campus Complaint Management System is a role-based web application designed to manage campus-related complaints, including:

- Lost and found reports.
- Hostel maintenance complaints.
- Ragging reports.

The application provides separate interfaces and access permissions for students and administrators.

The system uses a hybrid database architecture consisting of MySQL and Neo4j. MySQL stores structured workflow information, while Neo4j represents complaint content and its relationships with categories and locations. The two databases are linked through a shared complaint identifier.

### 1.3 Objectives

The primary objectives are to:

1. Provide a centralized platform for filing and managing campus complaints.
2. Support student registration, authentication, and role-based access.
3. Allow students to submit complaints and view their complaint history.
4. Enable administrators to view complaints and manage their workflow.
5. Support complaint categorization, status tracking, and assignment.
6. Facilitate lost-and-found matching using complaint descriptions and graph relationships.
7. Maintain consistency between structured complaint records and graph-based complaint content.
8. Provide administrative summaries of open complaints.

### 1.4 Scope

The system covers student and administrator registration, authentication, complaint submission, complaint history, administrative complaint management, status and assignment information, and lost-and-found matching.

The system uses MySQL for structured data and workflow consistency and Neo4j for complaint content and graph-based relationships.

The system does not claim to integrate with external campus identity systems, emergency services, or third-party notification platforms unless such functionality is implemented separately.

---

## 2. User Roles

### 2.1 Student

A student is an authenticated user who can access student-facing functionality.

The student must be able to:

- Register for an account with the Student role.
- Log in and access the application.
- File a new complaint.
- View their own complaint history.
- View available complaint information presented by the application.

### 2.2 Administrator

An administrator is an authenticated user with access to administrative functionality.

The administrator must be able to:

- Register with the Admin role using the required administrator signup code.
- Log in to the application.
- Access the administrative dashboard.
- View the complaint list.
- View the open-complaints summary.
- Access the lost-and-found matching functionality.
- View complaint status and assignment information managed by the system.

**Note:** The README confirms that the admin dashboard displays the complaint list, open-complaints summary, and lost/found match check. Specific assignment actions and status-update operations should be verified against the implemented application and backend routes.

---

## 3. Functional Requirements

### 3.1 User Registration and Authentication

**FR-01: User Registration**

The system shall allow users to register through the signup interface.

**FR-02: Role Selection**

The system shall support the Student and Admin roles during registration.

**FR-03: Administrator Registration Authorization**

The system shall require the configured administrator signup code when registering an administrator.

**FR-04: User Authentication**

The system shall authenticate registered users through the credentials-based authentication mechanism.

**FR-05: Password Security**

The system shall use bcrypt password hashing for password storage.

**FR-06: Session Management**

The system shall use NextAuth JWT sessions to manage authenticated user sessions.

**FR-07: Role-Based Access**

The system shall provide role-appropriate access to student and administrator functionality.

**FR-08: Authentication Validation**

The system shall prevent unauthorized users from accessing protected application functionality.

### 3.2 Student Complaint Management

**FR-09: Complaint Submission**

The system shall allow authenticated students to submit complaints through the complaint filing interface.

**FR-10: Complaint Categories**

The system shall support the campus complaint use cases defined in the project scope: lost and found, hostel maintenance, and ragging reports.

**FR-11: Complaint Content Storage**

The system shall store complaint content in Neo4j as part of a graph-based representation.

**FR-12: Structured Complaint Record**

The system shall maintain structured complaint workflow information in MySQL.

**FR-13: Complaint Identification**

The system shall maintain a shared identifier linking a MySQL complaint record to its corresponding Neo4j Complaint node.

**FR-14: Complaint History**

The system shall allow students to access their own complaint history through the My Complaints interface.

**FR-15: Complaint Status Visibility**

The system shall make complaint status information available through the relevant application interfaces.

### 3.3 Administrator Complaint Management

**FR-16: Administrative Dashboard**

The system shall provide an administrative dashboard for authorized administrators.

**FR-17: Complaint Listing**

The system shall display the complaint list on the administrative dashboard.

**FR-18: Open-Complaint Summary**

The system shall display a summary of open complaints.

**FR-19: Complaint Assignment Information**

The system shall maintain structured complaint assignment information in MySQL.

**FR-20: Complaint Status Management**

The system shall support the complaint status workflow implemented by the application.

**FR-21: Administrative Access Control**

The system shall restrict administrative functionality to appropriately authorized users.

### 3.4 Lost-and-Found Matching

**FR-22: Lost-and-Found Representation**

The system shall represent complaint content using Neo4j Complaint nodes connected to Category and Location nodes.

**FR-23: Location-Based Relationships**

The system shall allow lost and found reports associated with the same location to be connected through a shared Location node.

**FR-24: Description Search**

The system shall provide full-text search capability over complaint descriptions using a Neo4j full-text index.

**FR-25: Lost-and-Found Match Check**

The system shall provide a lost-and-found match-checking feature through the administrative dashboard.

**FR-26: Match Retrieval**

The system shall retrieve potential matching reports using the matching logic implemented in the application.

The exact matching score, ranking algorithm, and acceptance criteria are implementation-specific and must be documented separately if used.

### 3.5 Database Management and Integration

**FR-27: MySQL Data Storage**

The system shall store structured user, role, category, complaint status, and assignment information in MySQL.

**FR-28: Neo4j Graph Storage**

The system shall store complaint content as a graph involving Complaint, Category, and Location nodes.

**FR-29: Cross-Database Identifier**

The system shall use `complaints.graph_ref_id` in MySQL to reference the corresponding Complaint node's `refId` in Neo4j.

**FR-30: Relational Integrity**

The system shall use the relational constraints defined in the MySQL schema to maintain consistency for supported structured data operations.

**FR-31: Transaction and Trigger Support**

The system shall execute the transaction and trigger logic defined in the MySQL schema for the operations to which they apply.

**FR-32: Database Connectivity**

The system shall connect to MySQL and Neo4j using the configured environment variables.

**FR-33: Health Verification**

The system shall expose an API health endpoint at `/api/health` that reports MySQL and Neo4j connection status.

**FR-34: Database Setup**

The system shall support initialization of the MySQL schema and Neo4j constraints, full-text index, and category data through the provided setup scripts.

---

## 4. External Interface Requirements

### 4.1 User Interface

The system shall provide a web-based interface built with Next.js.

The documented interfaces include:

- `/signup` — user registration.
- `/login` — user authentication.
- `/dashboard` — role-aware landing page.
- `/file-complaint` — student complaint submission.
- `/my-complaints` — student complaint history.
- `/admin` — administrator dashboard.
- `/api/health` — database connectivity status.

### 4.2 MySQL Interface

The application shall communicate with MySQL 8.0 to store and retrieve structured workflow information.

The database shall be initialized using `sql/schema.sql`.

### 4.3 Neo4j Interface

The application shall communicate with Neo4j 5 to store and query graph-based complaint content.

The graph database shall be initialized using `neo4j/setup.cypher`.

### 4.4 Authentication Interface

The application shall use NextAuth with the Credentials provider, JWT sessions, and bcrypt password hashing.

---

## 5. Data Requirements

### 5.1 MySQL Data

MySQL shall manage structured data associated with:

- Users.
- User roles.
- Complaint categories.
- Complaint status.
- Complaint assignments.
- Complaint-to-graph references.

The exact table names, attributes, keys, and constraints shall be defined by `sql/schema.sql`.

### 5.2 Neo4j Data

Neo4j shall represent complaint-related information using:

- **Complaint nodes:** Represent individual complaint reports.
- **Category nodes:** Represent complaint categories.
- **Location nodes:** Represent associated campus locations.
- **Relationships:** Represent connections between complaints, categories, and locations.

The exact relationship types and properties shall be defined by `neo4j/setup.cypher` and the application implementation.

### 5.3 Cross-Database Mapping

Each complaint stored across the two databases shall be linked using a shared identifier:

- MySQL: `complaints.graph_ref_id`
- Neo4j: `Complaint.refId`

This mapping shall allow the application to associate structured workflow information with graph-based complaint content.

---

## 6. System Workflow

### 6.1 Student Complaint Workflow

1. The student registers or logs in.
2. The student accesses the complaint filing page.
3. The student submits a complaint.
4. The application stores structured workflow information in MySQL.
5. The application stores complaint content and relevant graph relationships in Neo4j.
6. The shared identifier associates the records across the two databases.
7. The student accesses the My Complaints page to view their complaint history.

The exact write ordering and error-recovery behavior across both databases depend on the implemented backend.

### 6.2 Administrator Workflow

1. The administrator registers with the required signup code or logs in with an existing account.
2. The administrator opens the administrative dashboard.
3. The administrator views the complaint list and open-complaints summary.
4. The administrator accesses the lost-and-found match-checking functionality.
5. Complaint status and assignment information are maintained through the workflow implemented by the application.

### 6.3 Lost-and-Found Matching Workflow

1. Complaint descriptions are stored in the graph-based complaint model.
2. Complaints are associated with their relevant categories and locations.
3. The Neo4j full-text index supports searching complaint descriptions.
4. The application performs the implemented matching process.
5. The administrator accesses the resulting match-checking functionality.

---

## 7. Functional Validation Requirements

The following tests shall be used to verify the principal system functions.

| Test ID | Test scenario | Expected result |
|---|---|---|
| TC-01 | Register a student | Student account is created successfully |
| TC-02 | Register an administrator with a valid code | Administrator registration follows the configured authorization rules |
| TC-03 | Attempt protected access without authentication | Access is restricted |
| TC-04 | Submit a complaint | Complaint information is stored in the configured databases |
| TC-05 | View personal complaint history | The student's own complaint records are displayed |
| TC-06 | Open the administrator dashboard | Complaint list and open-complaint summary are displayed |
| TC-07 | Execute a lost-and-found match check | The implemented matching functionality returns its results |
| TC-08 | Check database health | The API reports MySQL and Neo4j connection status |
| TC-09 | Inspect a complaint's cross-database mapping | The MySQL graph reference corresponds to the appropriate Neo4j Complaint node |
| TC-10 | Inspect complaint graph relationships | Complaint, Category, and Location nodes are represented according to the graph model |

Detailed test inputs, test data, and actual outcomes shall be recorded during system testing.

---

## 8. Assumptions and Constraints

1. Docker Desktop must be installed and running.
2. The application requires Node.js version 18 or newer.
3. MySQL 8.0 and Neo4j 5 must be available through the configured Docker setup.
4. The MySQL schema and Neo4j setup scripts must be executed before using database-dependent functionality.
5. The application requires valid environment configuration for database connectivity and authentication.
6. The application uses separate databases for structured workflow data and graph-based complaint content.
7. The shared complaint identifier is used to associate records across MySQL and Neo4j.
8. The sample accounts included in the SQL schema contain placeholder password hashes and are not valid login accounts.
9. The project uses a web-based interface built with Next.js and TypeScript.

---

## 9. Expected Outcomes

Upon successful implementation, the system shall provide:

- Role-based student and administrator access.
- Complaint submission and complaint history functionality.
- An administrative complaint list and open-complaints summary.
- Structured workflow storage using MySQL.
- Graph-based complaint representation using Neo4j.
- A shared identifier linking records across both databases.
- Full-text description search and lost-and-found match-checking functionality.
- A health endpoint for verifying database connectivity.

---

## 10. Conclusion

The Campus Complaint Management System combines relational and graph-based database technologies to support campus complaint workflows. MySQL maintains structured information and workflow consistency, while Neo4j represents complaint content and its relationships with categories and locations.

This Functional Requirements Document defines the principal user-facing functions, database responsibilities, interfaces, and validation scenarios for the project. The SQL schema, Neo4j setup script, and implemented application routes serve as the authoritative sources for verifying the detailed behavior of each requirement.
