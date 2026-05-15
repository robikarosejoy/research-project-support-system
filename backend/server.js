const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/upload");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const documentRoutes = require("./routes/document");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/uploads", uploadRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Research Project Support Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});