const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET NOTIFICATIONS FOR PROJECT
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE NOTIFICATION
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, message, type } = req.body;

    await pool.query(
      `INSERT INTO notifications
       (project_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, title, message, type]
    );

    res.status(201).json({ message: "Notification created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;