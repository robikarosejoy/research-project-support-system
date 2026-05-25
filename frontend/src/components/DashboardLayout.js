import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div
      style={{
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Topbar />

      <main
        style={{
          padding: "35px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;