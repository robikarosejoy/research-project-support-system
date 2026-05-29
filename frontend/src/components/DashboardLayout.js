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

<button
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }}
>
  Sign Out
</button>

export default DashboardLayout;