export default function Slide6CTA() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#C84B31",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        display: "flex",
        color: "#FFFFFF",
      }}
    >
      {/* Dark diagonal panel — center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: "18vw",
          width: "42vw",
          height: "100vh",
          backgroundColor: "#141414",
          transform: "skewX(-15deg)",
          zIndex: 1,
        }}
      />
      {/* Thin accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: "60vw",
          width: "2.5vw",
          height: "100vh",
          backgroundColor: "#2A2A2A",
          transform: "skewX(-15deg)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "8vh 6vw",
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#141414" }} />
            <div style={{ fontSize: "1.2vw", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              UniLink
            </div>
          </div>
          <div
            style={{
              backgroundColor: "transparent",
              padding: "0.5vh 1.2vw",
              border: "2px solid #FFFFFF",
              fontSize: "1vw",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Get Started
          </div>
        </div>

        {/* Main content — centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.5vw",
              fontWeight: 700,
              color: "#141414",
              letterSpacing: "0.22em",
              marginBottom: "2vh",
              textTransform: "uppercase",
            }}
          >
            The Time Is Now
          </div>

          <h1
            style={{
              fontSize: "12vw",
              fontWeight: 900,
              margin: 0,
              lineHeight: 0.85,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              textShadow: "0.4vw 0.4vw 0 rgba(20,20,20,0.2)",
            }}
          >
            Join
          </h1>
          <h1
            style={{
              fontSize: "12vw",
              fontWeight: 900,
              margin: 0,
              lineHeight: 0.85,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "transparent",
              WebkitTextStroke: "3px #141414",
            }}
          >
            UniLink
          </h1>

          <div style={{ width: "8vw", height: "0.7vh", backgroundColor: "#141414", margin: "4vh auto" }} />

          <p
            style={{
              fontSize: "2.2vw",
              fontWeight: 300,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.4,
              margin: "0 0 1.5vh 0",
            }}
          >
            Real friends. Real places. Right now.
          </p>
          <p
            style={{
              fontSize: "1.6vw",
              fontWeight: 500,
              color: "rgba(20,20,20,0.7)",
              letterSpacing: "0.04em",
              margin: 0,
            }}
          >
            Download on iOS &amp; Android
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 500, color: "#141414", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4vh" }}>
              UniLink Social, 2026
            </div>
            <div style={{ fontSize: "0.8vw", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>
              Student Connections
            </div>
          </div>
          <div style={{ fontSize: "1.5vw", fontWeight: 800, color: "#141414" }}>06</div>
        </div>
      </div>
    </div>
  );
}
