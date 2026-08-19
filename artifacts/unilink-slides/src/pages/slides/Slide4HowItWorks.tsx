export default function Slide4HowItWorks() {
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
      {/* Horizontal accent stripe — upper */}
      <div
        style={{
          position: "absolute",
          top: "38vh",
          left: "-5vw",
          width: "110vw",
          height: "1.5vh",
          backgroundColor: "#C84B31",
          transform: "skewY(-2deg)",
          zIndex: 1,
          opacity: 0.15,
        }}
      />
      {/* Horizontal accent stripe — lower */}
      <div
        style={{
          position: "absolute",
          top: "54vh",
          left: "-5vw",
          width: "110vw",
          height: "0.5vh",
          backgroundColor: "#FFFFFF",
          transform: "skewY(-2deg)",
          zIndex: 1,
          opacity: 0.06,
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
            The Process
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "3vh", flex: 1 }}>
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
            Step By Step
          </div>

          <h2
            style={{
              fontSize: "4.5vw",
              fontWeight: 900,
              margin: "0 0 5vh 0",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            How It Works
          </h2>

          {/* 4 steps — 2x2 grid */}
          <div style={{ display: "flex", gap: "3vw" }}>
            {/* Left column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5vh" }}>
              {/* Step 01 */}
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontSize: "3.5vw",
                    fontWeight: 900,
                    color: "#C84B31",
                    lineHeight: 1,
                    minWidth: "6vw",
                    letterSpacing: "-0.04em",
                  }}
                >
                  01
                </div>
                <div>
                  <div style={{ width: "100%", height: "0.5vh", backgroundColor: "#C84B31", marginBottom: "1.2vh" }} />
                  <h3 style={{ fontSize: "1.8vw", fontWeight: 800, margin: "0 0 0.6vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Pick an Activity
                  </h3>
                  <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                    Coffee, study, gym, walk, events and more.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontSize: "3.5vw",
                    fontWeight: 900,
                    color: "#555555",
                    lineHeight: 1,
                    minWidth: "6vw",
                    letterSpacing: "-0.04em",
                  }}
                >
                  02
                </div>
                <div>
                  <div style={{ width: "100%", height: "0.5vh", backgroundColor: "#2A2A2A", marginBottom: "1.2vh" }} />
                  <h3 style={{ fontSize: "1.8vw", fontWeight: 800, margin: "0 0 0.6vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Go Live
                  </h3>
                  <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                    Broadcast your "I'm free" status to your campus.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5vh" }}>
              {/* Step 03 */}
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontSize: "3.5vw",
                    fontWeight: 900,
                    color: "#555555",
                    lineHeight: 1,
                    minWidth: "6vw",
                    letterSpacing: "-0.04em",
                  }}
                >
                  03
                </div>
                <div>
                  <div style={{ width: "100%", height: "0.5vh", backgroundColor: "#FFFFFF", opacity: 0.2, marginBottom: "1.2vh" }} />
                  <h3 style={{ fontSize: "1.8vw", fontWeight: 800, margin: "0 0 0.6vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Get Matched
                  </h3>
                  <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                    The app pairs you with a compatible student nearby.
                  </p>
                </div>
              </div>

              {/* Step 04 */}
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontSize: "3.5vw",
                    fontWeight: 900,
                    color: "#C84B31",
                    lineHeight: 1,
                    minWidth: "6vw",
                    letterSpacing: "-0.04em",
                  }}
                >
                  04
                </div>
                <div>
                  <div style={{ width: "100%", height: "0.5vh", backgroundColor: "#C84B31", marginBottom: "1.2vh" }} />
                  <h3 style={{ fontSize: "1.8vw", fontWeight: 800, margin: "0 0 0.6vh 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Show Up
                  </h3>
                  <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.4, margin: 0 }}>
                    Meet in real life and make it happen.
                  </p>
                </div>
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
          <div style={{ fontSize: "1.5vw", fontWeight: 800, color: "#555555" }}>04</div>
        </div>
      </div>
    </div>
  );
}
