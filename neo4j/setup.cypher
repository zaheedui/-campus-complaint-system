// Neo4j setup for the Campus Complaint System
// Run once in the Neo4j Browser (http://localhost:7474) after the container starts.

CREATE CONSTRAINT complaint_ref_unique IF NOT EXISTS FOR (c:Complaint) REQUIRE c.refId IS UNIQUE;
CREATE CONSTRAINT category_name_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE;
CREATE CONSTRAINT location_name_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE;

// Full-text index used by the lost/found matching feature
CREATE FULLTEXT INDEX complaint_text IF NOT EXISTS FOR (c:Complaint) ON EACH [c.description];

// The four complaint categories
UNWIND ['lost_item', 'found_item', 'maintenance', 'ragging'] AS name
MERGE (:Category {name: name});