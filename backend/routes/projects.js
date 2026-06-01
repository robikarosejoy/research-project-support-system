const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const sendEmail = require("../utils/emailService");
const router = express.Router();

// Helper: check whether user can access project
const checkProjectAccess = async (projectId, user) => {
  const projectResult = await pool.query(
    "SELECT * FROM projects WHERE id = $1",
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return { allowed: false, status: 404, message: "Project not found" };
  }

  const project = projectResult.rows[0];

  if (project.pi_id === user.id) {
    return { allowed: true, project };
  }

  const memberResult = await pool.query(
    `SELECT * FROM project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, user.id]
  );

  if (memberResult.rows.length > 0) {
    return { allowed: true, project };
  }

  return { allowed: false, status: 403, message: "Access denied" };
};

// CREATE PROJECT - PI ONLY
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("PI"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        funding_agency,
        total_budget,
        start_date,
        end_date,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO projects
         (title, description, funding_agency, total_budget, start_date, end_date, pi_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          title,
          description,
          funding_agency,
          total_budget,
          start_date,
          end_date,
          req.user.id,
        ]
      );

      res.status(201).json({
        message: "Project created successfully",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET ALL PROJECTS FOR LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (req.user.role === "PI") {
      result = await pool.query(
        `SELECT *
         FROM projects
         WHERE pi_id = $1
         ORDER BY created_at DESC`,
        [req.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT p.*
         FROM projects p
         INNER JOIN project_members pm
         ON p.id = pm.project_id
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
// GET RESEARCHERS COUNT
router.get("/researchers/count", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM project_members`
    );

    res.json({
      count: result.rows[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET NOTIFICATIONS COUNT
router.get("/notifications/count", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM notifications`
    );

    res.json({
      count: result.rows[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// GET SINGLE PROJECT
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const access = await checkProjectAccess(req.params.id, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        message: access.message,
      });
    }

    res.json(access.project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PROJECT MEMBERS
router.get("/:id/members", authMiddleware, async (req, res) => {
  try {
    const access = await checkProjectAccess(req.params.id, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        message: access.message,
      });
    }

    const result = await pool.query(
      `SELECT pm.id, pm.role, u.name, u.email
       FROM project_members pm
       INNER JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD MEMBER BY EMAIL - PI ONLY
router.post(
  "/:id/members",
  authMiddleware,
  authorizeRoles("PI"),
  async (req, res) => {
    try {
      const access = await checkProjectAccess(req.params.id, req.user);

      if (!access.allowed || access.project.pi_id !== req.user.id) {
        return res.status(403).json({
          message: "Only project PI can add members",
        });
      }

      const { email, role } = req.body;

      const allowedRoles = ["Co-PI", "JRF", "SRF"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid project role",
        });
      }

      const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found. User must sign up first.",
        });
      }

      const user = userResult.rows[0];

      const existingMember = await pool.query(
        `SELECT * FROM project_members
         WHERE project_id = $1 AND user_id = $2`,
        [req.params.id, user.id]
      );

      if (existingMember.rows.length > 0) {
        return res.status(400).json({
          message: "Member already exists in this project",
        });
      }

      await pool.query(
        `INSERT INTO project_members
         (project_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [req.params.id, user.id, role]
      );
      
      await sendEmail(
  user.email,
  "Project Assignment Notification",
  `Hello ${user.name || "User"},

You have been added as ${role} to the project: ${access.project.title}.

Please login to the Research Project Support System to view the project details.

Regards,
Research Project Support System`
);

      res.status(201).json({
        message: "Member added successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// GET MILESTONES
router.get("/:id/milestones", authMiddleware, async (req, res) => {
  try {
    const access = await checkProjectAccess(req.params.id, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        message: access.message,
      });
    }

    const result = await pool.query(
      "SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC",
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD MILESTONE - PI AND CO-PI ONLY
router.post(
  "/:id/milestones",
  authMiddleware,
  authorizeRoles("PI", "Co-PI"),
  async (req, res) => {
    try {
      const access = await checkProjectAccess(req.params.id, req.user);

      if (!access.allowed) {
        return res.status(access.status).json({
          message: access.message,
        });
      }

      const { title, due_date } = req.body;

      await pool.query(
        `INSERT INTO milestones
         (project_id, title, due_date)
         VALUES ($1, $2, $3)`,
        [req.params.id, title, due_date]
      );

      res.status(201).json({
        message: "Milestone added successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;