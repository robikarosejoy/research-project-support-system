const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

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

      await pool.query(
        `INSERT INTO documents
        (project_id, file_name, file_type, file_path, document_category)
        VALUES ($1, $2, $3, $4, $5)`,

        [
          req.params.id,
          req.file.originalname,
          req.file.mimetype,
          req.file.path,
          document_category
        ]
      );

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

module.exports = router;