import {
  FaHome,
  FaFolder,
  FaUsers,
  FaFileAlt,
  FaMoneyBillWave,
  FaBell,
  FaCog,
} from "react-icons/fa";

function Sidebar() {
  const menuItems = [
    { icon: <FaHome />, label: "Dashboard" },
    { icon: <FaFolder />, label: "Projects" },
    { icon: <FaUsers />, label: "Team" },
    { icon: <FaFileAlt />, label: "Documents" },
    { icon: <FaMoneyBillWave />, label: "Financials" },
    { icon: <FaBell />, label: "Notifications" },
    { icon: <FaCog />, label: "Settings" },
  ];

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        padding: "24px 18px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#6c63ff" }}>
          ResearchPilot
        </h2>
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>
          Research Project Support
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 16px",
              borderRadius: "14px",
              cursor: "pointer",
              color: "#374151",
              fontWeight: "500",
            }}
          >
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;