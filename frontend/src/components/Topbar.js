import { useEffect, useState } from "react";
import { FaBell, FaSearch, FaUserShield } from "react-icons/fa";

function Topbar() {
  const token = localStorage.getItem("token");
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/projects/notifications/latest", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => setNotifications(data))
    .catch((err) => console.error(err));
}, [token]);
  const role = localStorage.getItem("role") || "User";
  const name = localStorage.getItem("name") || role;

  const roleLabels = {
    PI: "Principal Investigator",
    "Co-PI": "Co-Principal Investigator",
    JRF: "Junior Research Fellow",
    SRF: "Senior Research Fellow",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff, #f7f8ff)",
        borderBottom: "1px solid #e5e7eb",
        padding: "18px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#111827",
            margin: 0,
          }}
        >
          Dashboard
        </h2>
        <p style={{ fontSize: "14px", color: "#8b90a0", marginTop: "6px" }}>
          Welcome back, {roleLabels[role] || role}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: "16px",
            width: "320px",
            border: "1px solid #e5e7eb",
          }}
        >
          <FaSearch color="#9ca3af" />
          <input
            type="text"
            placeholder="Search projects..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              marginLeft: "12px",
              width: "100%",
              fontSize: "14px",
            }}
          />
        </div>

        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FaBell color="#6c63ff" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "8px 14px",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "800",
            }}
          >
            <FaUserShield />
          </div>

          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}
            >
              {name}
            </p>
            <p style={{ fontSize: "12px", color: "#8b90a0", margin: 0 }}>
              {roleLabels[role] || role}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Topbar;