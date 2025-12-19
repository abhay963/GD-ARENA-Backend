import dotenv from "dotenv";
dotenv.config(); // 🔥 THIS WAS MISSING

import { pool } from "./db.js";

const res = await pool.query("SELECT NOW()");


process.exit();
