const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET BUDGET / EXPENSES FOR PROJECT
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const expenses = await pool.query(
      `SELECT * FROM budgets
       WHERE project_id = $1
       ORDER BY expense_date DESC`,
      [req.params.id]
    );

    const summary = await pool.query(
      `SELECT 
        COALESCE(SUM(amount), 0) AS total_spent
       FROM budgets
       WHERE project_id = $1`,
      [req.params.id]
    );

    const project = await pool.query(
      `SELECT total_budget FROM projects WHERE id = $1`,
      [req.params.id]
    );

    const totalBudget = Number(project.rows[0]?.total_budget || 0);
    const totalSpent = Number(summary.rows[0].total_spent || 0);
    const remainingBalance = totalBudget - totalSpent;

    res.json({
      expenses: expenses.rows,
      summary: {
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_balance: remainingBalance
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD EXPENSE
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, amount, category, expense_date, description } = req.body;

    await pool.query(
      `INSERT INTO budgets
       (project_id, title, amount, category, expense_date, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, title, amount, category, expense_date, description]
    );

    res.status(201).json({
      message: "Expense added successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;