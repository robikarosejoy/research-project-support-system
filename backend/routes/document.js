const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GENERATE PROJECT SUMMARY DOCUMENT
router.get("/:id/generate-summary", authMiddleware, async (req, res) => {
  try {
    // Get project details
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [req.params.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const project = projectResult.rows[0];

    // Get PI details
    const piResult = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [project.pi_id]
    );

    const pi_name = piResult.rows[0]?.name || "N/A";

    // Read template file
    const templatePath = path.join(
      __dirname,
      "../templates/project-summary-template.txt"
    );

    let template = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders
    template = template.replace("{{title}}", project.title || "");
    template = template.replace("{{pi_name}}", pi_name);
    template = template.replace(
      "{{funding_agency}}",
      project.funding_agency || ""
    );
    template = template.replace(
      "{{total_budget}}",
      project.total_budget || ""
    );
    template = template.replace(
      "{{start_date}}",
      project.start_date?.toISOString().split("T")[0] || ""
    );
    template = template.replace(
      "{{end_date}}",
      project.end_date?.toISOString().split("T")[0] || ""
    );

    // Send generated document
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=project-summary.txt"
    );

    res.setHeader("Content-Type", "text/plain");

    res.send(template);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;