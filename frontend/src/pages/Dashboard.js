import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Research Project Support System</h1>
          <p style={styles.headerSubtitle}>NIT Calicut</p>
        </div>
        <div style={styles.headerRight}>
          <p style={styles.welcomeText}>Welcome, {name} ({role})</p>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>My Projects</h2>
          {role === "PI" && (
            <button
              style={styles.createBtn}
              onClick={() => navigate("/create-project")}
            >
              + Create New Project
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No projects found.</p>
            {role === "PI" && (
              <button
                style={styles.createBtn}
                onClick={() => navigate("/create-project")}
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div style={styles.projectGrid}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.projectStatus}>{project.status}</div>
                <h3 style={styles.projectTitle}>{project.title}</h3>
                <p style={styles.projectDesc}>{project.description}</p>
                <div style={styles.projectInfo}>
                  <span>📋 {project.funding_agency}</span>
                  <span>💰 ₹{Number(project.total_budget).toLocaleString()}</span>
                </div>
                <div style={styles.projectDates}>
                  <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f4f8" },
  header: {
    backgroundColor: "#1a365d",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "white", fontSize: "20px", margin: 0 },
  headerSubtitle: { color: "#90cdf4", margin: 0, fontSize: "14px" },
  headerRight: { textAlign: "right" },
  welcomeText: { color: "white", margin: "0 0 8px 0", fontSize: "14px" },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: { padding: "32px" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  pageTitle: { fontSize: "24px", color: "#1a365d", margin: 0 },
  createBtn: {
    backgroundColor: "#1a365d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  emptyState: { textAlign: "center", padding: "60px", color: "#666" },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  projectCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  projectStatus: {
    display: "inline-block",
    backgroundColor: "#c6f6d5",
    color: "#276749",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    marginBottom: "12px",
  },
  projectTitle: { fontSize: "18px", color: "#1a365d", marginBottom: "8px" },
  projectDesc: { color: "#666", fontSize: "14px", marginBottom: "16px" },
  projectInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#444",
    marginBottom: "8px",
  },
  projectDates: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#888",
  },
};

export default Dashboard;