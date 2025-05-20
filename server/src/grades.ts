import express from "express";
import { pool, poolPromise, isGCP } from "./db";

const router = express.Router();

router.get("/grades", async (req, res) => {
  try {
    const db = isGCP ? await poolPromise : pool;
    const result = await db.query("SELECT id, grade FROM grade_table");
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error", detail: String(err) });
  }
});

export default router;
