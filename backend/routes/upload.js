const express = require("express");
const multer = require("multer");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const fs = require("fs");
const pdfParse = require("pdf-parse");
const chrono = require("chrono-node");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// UPLOAD DOCUMENT
router.post(
  "/:id/upload",
  authMiddleware,
  upload.single("document"),
  async (req, res) => {
    try {
      const { document_category } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
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

      // AUTO EXTRACT ONLY ONE VALID DATE FROM UPLOADED PDF
      if (req.file.mimetype === "application/pdf") {
        const fileBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(fileBuffer);

        const extractedDates = chrono.parse(pdfData.text);

        const validDates = extractedDates.filter((d) => {
          const detectedText = d.text.trim();

          return (
            /\b\d{1,2}[-\/ ]\d{1,2}[-\/ ]\d{2,4}\b/.test(detectedText) ||
            /\b\d{1,2}[-\/ ](?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[-\/ ]\d{2,4}\b/i.test(
              detectedText
            ) ||
            /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+\d{4}\b/i.test(
              detectedText
            ) ||
            /\b\d{1,2}(st|nd|rd|th)?\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{4}\b/i.test(
              detectedText
            )
          );
        });

        if (validDates.length > 0) {
  const firstDate = validDates[0];

  const deadlineDate = firstDate.start.date();

  const cleanDate = firstDate.text.trim().toUpperCase();

  // CREATE INITIAL NOTIFICATION
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

  // REMINDER DAYS
  const reminderDays = [30, 15, 7, 3, 1];

  for (const daysBefore of reminderDays) {
    const reminderDate = new Date(deadlineDate);

    reminderDate.setDate(
      reminderDate.getDate() - daysBefore
    );

    await pool.query(
      `INSERT INTO deadline_reminders
       (project_id, document_id, deadline_date,
        reminder_days_before, reminder_date)
       VALUES ($1, $2, $3, $4, $5)`,

      [
        req.params.id,
        uploadedDocumentId,
        deadlineDate,
        daysBefore,
        reminderDate,
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

// GET DOCUMENTS FOR A PROJECT
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
    res.status(500).json({
      message: "Server error",
    });
  }
});

// DOWNLOAD DOCUMENT
router.get("/download/:documentId", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM documents WHERE id = $1", [
      req.params.documentId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const document = result.rows[0];

    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// MOVE DOCUMENTS TO RECYCLE BIN
router.put("/delete", authMiddleware, async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || documentIds.length === 0) {
      return res.status(400).json({
        message: "No documents selected",
      });
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

    res.json({
      message: "Documents moved to recycle bin",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;