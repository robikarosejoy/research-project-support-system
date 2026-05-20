const express = require("express");
const multer = require("multer");
const path = require("path");
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
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }
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
    message: "No file uploaded"
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
    document_category
  ]
);

const uploadedDocumentId = documentResult.rows[0].id;

      // AUTO EXTRACT DATES FROM UPLOADED PDF
if (req.file.mimetype === "application/pdf") {
  const fileBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(fileBuffer);

  const extractedDates = chrono.parse(pdfData.text);

  for (const dateItem of extractedDates) {
    const extractedDate = dateItem.start.date();

 await pool.query(
  `INSERT INTO notifications
   (project_id, title, message, type, document_id)
   VALUES ($1, $2, $3, $4, $5)`,
  [
    req.params.id,
    "Auto-generated Reminder",
    `${pdfData.text
  .substring(
    Math.max(0, dateItem.index - 40),
    dateItem.index + dateItem.text.length + 40
  )
  .replace(/\s+/g, " ")
  .trim()
  .replace(
    dateItem.text,
    `**${dateItem.text.toUpperCase()}**`
  )}`,
    "Deadline Alert",
    uploadedDocumentId
  ]
);
}
}

      res.status(201).json({
        message: "Document uploaded successfully"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error"
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
      message: "Server error"
    });
  }
});

// DOWNLOAD DOCUMENT
router.get("/download/:documentId", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM documents WHERE id = $1",
      [req.params.documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    const document = result.rows[0];

    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// MOVE DOCUMENTS TO RECYCLE BIN
router.put("/delete", authMiddleware, async (req, res) => {
  try {
    const { documentIds } = req.body;

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
      message: "Documents moved to recycle bin"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;