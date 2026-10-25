import neo4j, { Driver } from 'neo4j-driver';

// Keep one driver for the whole app, even when Next.js hot-reloads in dev
const globalForNeo4j = globalThis as unknown as { neo4jDriver?: Driver };

export function getDriver(): Driver {
  if (!globalForNeo4j.neo4jDriver) {
    globalForNeo4j.neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
    );
  }
  return globalForNeo4j.neo4jDriver;
}