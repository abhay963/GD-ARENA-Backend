import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // 🔥 EXPLICIT PATH FIX

import pkg from "pg";
const { Pool } = pkg;



export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});
