export default function Slide3Solution() {
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
      {/* Narrow right diagonal stripe */}
      <div
        style={{
          position: "absolute",
          top: "-20vh",
          right: "-5vw",
          width: "20vw",
          height: "140vh",
          backgroundColor: "#C84B31",
          transform: "skewX(-15deg)",
          zIndex: 1,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-20vh",
          right: "12vw",
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
            The Solution
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
            Real Connections
          </div>

          <h2
            style={{
              fontSize: "5vw",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Zero
          </h2>
          <h2
            style={{
              fontSize: "5vw",
              fontWeight: 900,
              margin: "0 0 4vh 0",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "transparent",
              WebkitTextStroke: "1.5px #FFFFFF",
            }}
          >
            Friction
          </h2>

          {/* Two-column solution points */}
          <div style={{ display: "flex", gap: "5vw", maxWidth: "75vw" }}>
            {/* Column 1 */}
            <div style={{ flex: 1 }}>
              <div style={{ width: "4vw", height: "0.5vh", backgroundColor: "#C84B31", marginBottom: "2vh" }} />
              <h3
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 800,
                  margin: "0 0 0.8vh 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Signal You're Free
              </h3>
              <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.5, margin: "0 0 3vh 0" }}>
                Students signal they're free right now for an activity.
              </p>

              <div style={{ width: "4vw", height: "0.5vh", backgroundColor: "#FFFFFF", marginBottom: "2vh" }} />
              <h3
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 800,
                  margin: "0 0 0.8vh 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                No Back-and-Forth
              </h3>
              <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.5, margin: 0 }}>
                Confirm, show up, and meet — no long back-and-forth.
              </p>
            </div>

            {/* Column 2 */}
            <div style={{ flex: 1 }}>
              <div style={{ width: "4vw", height: "0.5vh", backgroundColor: "#2A2A2A", marginBottom: "2vh" }} />
              <h3
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 800,
                  margin: "0 0 0.8vh 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Instant Match
              </h3>
              <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.5, margin: "0 0 3vh 0" }}>
                The app instantly matches them with a nearby peer who's up for the same thing.
              </p>

              <div style={{ width: "4vw", height: "0.5vh", backgroundColor: "#555555", marginBottom: "2vh" }} />
              <h3
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 800,
                  margin: "0 0 0.8vh 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Campus Verified
              </h3>
              <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#A0A0A0", lineHeight: 1.5, margin: 0 }}>
                Built for universities — verified student profiles only.
              </p>
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
          <div style={{ fontSize: "1.5vw", fontWeight: 800, color: "#555555" }}>03</div>
        </div>
      </div>
    </div>
  );
}
