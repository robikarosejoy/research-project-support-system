const express = require("express");
const chrono = require("chrono-node");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// EXTRACT DATES FROM TEXT AND CREATE REMINDERS
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    const dates = chrono.parse(text);

    for (const dateItem of dates) {
      const extractedDate = dateItem.start.date();

      await pool.query(
        `INSERT INTO notifications
         (project_id, title, message, type)
         VALUES ($1, $2, $3, $4)`,
        [
          req.params.id,
          "Auto-generated Reminder",
          `Possible deadline detected: ${dateItem.text} (${extractedDate.toDateString()})`,
          "Deadline Alert",
        ]
      );
    }

    res.json({
      message: "Dates extracted and reminders created",
      extracted_dates: dates.map((d) => ({
        text: d.text,
        date: d.start.date(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;