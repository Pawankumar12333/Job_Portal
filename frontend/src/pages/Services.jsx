import { useNavigate } from "react-router-dom";
import bgImage from "../photo/bg_image.jpg";

function Services() {
  const navigate = useNavigate();

  return (
    <div 
      style={{ 
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Glass Effect Header */}
      <div style={{ textAlign: "center" }}>
        <h1 
          style={{ 
            fontSize: "2.5rem",
            fontWeight: "900",
            margin: 0,
            background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.8))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          Our Services
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "8px", fontSize: "14px" }}>
          Choose what you're looking for
        </p>
      </div>

      {/* Cards Container - Centered */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center",
        alignItems: "center",
        gap: "16px", 
        width: "100%", 
        maxWidth: "360px",
        margin: "0 auto"
      }}>

        {/* Part Time Job - Glass Card */}
        <button
          onClick={() => navigate("/job", { state: { type: "parttime" } })}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: "16px", 
            padding: "18px 22px", 
            borderRadius: "20px", 
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            width: "100%"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
          }}
        >
          <div style={{ 
            width: "52px", 
            height: "52px", 
            borderRadius: "16px", 
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "24px",
            boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
          }}>
            💼
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <p style={{ fontWeight: "700", margin: 0, color: "white", fontSize: "18px" }}>Part Time Job</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>Flexible hours, side work</p>
          </div>
          <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)" }}>→</div>
        </button>

        {/* Full Time Job - Glass Card */}
        <button
          onClick={() => navigate("/job", { state: { type: "fulltime" } })}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: "16px", 
            padding: "18px 22px", 
            borderRadius: "20px", 
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            width: "100%"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
          }}
        >
          <div style={{ 
            width: "52px", 
            height: "52px", 
            borderRadius: "16px", 
            background: "linear-gradient(135deg, #10B981, #059669)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "24px",
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
          }}>
            🏢
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <p style={{ fontWeight: "700", margin: 0, color: "white", fontSize: "18px" }}>Full Time Job</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>Career opportunities, steady income</p>
          </div>
          <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)" }}>→</div>
        </button>

        {/* Relationship - Glass Card */}
        <button
          onClick={() => navigate("/relationship")}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: "16px", 
            padding: "18px 22px", 
            borderRadius: "20px", 
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            width: "100%"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
          }}
        >
          <div style={{ 
            width: "52px", 
            height: "52px", 
            borderRadius: "16px", 
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "24px",
            boxShadow: "0 4px 12px rgba(239,68,68,0.3)"
          }}>
            ❤️
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <p style={{ fontWeight: "700", margin: 0, color: "white", fontSize: "18px" }}>Relationship</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>Connect & find companionship</p>
          </div>
          <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)" }}>→</div>
        </button>

      </div>
    </div>
  );
}

export default Services;