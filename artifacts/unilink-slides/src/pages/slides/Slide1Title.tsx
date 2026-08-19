export default function Slide1Title() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#141414",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        display: "flex",
        color: "#FFFFFF",
      }}
    >
      {/* Right diagonal stripe — primary red */}
      <div
        style={{
          position: "absolute",
          top: "-20vh",
          right: "-10vw",
          width: "45vw",
          height: "140vh",
          backgroundColor: "#C84B31",
          transform: "skewX(-15deg)",
          zIndex: 1,
          opacity: 0.9,
        }}
      />
      {/* Secondary dark stripe */}
      <div
        style={{
          position: "absolute",
          top: "-20vh",
          right: "25vw",
          width: "5vw",
          height: "140vh",
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
            <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#C84B31" }} />
            <div style={{ fontSize: "1.2vw", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              UniLink
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#141414",
              padding: "0.5vh 1.2vw",
              border: "2px solid #C84B31",
              fontSize: "1vw",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Mobile App
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "6vh", maxWidth: "58vw" }}>
          <div
            style={{
              fontSize: "1.2vw",
              fontWeight: 700,
              color: "#C84B31",
              letterSpacing: "0.22em",
              marginBottom: "2.5vh",
              textTransform: "uppercase",
            }}
          >
            Real Life. Right Now.
          </div>

          <h1
            style={{
              fontSize: "11vw",
              fontWeight: 900,
              margin: 0,
              lineHeight: 0.85,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
            }}
          >
            Uni
          </h1>
          <h1
            style={{
              fontSize: "11vw",
              fontWeight: 900,
              margin: 0,
              lineHeight: 0.85,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "transparent",
              WebkitTextStroke: "2px #FFFFFF",
            }}
          >
            Link
          </h1>

          {/* Red separator */}
          <div style={{ width: "8vw", height: "0.7vh", backgroundColor: "#C84B31", margin: "4vh 0" }} />

          <p
            style={{
              fontSize: "2vw",
              fontWeight: 300,
              lineHeight: 1.45,
              margin: 0,
              color: "#A0A0A0",
              maxWidth: "44vw",
            }}
          >
            Meet university students in real life, right now.
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 500, color: "#888888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4vh" }}>
              UniLink Social, 2026
            </div>
            <div style={{ fontSize: "0.8vw", fontWeight: 400, color: "#555555" }}>
              Student Connections
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1vw", fontWeight: 600, color: "#C84B31", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              On Campus
            </div>
            <div style={{ fontSize: "4vw", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, color: "#FFFFFF" }}>
              IRL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
