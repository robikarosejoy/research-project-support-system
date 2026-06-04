import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fileInputRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [budgetSummary, setBudgetSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [procurements, setProcurements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("JRF");

  const [documentFile, setDocumentFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState("Report");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Equipment");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [procurementDescription, setProcurementDescription] = useState("");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("Reminder");

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data);

      const membersRes = await axios.get(
        `http://localhost:5000/api/projects/${id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(membersRes.data);

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
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add member");
    }
  };

  const uploadDocument = async () => {
    try {
      if (!documentFile) {
        alert("Please choose a document first");
        return;
      }

      const formData = new FormData();
      formData.append("document", documentFile);
      formData.append("document_category", documentCategory);

      await fetch(`http://localhost:5000/api/uploads/${id}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      alert("Document uploaded successfully");
      // Auto create reminder from uploaded document


      setDocumentFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  const downloadDocument = async (doc) => {
    try {
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

  const deleteNotification = async (notificationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      alert("Failed to delete reminder");
    }
  };

  if (loading) return <p style={{ padding: "32px" }}>Loading...</p>;
  if (!project) return <p style={{ padding: "32px" }}>Project not found.</p>;

const generateSummary = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/projects/${id}/summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSummary(res.data);
  } catch (error) {
    console.error(error);
    alert("Failed to generate summary");
  }
};

  return (
    <div style={styles.container}>
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
              <span style={styles.infoValue}>
                ₹{Number(project.total_budget).toLocaleString()}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Start Date</span>
              <span style={styles.infoValue}>
                {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>End Date</span>
              <span style={styles.infoValue}>
                {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.twoCol}>
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

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Project Documents</h3>

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
              ref={fileInputRef}
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
                  style={{
                    ...styles.addBtn,
                    marginTop: "8px",
                    backgroundColor: "#c53030",
                  }}
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

                  <p>
                    <strong>{doc.file_name}</strong>
                  </p>

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
                  <p>
                    <strong>{expense.title}</strong>
                  </p>
                  <p>₹{expense.amount}</p>
                  <p>{expense.category}</p>
                  <p>{new Date(expense.expense_date).toLocaleDateString()}</p>
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
                  <p>
                    <strong>{item.item_name}</strong>
                  </p>

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

                  <p>{new Date(item.request_date).toLocaleDateString()}</p>
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
                  <p>
                    <strong>{note.title}</strong>
                  </p>

                  <p>{note.message}</p>
                  <p>Type: {note.type}</p>

                  <button
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#c53030",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => deleteNotification(note.id)}
                  >
                    Delete Reminder
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: {
    minHeight: "100vh",
    background: "#eef3f8",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#111827",
  },

  header: {
    background: "#ffffff",
    padding: "22px 42px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
  },

  headerTitle: {
    color: "#111827",
    fontSize: "28px",
    margin: 0,
    fontWeight: "800",
    letterSpacing: "-0.6px",
  },

  headerSubtitle: {
    color: "#6b7280",
    margin: "4px 0 0 0",
    fontSize: "14px",
  },

  backBtn: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 10px 20px rgba(17, 24, 39, 0.15)",
  },

  content: {
    padding: "34px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "26px",
    padding: "26px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    marginBottom: "26px",
    border: "1px solid rgba(229,231,235,0.9)",
  },

  statusBadge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#15803d",
    padding: "7px 15px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "14px",
  },

  projectTitle: {
    fontSize: "34px",
    color: "#0f172a",
    marginBottom: "8px",
    fontWeight: "900",
    letterSpacing: "-1px",
  },

  projectDesc: {
    color: "#64748b",
    marginBottom: "24px",
    fontSize: "15px",
    lineHeight: "1.7",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "16px",
  },

  infoItem: {
    background: "#f8fafc",
    borderRadius: "20px",
    padding: "18px",
    border: "1px solid #e5e7eb",
  },

  infoLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "8px",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: "900",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(430px, 1fr))",
    gap: "26px",
  },

  sectionTitle: {
    fontSize: "22px",
    color: "#0f172a",
    marginBottom: "20px",
    fontWeight: "900",
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    padding: "18px",
    textAlign: "center",
  },

  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "16px",
    marginBottom: "10px",
  },

  memberName: {
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: "800",
  },

  memberRole: {
    fontSize: "12px",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "800",
  },

  addSection: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid #f1f5f9",
  },

  addTitle: {
    fontSize: "16px",
    color: "#334155",
    marginBottom: "12px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    padding: "13px 15px",
    marginBottom: "13px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#f8fafc",
    outline: "none",
  },

  addBtn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "800",
    boxShadow: "0 12px 22px rgba(37,99,235,0.18)",
  },
};
export default ProjectDetail;
