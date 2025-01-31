import dotenv from "dotenv";
import pkg from "pg";
import { QueryResult } from 'pg';

const { Pool } = pkg;

dotenv.config();

const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: dbPort,
    database: process.env.DB_DATABASE,
});

const db = {
  query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
  connect: () => pool.connect(),
};

export default db;