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
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [procurements, setProcurements] = useState([]);

const [itemName, setItemName] = useState("");
const [quantity, setQuantity] = useState("");
const [estimatedCost, setEstimatedCost] = useState("");
const [vendorName, setVendorName] = useState("");
const [requestDate, setRequestDate] = useState("");
const [procurementDescription, setProcurementDescription] = useState("");
const [documentText, setDocumentText] = useState("");
const [deleteMode, setDeleteMode] = useState(false);
const [selectedDocuments, setSelectedDocuments] = useState([]);
  // Add member state
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("JRF");

  // Add milestone state
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");

  const [documentFile, setDocumentFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState("Report");

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Equipment");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");

  const [notifications, setNotifications] = useState([]);
const [notificationTitle, setNotificationTitle] = useState("");
const [notificationMessage, setNotificationMessage] = useState("");
const [notificationType, setNotificationType] = useState("Reminder");
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
const budgetRes = await axios.get(
  `http://localhost:5000/api/budgets/${id}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

setExpenses(budgetRes.data.expenses);
setBudgetSummary(budgetRes.data.summary);
const procurementRes = await axios.get(
  `http://localhost:5000/api/procurement/${id}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

setProcurements(procurementRes.data);
const notificationRes = await axios.get(
  `http://localhost:5000/api/notifications/${id}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

setNotifications(notificationRes.data);
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
    setDocumentFile(null);
fetchProjectDetails();
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

const addExpense = async () => {
  try {
    await axios.post(
      `http://localhost:5000/api/budgets/${id}`,
      {
        title: expenseTitle,
        amount: expenseAmount,
        category: expenseCategory,
        expense_date: expenseDate,
        description: expenseDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Expense added successfully");

    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseCategory("Equipment");
    setExpenseDate("");
    setExpenseDescription("");

    fetchProjectDetails();
  } catch (error) {
    console.error(error);
    alert("Failed to add expense");
  }
};

const addProcurement = async () => {
  try {
    await axios.post(
      `http://localhost:5000/api/procurement/${id}`,
      {
        item_name: itemName,
        quantity,
        estimated_cost: estimatedCost,
        vendor_name: vendorName,
        request_date: requestDate,
        description: procurementDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Procurement request added successfully");

    setItemName("");
    setQuantity("");
    setEstimatedCost("");
    setVendorName("");
    setRequestDate("");
    setProcurementDescription("");

    fetchProjectDetails();
  } catch (error) {
    console.error(error);
    alert("Failed to add procurement request");
  }
};

const updateProcurementStatus = async (requestId, status) => {
  try {
    await axios.put(
      `http://localhost:5000/api/procurement/${requestId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchProjectDetails();
  } catch (error) {
    console.error(error);
    alert("Failed to update procurement status");
  }
};

const addNotification = async () => {
  try {
    await axios.post(
      `http://localhost:5000/api/notifications/${id}`,
      {
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Notification added successfully");

    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationType("Reminder");

    fetchProjectDetails();
  } catch (error) {
    console.error(error);
    alert("Failed to add notification");
  }
};

const extractDatesFromText = async () => {
  try {
    await axios.post(
      `http://localhost:5000/api/extract/${id}`,
      { text: documentText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Dates extracted and reminders created");
    setDocumentText("");
    fetchProjectDetails();
  } catch (error) {
    console.error(error);
    alert("Date extraction failed");
  }
};

const toggleDocumentSelection = (docId) => {
  setSelectedDocuments((prev) =>
    prev.includes(docId)
      ? prev.filter((id) => id !== docId)
      : [...prev, docId]
  );
};

const deleteSelectedDocuments = async () => {
  if (selectedDocuments.length === 0) {
    alert("Please select at least one document");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to move selected documents to Recycle Bin?"
  );

  if (!confirmDelete) return;

  try {
    await axios.put(
      "http://localhost:5000/api/uploads/delete",
      { documentIds: selectedDocuments },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Documents moved to Recycle Bin");
    setSelectedDocuments([]);
    setDeleteMode(false);
    fetchProjectDetails();
  } catch (error) {
    console.error(error);
    alert("Failed to delete documents");
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
  <div style={{ marginBottom: "10px" }}>
  <button
    style={styles.addBtn}
    onClick={() => setDeleteMode(!deleteMode)}
  >
    {deleteMode ? "Cancel Delete" : "Delete Documents"}
  </button>

  {deleteMode && (
    <button
      style={{ ...styles.addBtn, marginTop: "8px", backgroundColor: "#c53030" }}
      onClick={deleteSelectedDocuments}
    >
      Move Selected to Recycle Bin
    </button>
  )}
</div>

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
      {deleteMode && (
  <input
    type="checkbox"
    checked={selectedDocuments.includes(doc.id)}
    onChange={() => toggleDocumentSelection(doc.id)}
    style={{ marginRight: "8px" }}
  />
)}
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
          <div style={styles.card}>
  <h3 style={styles.sectionTitle}>Budget Monitoring</h3>

  {budgetSummary && (
    <div style={styles.infoGrid}>
      <div style={styles.infoItem}>
        <span style={styles.infoLabel}>Total Budget</span>
        <span style={styles.infoValue}>
          ₹{budgetSummary.total_budget}
        </span>
      </div>

      <div style={styles.infoItem}>
        <span style={styles.infoLabel}>Total Spent</span>
        <span style={styles.infoValue}>
          ₹{budgetSummary.total_spent}
        </span>
      </div>

      <div style={styles.infoItem}>
        <span style={styles.infoLabel}>Remaining Balance</span>
        <span style={styles.infoValue}>
          ₹{budgetSummary.remaining_balance}
        </span>
      </div>
    </div>
  )}

  <div style={styles.addSection}>
    <h4 style={styles.addTitle}>Add Expense</h4>

    <input
      style={styles.input}
      type="text"
      placeholder="Expense title"
      value={expenseTitle}
      onChange={(e) => setExpenseTitle(e.target.value)}
    />

    <input
      style={styles.input}
      type="number"
      placeholder="Amount"
      value={expenseAmount}
      onChange={(e) => setExpenseAmount(e.target.value)}
    />

    <select
      style={styles.input}
      value={expenseCategory}
      onChange={(e) => setExpenseCategory(e.target.value)}
    >
      <option>Equipment</option>
      <option>Travel</option>
      <option>Software</option>
      <option>Research Materials</option>
      <option>Miscellaneous</option>
    </select>

    <input
      style={styles.input}
      type="date"
      value={expenseDate}
      onChange={(e) => setExpenseDate(e.target.value)}
    />

    <textarea
      style={styles.input}
      placeholder="Description"
      value={expenseDescription}
      onChange={(e) => setExpenseDescription(e.target.value)}
    />

    <button style={styles.addBtn} onClick={addExpense}>
      Add Expense
    </button>
  </div>

  <h4 style={{ marginTop: "20px" }}>Expense Records</h4>

  {expenses.length === 0 ? (
    <p style={styles.emptyText}>No expenses added yet.</p>
  ) : (
    expenses.map((expense) => (
      <div
        key={expense.id}
        style={{
          border: "1px solid #eee",
          borderRadius: "6px",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <p><strong>{expense.title}</strong></p>
        <p>₹{expense.amount}</p>
        <p>{expense.category}</p>
        <p>
          {new Date(expense.expense_date).toLocaleDateString()}
        </p>
      </div>
    ))
  )}
</div>
<div style={styles.card}>
  <h3 style={styles.sectionTitle}>Procurement Management</h3>

  <div style={styles.addSection}>
    <h4 style={styles.addTitle}>Add Procurement Request</h4>

    <input
      style={styles.input}
      type="text"
      placeholder="Item name"
      value={itemName}
      onChange={(e) => setItemName(e.target.value)}
    />

    <input
      style={styles.input}
      type="number"
      placeholder="Quantity"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
    />

    <input
      style={styles.input}
      type="number"
      placeholder="Estimated cost"
      value={estimatedCost}
      onChange={(e) => setEstimatedCost(e.target.value)}
    />

    <input
      style={styles.input}
      type="text"
      placeholder="Vendor name"
      value={vendorName}
      onChange={(e) => setVendorName(e.target.value)}
    />

    <input
      style={styles.input}
      type="date"
      value={requestDate}
      onChange={(e) => setRequestDate(e.target.value)}
    />

    <textarea
      style={styles.input}
      placeholder="Description"
      value={procurementDescription}
      onChange={(e) => setProcurementDescription(e.target.value)}
    />

    <button style={styles.addBtn} onClick={addProcurement}>
      Add Procurement Request
    </button>
  </div>

  <h4 style={{ marginTop: "20px" }}>Procurement Records</h4>

  {procurements.length === 0 ? (
    <p style={styles.emptyText}>No procurement requests added yet.</p>
  ) : (
    procurements.map((item) => (
      <div
        key={item.id}
        style={{
          border: "1px solid #eee",
          borderRadius: "6px",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <p><strong>{item.item_name}</strong></p>
        <p>Quantity: {item.quantity}</p>
        <p>Estimated Cost: ₹{item.estimated_cost}</p>
        <p>Vendor: {item.vendor_name || "N/A"}</p>
        <div style={{ marginTop: "10px" }}>
  <label>Status: </label>

  <select
    value={item.status}
    onChange={(e) =>
      updateProcurementStatus(item.id, e.target.value)
    }
    style={{
      padding: "5px",
      borderRadius: "5px",
      marginLeft: "10px",
    }}
  >
    <option>Pending</option>
    <option>Approved</option>
    <option>Ordered</option>
    <option>Delivered</option>
  </select>
</div>
        <p>Date: {new Date(item.request_date).toLocaleDateString()}</p>
      </div>
    ))
  )}
</div>
<div style={styles.card}>
  <h3 style={styles.sectionTitle}>Notifications & Reminders</h3>

  <div style={styles.addSection}>
    <h4 style={styles.addTitle}>Add Reminder</h4>

    <input
      style={styles.input}
      type="text"
      placeholder="Notification title"
      value={notificationTitle}
      onChange={(e) => setNotificationTitle(e.target.value)}
    />

    <textarea
      style={styles.input}
      placeholder="Message"
      value={notificationMessage}
      onChange={(e) => setNotificationMessage(e.target.value)}
    />

    <select
      style={styles.input}
      value={notificationType}
      onChange={(e) => setNotificationType(e.target.value)}
    >
      <option>Reminder</option>
      <option>Deadline Alert</option>
      <option>Budget Alert</option>
      <option>Procurement Alert</option>
    </select>

    <button style={styles.addBtn} onClick={addNotification}>
      Add Notification
    </button>
  </div>

  <h4 style={{ marginTop: "20px" }}>Project Alerts</h4>

  {notifications.length === 0 ? (
    <p style={styles.emptyText}>No notifications yet.</p>
  ) : (
    notifications.map((note) => (
      <div
        key={note.id}
        style={{
          border: "1px solid #eee",
          borderRadius: "6px",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <p><strong>{note.title}</strong></p>
        <p>{note.message}</p>
        <p>Type: {note.type}</p>
      </div>
    ))
  )}
</div>
<div style={styles.card}>
  <h3 style={styles.sectionTitle}>Automatic Reminder Extraction</h3>

  <p style={styles.emptyText}>
    Paste text from funding agency forms, sanction orders, or reports. The system will detect dates and create reminders automatically.
  </p>

  <textarea
    style={styles.input}
    placeholder="Paste document text here..."
    value={documentText}
    onChange={(e) => setDocumentText(e.target.value)}
  />

  <button style={styles.addBtn} onClick={extractDatesFromText}>
    Extract Dates & Create Reminders
  </button>
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