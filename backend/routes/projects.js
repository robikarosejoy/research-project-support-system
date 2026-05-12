const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE PROJECT (PI only)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "PI") {
      return res.status(403).json({ message: "Only PI can create projects" });
    }

    const { title, description, funding_agency, total_budget, start_date, end_date } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (title, description, funding_agency, total_budget, start_date, end_date, pi_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, funding_agency, total_budget, start_date, end_date, req.user.id]
    );

    res.status(201).json({ message: "Project created successfully", project: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL PROJECTS (only projects user is part of)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (req.user.role === "PI") {
      result = await pool.query(
        "SELECT * FROM projects WHERE pi_id = $1 ORDER BY created_at DESC",
        [req.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT p.* FROM projects p
         INNER JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.user_id = $1
         ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE PROJECT
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = result.rows[0];

    // Check access
    if (req.user.role === "PI" && project.pi_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD TEAM MEMBER (PI only)
router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "PI") {
      return res.status(403).json({ message: "Only PI can add members" });
    }

    const { user_id, role } = req.body;

    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)",
      [req.params.id, user_id, role]
    );

    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;