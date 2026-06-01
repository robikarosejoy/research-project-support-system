const express = require("express");
const multer = require("multer");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/emailService");

const router = express.Router();

const fs = require("fs");
const pdfParse = require("pdf-parse");
const chrono = require("chrono-node");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const isSameDate = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  return d1.getTime() === d2.getTime();
};

const parseIndianDate = (dateText, fallbackDate) => {
  const numericDateMatch = dateText.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (numericDateMatch) {
    const day = parseInt(numericDateMatch[1], 10);
    const month = parseInt(numericDateMatch[2], 10) - 1;
    const year = parseInt(numericDateMatch[3], 10);

    return new Date(year, month, day, 12, 0, 0);
  }

  return fallbackDate;
};

router.post(
  "/:id/upload",
  authMiddleware,
  upload.single("document"),
  async (req, res) => {
    try {
      const { document_category } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const documentResult = await pool.query(
        `INSERT INTO documents
         (project_id, file_name, file_type, file_path, document_category)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          req.params.id,
          req.file.originalname,
          req.file.mimetype,
          req.file.path,
          document_category,
        ]
      );

      const uploadedDocumentId = documentResult.rows[0].id;

      if (req.file.mimetype === "application/pdf") {
        const fileBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(fileBuffer);

        const extractedDates = chrono.parse(pdfData.text);

        const validDates = extractedDates.filter((d) => {
          const detectedText = d.text.trim();

          return (
            /\b\d{1,2}[-\/ ]\d{1,2}[-\/ ]\d{2,4}\b/.test(detectedText) ||
            /\b\d{1,2}[-\/ ](?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[-\/ ]\d{2,4}\b/i.test(detectedText) ||
            /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+\d{4}\b/i.test(detectedText) ||
            /\b\d{1,2}(st|nd|rd|th)?\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{4}\b/i.test(detectedText)
          );
        });

        if (validDates.length > 0) {
          const firstDate = validDates[0];
          const cleanDate = firstDate.text.trim().toUpperCase();
          const deadlineDate = parseIndianDate(cleanDate, firstDate.start.date());

          const reminderDays = [30, 15, 7, 3, 1];
          const today = new Date();

          let immediateReminderCreated = false;

          for (const daysBefore of reminderDays) {
            const reminderDate = new Date(deadlineDate);
            reminderDate.setDate(reminderDate.getDate() - daysBefore);

            const reminderResult = await pool.query(
              `INSERT INTO deadline_reminders
               (project_id, document_id, deadline_date, reminder_days_before, reminder_date)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id`,
              [
                req.params.id,
                uploadedDocumentId,
                deadlineDate,
                daysBefore,
                reminderDate,
              ]
            );

            if (isSameDate(reminderDate, today)) {
              immediateReminderCreated = true;

              const reminderMessage =
                `Document: ${req.file.originalname}\n` +
                `Deadline: ${cleanDate}\n` +
                `${daysBefore} day(s) remaining.`;

              await pool.query(
                `INSERT INTO notifications
                 (project_id, title, message, type, document_id)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                  req.params.id,
                  "Deadline Reminder",
                  reminderMessage,
                  "Reminder",
                  uploadedDocumentId,
                ]
              );

              const projectUser = await pool.query(
                `SELECT u.email
                 FROM projects p
                 JOIN users u ON p.pi_id = u.id
                 WHERE p.id = $1`,
                [req.params.id]
              );

              if (projectUser.rows.length > 0) {
                const emailSent = await sendEmail(
                  projectUser.rows[0].email,
                  `Project Deadline Reminder (${daysBefore} Day Left)`,
                  reminderMessage
                );

                console.log("Immediate reminder email sent:", emailSent);
              } else {
                console.log("No PI email found for this project");
              }

              await pool.query(
                `UPDATE deadline_reminders
                 SET email_sent = true,
                     popup_created = true
                 WHERE id = $1`,
                [reminderResult.rows[0].id]
              );
            }
          }

          if (!immediateReminderCreated) {
            await pool.query(
              `INSERT INTO notifications
               (project_id, title, message, type, document_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                req.params.id,
                "Deadline Detected",
                `Document: ${req.file.originalname}\nDeadline: ${cleanDate}`,
                "Deadline Alert",
                uploadedDocumentId,
              ]
            );
          }
        }
      }

      res.status(201).json({
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

router.get("/:id/documents", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM documents
       WHERE project_id = $1 AND is_deleted = false
       ORDER BY uploaded_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/download/:documentId", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM documents WHERE id = $1",
      [req.params.documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = result.rows[0];
    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/delete", authMiddleware, async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || documentIds.length === 0) {
      return res.status(400).json({ message: "No documents selected" });
    }

    await pool.query(
      `UPDATE documents
       SET is_deleted = true,
           deleted_at = CURRENT_TIMESTAMP
       WHERE id = ANY($1::int[])`,
      [documentIds]
    );

    await pool.query(
      `DELETE FROM notifications
       WHERE document_id = ANY($1::int[])`,
      [documentIds]
    );

    res.json({ message: "Documents moved to recycle bin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;