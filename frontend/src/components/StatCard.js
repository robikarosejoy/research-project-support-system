function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "22px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid #eef0f4",
        minHeight: "140px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "16px",
          background: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>
        {title}
      </p>

      <h3 style={{ fontSize: "28px", color: "#111827", margin: 0 }}>
        {value}
      </h3>

      <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "8px" }}>
        {subtitle}
      </p>
    </div>
  );
}

export default StatCard;