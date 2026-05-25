import { FaBell, FaSearch } from "react-icons/fa";

function Topbar() {
  return (
    <div
      style={{
        height: "90px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 35px",
        marginLeft: "260px",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          Dashboard
        </h2>

        <p
          style={{
            fontSize: "14px",
            color: "#9ca3af",
          }}
        >
          Welcome back, Principal Investigator
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f3f4f6",
            padding: "12px 18px",
            borderRadius: "14px",
            width: "320px",
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
            borderRadius: "14px",
            background: "#f3f4f6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <FaBell color="#6b7280" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: "#6c63ff",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "700",
            }}
          >
            PI
          </div>

          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Dr. PI
            </p>

            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              Principal Investigator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;