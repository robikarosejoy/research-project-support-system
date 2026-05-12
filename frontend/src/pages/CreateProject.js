import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fundingAgency, setFundingAgency] = useState("ANRF");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleCreate = async () => {
    setError("");
    if (!title || !totalBudget || !startDate || !endDate) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/projects/create",
        {
          title,
          description,
          funding_agency: fundingAgency,
          total_budget: totalBudget,
          start_date: startDate,
          end_date: endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Project created successfully!");
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to create project. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <h2 style={styles.title}>Create New Project</h2>
          <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Project Title *</label>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={styles.label}>Description</label>
        <textarea
          style={styles.textarea}
          placeholder="Enter project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label style={styles.label}>Funding Agency *</label>
        <select
          style={styles.input}
          value={fundingAgency}
          onChange={(e) => setFundingAgency(e.target.value)}
        >
          <option value="ANRF">ANRF</option>
          <option value="DST">DST</option>
          <option value="CSIR">CSIR</option>
          <option value="ICMR">ICMR</option>
          <option value="DBT">DBT</option>
          <option value="Other">Other</option>
        </select>

        <label style={styles.label}>Total Budget (₹) *</label>
        <input
          style={styles.input}
          type="number"
          placeholder="Enter total budget"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
        />

        <div style={styles.dateRow}>
          <div style={styles.dateField}>
            <label style={styles.label}>Start Date *</label>
            <input
              style={styles.input}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div style={styles.dateField}>
            <label style={styles.label}>End Date *</label>
            <input
              style={styles.input}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          style={styles.button}
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    padding: "32px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "22px", color: "#1a365d", margin: 0 },
  backBtn: {
    backgroundColor: "transparent",
    border: "1px solid #1a365d",
    color: "#1a365d",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#444",
    marginBottom: "6px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    height: "100px",
    resize: "vertical",
  },
  dateRow: {
    display: "flex",
    gap: "16px",
  },
  dateField: { flex: 1 },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1a365d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: { color: "red", marginBottom: "12px", fontSize: "14px" },
};

export default CreateProject;