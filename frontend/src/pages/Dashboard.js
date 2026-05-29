import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";

import {
  FaFolder,
  FaBell,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";

function Dashboard() {
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error(err));
  }, [token]);

  const totalBudget = projects.reduce(
    (sum, project) => sum + Number(project.total_budget || 0),
    0
  );

  return (
    <DashboardLayout>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "35px",
        }}
      >
        <StatCard
          title="Total Projects"
          value={projects.length}
          subtitle="Projects from database"
          icon={<FaFolder color="white" />}
          color="#6c63ff"
        />

        <StatCard
          title="Notifications"
          value="0"
          subtitle="Project alerts"
          icon={<FaBell color="white" />}
          color="#f59e0b"
        />

        <StatCard
          title="Researchers"
          value="0"
          subtitle="Across all projects"
          icon={<FaUsers color="white" />}
          color="#22c55e"
        />

        <StatCard
          title="Budget"
          value={`₹${totalBudget.toLocaleString()}`}
          subtitle="Total research funding"
          icon={<FaMoneyBillWave color="white" />}
          color="#3b82f6"
        />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              color: "#111827",
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            Projects
          </h2>

          {role === "PI" && (
  <button
    onClick={() => navigate("/create-project")}
    style={{
      background: "#6c63ff",
      color: "white",
      border: "none",
      padding: "12px 18px",
      borderRadius: "14px",
      cursor: "pointer",
      fontWeight: "600",
    }}
  >
    + New Project
  </button>
)}
        </div>

        {projects.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No projects created yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/project/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;