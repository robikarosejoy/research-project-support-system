function ProjectCard({ project, onClick }) {
  const isCompleted =
    new Date(project.end_date || project.endDate) < new Date();

  const projectStatus = isCompleted ? "Completed" : "Active";

  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff",
        borderRadius: "22px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid #eef0f4",
        cursor: "pointer",
        transition: "0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 16px 40px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
          "0 10px 30px rgba(0,0,0,0.05)";
      }}
    >
      <span
        style={{
          background:
            projectStatus === "Completed"
              ? "#fee2e2"
              : "#dcfce7",

          color:
            projectStatus === "Completed"
              ? "#b91c1c"
              : "#15803d",

          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {projectStatus}
      </span>

      <h3
        style={{
          marginTop: "18px",
          color: "#111827",
          fontSize: "24px",
          fontWeight: "700",
        }}
      >
        {project.title}
      </h3>

      <p
        style={{
          color: "#9ca3af",
          fontSize: "14px",
          marginTop: "8px",
          lineHeight: "1.6",
        }}
      >
        {project.description || "No description provided"}
      </p>

      <div style={{ marginTop: "20px" }}>
        <p
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "4px",
          }}
        >
          Funding Agency
        </p>

        <strong
          style={{
            color: "#111827",
            fontSize: "16px",
          }}
        >
          {project.funding_agency || "N/A"}
        </strong>
      </div>

      <div style={{ marginTop: "18px" }}>
        <p
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "4px",
          }}
        >
          Budget
        </p>

        <strong
          style={{
            color: "#111827",
            fontSize: "18px",
          }}
        >
          ₹{Number(project.total_budget || 0).toLocaleString()}
        </strong>
      </div>
    </div>
  );
}

export default ProjectCard;