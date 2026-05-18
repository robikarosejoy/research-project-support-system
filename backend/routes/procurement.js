const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET PROCUREMENT REQUESTS
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM procurement_requests
       WHERE project_id = $1
       ORDER BY request_date DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD PROCUREMENT REQUEST
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const {
      item_name,
      quantity,
      estimated_cost,
      vendor_name,
      request_date,
      description
    } = req.body;

    await pool.query(
      `INSERT INTO procurement_requests
       (project_id, item_name, quantity, estimated_cost, vendor_name, request_date, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.params.id,
        item_name,
        quantity,
        estimated_cost,
        vendor_name,
        request_date,
        description
      ]
    );

    res.status(201).json({ message: "Procurement request added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;