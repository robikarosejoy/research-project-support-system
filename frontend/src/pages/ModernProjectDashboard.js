import { useState } from "react";

const theme = {
  bg: "#f5f3ef",
  surface: "#faf9f7",
  white: "#ffffff",
  ink: "#1a1714",
  inkMuted: "#7c7269",
  inkLight: "#b5ada4",
  accent: "#c17b3a",
  accentLight: "#f5e8d8",
  blue: "#3b6fa0",
  blueLight: "#dde8f5",
  green: "#3a7c5e",
  greenLight: "#d8ede5",
  red: "#a03b3b",
  redLight: "#f5ddd8",
  border: "#e8e3dc",
  borderLight: "#f0ece6",
};

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const css = `
  ${fonts}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${theme.bg}; }

  .fade-in { animation: fadeIn 0.5s ease both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

  .card { animation: cardIn 0.5s ease both; }
  @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

  input, select, textarea {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid ${theme.border};
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: ${theme.ink};
    background: ${theme.white};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: vertical;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px ${theme.accentLight};
  }
  input::placeholder, textarea::placeholder { color: ${theme.inkLight}; }

  button { cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  button:active { transform: scale(0.97); }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 99px; }

  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 99px;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.3px;
  }

  .section-card {
    background: ${theme.white};
    border-radius: 22px;
    border: 1.5px solid ${theme.borderLight};
    padding: 26px;
    box-shadow: 0 2px 16px rgba(26,23,20,0.04), 0 1px 3px rgba(26,23,20,0.03);
    animation: cardIn 0.5s ease both;
  }

  .primary-btn {
    background: ${theme.ink};
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 600;
    width: 100%;
    letter-spacing: 0.2px;
  }
  .primary-btn:hover { background: #2d2824; box-shadow: 0 6px 20px rgba(26,23,20,0.15); }

  .ghost-btn {
    background: transparent;
    color: ${theme.red};
    border: 1.5px solid ${theme.redLight};
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 600;
  }
  .ghost-btn:hover { background: ${theme.redLight}; }

  .divider { border: none; border-top: 1.5px solid ${theme.borderLight}; margin: 20px 0; }

  .record-item {
    background: ${theme.surface};
    border: 1.5px solid ${theme.borderLight};
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 10px;
    transition: box-shadow 0.2s;
  }
  .record-item:hover { box-shadow: 0 4px 14px rgba(26,23,20,0.06); }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${theme.inkLight};
    margin-bottom: 14px;
  }

  .section-heading {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 600;
    color: ${theme.ink};
    margin-bottom: 18px;
    letter-spacing: -0.3px;
  }

  .form-group { margin-bottom: 11px; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
`;

const ROLES = ["JRF", "SRF", "RA", "PI", "Co-PI", "Project Staff"];
const EXPENSE_CATS = ["Equipment", "Travel", "Consumables", "Manpower", "Overhead", "Other"];
const DOC_TYPES = ["Report", "Invoice", "Certificate", "Proposal", "Publication", "Other"];
const NOTIF_TYPES = ["Reminder", "Alert", "Deadline", "Meeting", "Other"];

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatCurrency(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function InfoBar({ project }) {
  const totalExpenses = project.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const budget = Number(project.budget || 0);
  const pct = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;

  const tiles = [
    { label: "Funding Agency", value: project.fundingAgency || "—", color: theme.blueLight, accent: theme.blue },
    { label: "Total Budget", value: budget ? formatCurrency(budget) : "—", color: theme.accentLight, accent: theme.accent },
    { label: "Spent", value: totalExpenses ? formatCurrency(totalExpenses) : "₹0", color: theme.redLight, accent: theme.red },
    { label: "Start Date", value: formatDate(project.startDate) || "—", color: theme.greenLight, accent: theme.green },
    { label: "End Date", value: formatDate(project.endDate) || "—", color: "#f0ece6", accent: theme.inkMuted },
  ];

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        {tiles.map((t) => (
          <div key={t.label} style={{
            background: t.color, borderRadius: 16, padding: "14px 20px", flex: "1 1 150px", minWidth: 130,
            border: `1.5px solid ${t.color}`,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: t.accent, marginBottom: 5 }}>{t.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: theme.ink, letterSpacing: -0.3 }}>{t.value}</div>
          </div>
        ))}
      </div>
      {budget > 0 && (
        <div style={{ background: theme.white, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${theme.borderLight}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.inkMuted }}>Budget Utilisation</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: pct > 85 ? theme.red : theme.green }}>{pct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: theme.borderLight, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99, width: `${pct}%`,
              background: pct > 85 ? `linear-gradient(90deg, ${theme.accent}, ${theme.red})` : `linear-gradient(90deg, ${theme.accent}, ${theme.green})`,
              transition: "width 0.8s cubic-bezier(.4,0,.2,1)"
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function TeamSection({ members, setMembers }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("JRF");

  const add = () => {
    if (!email.trim()) return;
    setMembers([...members, { id: Date.now(), email: email.trim(), role }]);
    setEmail("");
  };

  return (
    <div className="section-card">
      <div className="section-label">Team</div>
      <div className="section-heading">Members</div>
      {members.length === 0 ? (
        <p style={{ color: theme.inkLight, fontSize: 13.5, textAlign: "center", padding: "12px 0" }}>No members yet</p>
      ) : members.map(m => (
        <div className="record-item" key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: theme.ink }}>{m.email}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tag" style={{ background: theme.blueLight, color: theme.blue }}>{m.role}</span>
            <button onClick={() => setMembers(members.filter(x => x.id !== m.id))}
              style={{ background: "none", border: "none", color: theme.inkLight, fontSize: 16, lineHeight: 1, padding: "2px 5px" }}>×</button>
          </div>
        </div>
      ))}
      <hr className="divider" />
      <div className="section-label" style={{ marginBottom: 12 }}>Add Member</div>
      <div className="form-group"><input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} /></div>
      <div className="form-group">
        <select value={role} onChange={e => setRole(e.target.value)}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <button className="primary-btn" onClick={add}>Add Member</button>
    </div>
  );
}

function DocsSection({ docs, setDocs }) {
  const [type, setType] = useState("Report");
  const [file, setFile] = useState(null);
  const [selected, setSelected] = useState([]);

  const upload = () => {
    if (!file) return;
    setDocs([...docs, { id: Date.now(), name: file.name, type, date: new Date().toISOString() }]);
    setFile(null);
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const deleteSelected = () => { setDocs(docs.filter(d => !selected.includes(d.id))); setSelected([]); };

  const typeColors = { Report: [theme.blueLight, theme.blue], Invoice: [theme.accentLight, theme.accent], Certificate: [theme.greenLight, theme.green], Proposal: ["#ede8f5", "#6b3fa0"], Publication: [theme.redLight, theme.red], Other: ["#f0ece6", theme.inkMuted] };

  return (
    <div className="section-card">
      <div className="section-label">Files</div>
      <div className="section-heading">Documents</div>
      {docs.length === 0 ? (
        <p style={{ color: theme.inkLight, fontSize: 13.5, textAlign: "center", padding: "12px 0" }}>No documents yet</p>
      ) : docs.map(d => {
        const [bg, fg] = typeColors[d.type] || typeColors.Other;
        return (
          <div className="record-item" key={d.id} style={{ display: "flex", gap: 10, alignItems: "center" }} onClick={() => toggleSelect(d.id)}>
            <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} style={{ width: 15, accentColor: theme.accent }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: theme.ink }}>{d.name}</div>
              <div style={{ fontSize: 11.5, color: theme.inkLight, marginTop: 2 }}>{formatDate(d.date)}</div>
            </div>
            <span className="tag" style={{ background: bg, color: fg }}>{d.type}</span>
          </div>
        );
      })}
      {selected.length > 0 && (
        <button className="ghost-btn" style={{ width: "100%", marginBottom: 14 }} onClick={deleteSelected}>
          Delete {selected.length} selected
        </button>
      )}
      <hr className="divider" />
      <div className="section-label" style={{ marginBottom: 12 }}>Upload Document</div>
      <div className="form-group">
        <select value={type} onChange={e => setType(e.target.value)}>
          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label style={{
          display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
          border: `1.5px dashed ${theme.border}`, borderRadius: 12, cursor: "pointer",
          background: theme.surface, fontSize: 13.5, color: file ? theme.ink : theme.inkLight
        }}>
          <span style={{ fontSize: 18 }}>📄</span>
          {file ? file.name : "Choose a file to upload"}
          <input type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
        </label>
      </div>
      <button className="primary-btn" onClick={upload}>Upload Document</button>
    </div>
  );
}

function BudgetSection({ expenses, setExpenses }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "Equipment", date: "", description: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const add = () => {
    if (!form.title || !form.amount) return;
    setExpenses([...expenses, { id: Date.now(), ...form }]);
    setForm({ title: "", amount: "", category: "Equipment", date: "", description: "" });
  };
  const catColors = { Equipment: [theme.blueLight, theme.blue], Travel: [theme.accentLight, theme.accent], Consumables: [theme.greenLight, theme.green], Manpower: ["#ede8f5", "#6b3fa0"], Overhead: [theme.redLight, theme.red], Other: ["#f0ece6", theme.inkMuted] };

  return (
    <div className="section-card">
      <div className="section-label">Finance</div>
      <div className="section-heading">Budget & Expenses</div>
      {expenses.length === 0 ? (
        <p style={{ color: theme.inkLight, fontSize: 13.5, textAlign: "center", padding: "12px 0" }}>No expenses recorded</p>
      ) : expenses.map(e => {
        const [bg, fg] = catColors[e.category] || catColors.Other;
        return (
          <div className="record-item" key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: theme.ink }}>{e.title}</div>
              {e.description && <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 3 }}>{e.description}</div>}
              <div style={{ fontSize: 11.5, color: theme.inkLight, marginTop: 4 }}>{formatDate(e.date)}</div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: theme.ink }}>{formatCurrency(e.amount)}</div>
              <span className="tag" style={{ background: bg, color: fg }}>{e.category}</span>
            </div>
          </div>
        );
      })}
      <hr className="divider" />
      <div className="section-label" style={{ marginBottom: 12 }}>Add Expense</div>
      <div className="form-group"><input placeholder="Expense title" value={form.title} onChange={e => set("title", e.target.value)} /></div>
      <div className="row-2">
        <div className="form-group"><input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => set("amount", e.target.value)} /></div>
        <div className="form-group">
          <select value={form.category} onChange={e => set("category", e.target.value)}>
            {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
      <div className="form-group"><textarea rows={2} placeholder="Description (optional)" value={form.description} onChange={e => set("description", e.target.value)} /></div>
      <button className="primary-btn" onClick={add}>Add Expense</button>
    </div>
  );
}

function ProcurementSection({ items, setItems }) {
  const [form, setForm] = useState({ itemName: "", quantity: "", estimatedCost: "", vendor: "", date: "", description: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const add = () => {
    if (!form.itemName) return;
    setItems([...items, { id: Date.now(), ...form, status: "Pending" }]);
    setForm({ itemName: "", quantity: "", estimatedCost: "", vendor: "", date: "", description: "" });
  };
  const cycleStatus = (id) => {
    const statuses = ["Pending", "Approved", "Ordered", "Delivered"];
    setItems(items.map(i => i.id === id ? { ...i, status: statuses[(statuses.indexOf(i.status) + 1) % statuses.length] } : i));
  };
  const statusColors = { Pending: [theme.accentLight, theme.accent], Approved: [theme.blueLight, theme.blue], Ordered: ["#ede8f5", "#6b3fa0"], Delivered: [theme.greenLight, theme.green] };

  return (
    <div className="section-card">
      <div className="section-label">Supply</div>
      <div className="section-heading">Procurement</div>
      {items.length === 0 ? (
        <p style={{ color: theme.inkLight, fontSize: 13.5, textAlign: "center", padding: "12px 0" }}>No procurement requests</p>
      ) : items.map(i => {
        const [bg, fg] = statusColors[i.status] || statusColors.Pending;
        return (
          <div className="record-item" key={i.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: theme.ink }}>{i.itemName}</div>
                <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 2 }}>
                  {i.quantity && `Qty: ${i.quantity}`}{i.vendor && ` · ${i.vendor}`}
                </div>
                {i.estimatedCost && <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.ink, marginTop: 4 }}>{formatCurrency(i.estimatedCost)}</div>}
              </div>
              <button onClick={() => cycleStatus(i.id)} className="tag" style={{ background: bg, color: fg, border: "none", cursor: "pointer" }}>
                {i.status}
              </button>
            </div>
          </div>
        );
      })}
      <hr className="divider" />
      <div className="section-label" style={{ marginBottom: 12 }}>New Request</div>
      <div className="form-group"><input placeholder="Item name" value={form.itemName} onChange={e => set("itemName", e.target.value)} /></div>
      <div className="row-2">
        <div className="form-group"><input placeholder="Quantity" value={form.quantity} onChange={e => set("quantity", e.target.value)} /></div>
        <div className="form-group"><input type="number" placeholder="Est. cost (₹)" value={form.estimatedCost} onChange={e => set("estimatedCost", e.target.value)} /></div>
      </div>
      <div className="form-group"><input placeholder="Vendor name" value={form.vendor} onChange={e => set("vendor", e.target.value)} /></div>
      <div className="form-group"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
      <div className="form-group"><textarea rows={2} placeholder="Description (optional)" value={form.description} onChange={e => set("description", e.target.value)} /></div>
      <button className="primary-btn" onClick={add}>Add Request</button>
    </div>
  );
}

function NotificationsSection({ notifs, setNotifs }) {
  const [form, setForm] = useState({ title: "", message: "", type: "Reminder" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const add = () => {
    if (!form.title) return;
    setNotifs([...notifs, { id: Date.now(), ...form, date: new Date().toISOString(), read: false }]);
    setForm({ title: "", message: "", type: "Reminder" });
  };
  const typeColors = { Reminder: [theme.blueLight, theme.blue], Alert: [theme.redLight, theme.red], Deadline: [theme.accentLight, theme.accent], Meeting: [theme.greenLight, theme.green], Other: ["#f0ece6", theme.inkMuted] };
  const typeIcons = { Reminder: "🔔", Alert: "⚠️", Deadline: "📅", Meeting: "🤝", Other: "📌" };

  return (
    <div className="section-card">
      <div className="section-label">Alerts</div>
      <div className="section-heading">Notifications</div>
      {notifs.length === 0 ? (
        <p style={{ color: theme.inkLight, fontSize: 13.5, textAlign: "center", padding: "12px 0" }}>No notifications</p>
      ) : notifs.map(n => {
        const [bg, fg] = typeColors[n.type] || typeColors.Other;
        return (
          <div className="record-item" key={n.id} style={{ opacity: n.read ? 0.55 : 1 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>{typeIcons[n.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: theme.ink }}>{n.title}</div>
                {n.message && <div style={{ fontSize: 12.5, color: theme.inkMuted, marginTop: 3, lineHeight: 1.5 }}>{n.message}</div>}
                <div style={{ fontSize: 11.5, color: theme.inkLight, marginTop: 4 }}>{formatDate(n.date)}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className="tag" style={{ background: bg, color: fg }}>{n.type}</span>
                <button onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: !x.read } : x))}
                  style={{ background: "none", border: "none", color: theme.inkLight, fontSize: 15, padding: "2px 4px" }}>
                  {n.read ? "↩" : "✓"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <hr className="divider" />
      <div className="section-label" style={{ marginBottom: 12 }}>Add Alert</div>
      <div className="form-group"><input placeholder="Title" value={form.title} onChange={e => set("title", e.target.value)} /></div>
      <div className="form-group">
        <select value={form.type} onChange={e => set("type", e.target.value)}>
          {NOTIF_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-group"><textarea rows={2} placeholder="Message (optional)" value={form.message} onChange={e => set("message", e.target.value)} /></div>
      <button className="primary-btn" onClick={add}>Add Notification</button>
    </div>
  );
}

export default function ModernProjectDashboard() {
  const [project] = useState({
    name: "p1",
    fundingAgency: "ANRF",
    budget: 500000,
    startDate: "2026-05-15",
    endDate: "2028-10-18",
  });
  const [members, setMembers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [procurement, setProcurement] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: theme.bg }}>
        <header style={{
          background: theme.white,
          borderBottom: `1.5px solid ${theme.borderLight}`,
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.green }} />
              <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: theme.inkLight }}>NIT Calicut</p>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: theme.ink, letterSpacing: -0.5, marginTop: 2 }}>
              Research Project Support
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {unread > 0 && (
              <div style={{ background: theme.redLight, color: theme.red, borderRadius: 99, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
                {unread} unread
              </div>
            )}
            <button style={{
              background: theme.ink, color: "#fff", border: "none",
              padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            }}>← Dashboard</button>
          </div>
        </header>

        <main style={{ padding: "34px 40px", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }} className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="tag" style={{ background: theme.greenLight, color: theme.green }}>● Active</span>
              <span style={{ fontSize: 12, color: theme.inkLight, fontWeight: 500 }}>ANRF Funded</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: theme.ink, letterSpacing: -1.2 }}>
              {project.name}
            </h2>
          </div>

          <InfoBar project={{ ...project, expenses }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, marginBottom: 22 }}>
            <TeamSection members={members} setMembers={setMembers} />
            <BudgetSection expenses={expenses} setExpenses={setExpenses} />
            <ProcurementSection items={procurement} setItems={setProcurement} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            <DocsSection docs={docs} setDocs={setDocs} />
            <NotificationsSection notifs={notifs} setNotifs={setNotifs} />
          </div>

          <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 20 }}>
            <p style={{ fontSize: 12, color: theme.inkLight, letterSpacing: 0.5 }}>Research Project Support System · NIT Calicut</p>
          </div>
        </main>
      </div>
    </>
  );
}