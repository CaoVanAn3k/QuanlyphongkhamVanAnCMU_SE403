import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../../shared/schema";

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "CaoAn7361",
  database: "quanlyphongkhamVanAn",
});

export const db = drizzle(pool, { schema, mode: "default" });
