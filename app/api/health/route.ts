import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

export async function GET() {
  const result = { mysql: 'down', mongo: 'down' };

  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    await conn.query('SELECT 1');
    await conn.end();
    result.mysql = 'ok';
  } catch (err) {
    console.error('MySQL health check failed:', err);
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
    result.mongo = 'ok';
  } catch (err) {
    console.error('Mongo health check failed:', err);
  }

  return Response.json(result);
}