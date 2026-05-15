import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add member state
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("JRF");

  // Add milestone state
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");

  const [documentFile, setDocumentFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState("Report");

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data);

      const membersRes = await axios.get(`http://localhost:5000/api/projects/${id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(membersRes.data);

      const milestonesRes = await axios.get(`http://localhost:5000/api/projects/${id}/milestones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMilestones(milestonesRes.data);

      const documentsRes = await axios.get(
  `http://localhost:5000/api/uploads/${id}/documents`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

setDocuments(documentsRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/projects/${id}/members`,
        { email: memberEmail, role: memberRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemberEmail("");
      await fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleAddMilestone = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/projects/${id}/milestones`,
        { title: milestoneTitle, due_date: milestoneDueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Milestone added!");
      setMilestoneTitle("");
      setMilestoneDueDate("");
      fetchProjectDetails();
    } catch (error) {
      alert("Failed to add milestone");
    }
  };

  if (loading) return <p style={{ padding: "32px" }}>Loading...</p>;
  if (!project) return <p style={{ padding: "32px" }}>Project not found.</p>;

  const generateSummary = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/documents/${id}/generate-summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "project-summary.txt";

    document.body.appendChild(a);
    a.click();
    a.remove();

  } catch (error) {
    console.error(error);
  }
};
const uploadDocument = async () => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("document", documentFile);
    formData.append("document_category", documentCategory);

    await fetch(`http://localhost:5000/api/uploads/${id}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    alert("Document uploaded successfully");
  } catch (error) {
    console.error(error);
    alert("Upload failed");
  }
};

const downloadDocument = async (doc) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/uploads/download/${doc.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = doc.file_name;

    document.body.appendChild(a);
    a.click();
    a.remove();

  } catch (error) {
    console.error(error);
    alert("Download failed");
  }
};



  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Research Project Support System</h1>
          <p style={styles.headerSubtitle}>NIT Calicut</p>
        </div>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* Project Info */}
        <div style={styles.card}>
          <div style={styles.statusBadge}>{project.status}</div>
          <h2 style={styles.projectTitle}>{project.title}</h2>
          <p style={styles.projectDesc}>{project.description}</p>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Funding Agency</span>
              <span style={styles.infoValue}>{project.funding_agency}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Total Budget</span>
              <span style={styles.infoValue}>₹{Number(project.total_budget).toLocaleString()}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Start Date</span>
              <span style={styles.infoValue}>{new Date(project.start_date).toLocaleDateString()}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>End Date</span>
              <span style={styles.infoValue}>{new Date(project.end_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div style={styles.twoCol}>
          {/* Team Members */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Team Members</h3>
            {members.length === 0 ? (
              <p style={styles.emptyText}>No members added yet.</p>
            ) : (
              members.map((m) => (
                <div key={m.id} style={styles.memberItem}>
                  <span style={styles.memberName}>{m.name}</span>
                  <span style={styles.memberRole}>{m.role}</span>
                </div>
              ))
            )}

            {role === "PI" && (
              <div style={styles.addSection}>
                <h4 style={styles.addTitle}>Add Member</h4>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Member email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                <select
                  style={styles.input}
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                >
                  <option value="Co-PI">Co-PI</option>
                  <option value="JRF">JRF</option>
                  <option value="SRF">SRF</option>
                </select>
                <button style={styles.addBtn} onClick={handleAddMember}>
                  Add Member
                </button>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Milestones & Deadlines</h3>
            {milestones.length === 0 ? (
              <p style={styles.emptyText}>No milestones added yet.</p>
            ) : (
              milestones.map((m) => (
                <div key={m.id} style={styles.milestoneItem}>
                  <div>
                    <span style={styles.milestoneTitle}>{m.title}</span>
                    <span style={styles.milestoneDate}>Due: {new Date(m.due_date).toLocaleDateString()}</span>
                  </div>
                  <span style={{
                    ...styles.milestoneStatus,
                    backgroundColor: m.status === "Completed" ? "#c6f6d5" : "#fefcbf",
                    color: m.status === "Completed" ? "#276749" : "#744210"
                  }}>
                    {m.status}
                  </span>
                </div>
              ))
            )}

            {role === "PI" && (
              <div style={styles.addSection}>
                <h4 style={styles.addTitle}>Add Milestone</h4>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Milestone title"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="date"
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                />
                <button style={styles.addBtn} onClick={handleAddMilestone}>
                  Add Milestone
                </button>
                <button style={styles.addBtn} onClick={generateSummary}>
  Generate Summary
</button>

<div style={{ marginTop: "20px" }}>
  <h4 style={styles.addTitle}>Upload Project Document</h4>

  <select
    style={styles.input}
    value={documentCategory}
    onChange={(e) => setDocumentCategory(e.target.value)}
  >
    <option>Sanction Order</option>
    <option>Report</option>
    <option>Bill</option>
    <option>Certificate</option>
    <option>Other</option>
  </select>

  <input
    style={styles.input}
    type="file"
    onChange={(e) => setDocumentFile(e.target.files[0])}
  />

  <button style={styles.addBtn} onClick={uploadDocument}>
    Upload Document
  </button>
  <h4 style={{ marginTop: "20px" }}>Uploaded Documents</h4>

{documents.length === 0 ? (
  <p style={styles.emptyText}>No documents uploaded yet.</p>
) : (
  documents.map((doc) => (
    <div
      key={doc.id}
      style={{
        padding: "10px",
        border: "1px solid #eee",
        borderRadius: "6px",
        marginTop: "10px",
      }}
    >
      <p><strong>{doc.file_name}</strong></p>
      <p>{doc.document_category}</p>

      
     <button
  style={styles.addBtn}
  onClick={() => downloadDocument(doc)}
>
  Download
</button>
    </div>
  ))
)}
</div>
              </div>
            )}
          </div>
        </div>
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
  backBtn: {
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: { padding: "32px" },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },
  statusBadge: {
    display: "inline-block",
    backgroundColor: "#c6f6d5",
    color: "#276749",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    marginBottom: "12px",
  },
  projectTitle: { fontSize: "24px", color: "#1a365d", marginBottom: "8px" },
  projectDesc: { color: "#666", marginBottom: "16px" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  infoItem: { display: "flex", flexDirection: "column" },
  infoLabel: { fontSize: "12px", color: "#888", marginBottom: "4px" },
  infoValue: { fontSize: "16px", color: "#1a365d", fontWeight: "bold" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  sectionTitle: { fontSize: "18px", color: "#1a365d", marginBottom: "16px" },
  emptyText: { color: "#888", fontSize: "14px" },
  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  memberName: { fontSize: "14px", color: "#333" },
  memberRole: {
    fontSize: "12px",
    backgroundColor: "#ebf8ff",
    color: "#2b6cb0",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  milestoneItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  milestoneTitle: { fontSize: "14px", color: "#333", display: "block" },
  milestoneDate: { fontSize: "12px", color: "#888" },
  milestoneStatus: {
    fontSize: "12px",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  addSection: { marginTop: "16px", borderTop: "1px solid #f0f0f0", paddingTop: "16px" },
  addTitle: { fontSize: "14px", color: "#444", marginBottom: "12px" },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  addBtn: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#1a365d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ProjectDetail;