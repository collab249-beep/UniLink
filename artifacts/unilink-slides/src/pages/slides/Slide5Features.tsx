export default function Slide5Features() {
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
      {/* Left diagonal stripe */}
      <div
        style={{
          position: "absolute",
          top: "-20vh",
          left: "-10vw",
          width: "22vw",
          height: "140vh",
          backgroundColor: "#C84B31",
          transform: "skewX(-15deg)",
          zIndex: 1,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-20vh",
          left: "10vw",
          width: "3vw",
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
            The Platform
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "3vh",
            marginLeft: "14vw",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: "1.2vw",
              fontWeight: 700,
              color: "#C84B31",
              letterSpacing: "0.22em",
              marginBottom: "1vh",
              textTransform: "uppercase",
            }}
          >
            By Design
          </div>

          <h2
            style={{
              fontSize: "4.5vw",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Built For
          </h2>
          <h2
            style={{
              fontSize: "4.5vw",
              fontWeight: 900,
              margin: "0 0 3.5vh 0",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "transparent",
              WebkitTextStroke: "1.5px #FFFFFF",
            }}
          >
            Students
          </h2>

          {/* Features — 3 columns */}
          <div style={{ display: "flex", gap: "3vw" }}>
            {/* Column 1 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.8vh" }}>
              <div>
                <div style={{ width: "3.5vw", height: "0.5vh", backgroundColor: "#C84B31", marginBottom: "1.2vh" }} />
                <h3 style={{ fontSize: "1.6vw", fontWeight: 800, margin: "0 0 0.5vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Live Activity Feed
                </h3>
                <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                  See who's free on campus right now.
                </p>
              </div>
              <div>
                <div style={{ width: "3.5vw", height: "0.5vh", backgroundColor: "#2A2A2A", marginBottom: "1.2vh" }} />
                <h3 style={{ fontSize: "1.6vw", fontWeight: 800, margin: "0 0 0.5vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Smart Matching
                </h3>
                <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                  Activity, timing, and campus proximity.
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.8vh" }}>
              <div>
                <div style={{ width: "3.5vw", height: "0.5vh", backgroundColor: "#FFFFFF", opacity: 0.3, marginBottom: "1.2vh" }} />
                <h3 style={{ fontSize: "1.6vw", fontWeight: 800, margin: "0 0 0.5vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  In-App Chat
                </h3>
                <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                  Confirm and coordinate before you meet.
                </p>
              </div>
              <div>
                <div style={{ width: "3.5vw", height: "0.5vh", backgroundColor: "#C84B31", marginBottom: "1.2vh" }} />
                <h3 style={{ fontSize: "1.6vw", fontWeight: 800, margin: "0 0 0.5vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Meetup Sessions
                </h3>
                <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                  Track sessions, rate experiences, build history.
                </p>
              </div>
            </div>

            {/* Column 3 — single feature centered */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div>
                <div style={{ width: "3.5vw", height: "0.5vh", backgroundColor: "#555555", marginBottom: "1.2vh" }} />
                <h3 style={{ fontSize: "1.6vw", fontWeight: 800, margin: "0 0 0.5vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Push Notifications
                </h3>
                <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                  Never miss a match while you're out.
                </p>
              </div>
            </div>
          </div>
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
          <div style={{ fontSize: "1.5vw", fontWeight: 800, color: "#555555" }}>05</div>
        </div>
      </div>
    </div>
  );
}
