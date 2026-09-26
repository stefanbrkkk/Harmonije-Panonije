import { ImageResponse } from "next/og";

export const socialImageSize = { width: 1200, height: 630 };

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#17362d",
          color: "#fbf7ec",
        }}
      >
        {/* Background decorative circles */}
        <div style={{ position: "absolute", width: 650, height: 650, borderRadius: 999, border: "1px solid rgba(239,201,110,.2)", right: -150, top: -100 }} />
        <div style={{ position: "absolute", width: 470, height: 470, borderRadius: 999, border: "1px solid rgba(239,201,110,.16)", right: -20, top: 35 }} />
        
        {/* Main content: horizontal row with explicit column widths so the
            text can never squeeze the bottles off-canvas (1200 - 148 pad). */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", width: "100%", height: "100%", padding: "70px 74px" }}>

          {/* LEFT: Text column, fixed width with wrapping headline */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 30, width: 620, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#efc96e" }}>
              <span style={{ width: 48, height: 1, background: "#efc96e" }} /> Budisava · Vojvodina
            </div>
            <div style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: -3, width: 620 }}>Harmonija prirode u svakoj flaši.</div>
            <div style={{ width: 600, fontSize: 22, lineHeight: 1.45, color: "rgba(251,247,236,.72)" }}>
              Immuno Craft sirupi i Immuno Booster tegle sa livadskim medom, ceđenim limunom, voćem i biljem.
            </div>
          </div>

          {/* RIGHT: Bottle group, fixed size, never shrinks */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", gap: 24, flexShrink: 0 }}>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  width: item === 1 ? 124 : 92,
                  height: item === 1 ? 390 : 330,
                  borderRadius: 32,
                  border: "1px solid rgba(255,255,255,.3)",
                  background: item === 0 ? "#a06e27" : item === 1 ? "#6b304c" : "#466b51",
                }}
              >
                <div style={{ position: "absolute", left: "26%", right: "26%", top: -25, height: 35, borderRadius: 7, background: "#d9c28b" }} />
                <div style={{ position: "absolute", left: item === 1 ? 9 : 5, right: item === 1 ? 9 : 5, top: "36%", height: 124, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#efe6d2", color: "#17362d" }}>
                  <span style={{ fontSize: 10, letterSpacing: item === 1 ? 1.4 : 0.8 }}>HARMONIJE</span>
                  <span style={{ marginTop: 8, fontSize: item === 1 ? 24 : 15 }}>IMMUNO</span>
                  <span style={{ fontSize: item === 1 ? 24 : 15 }}>CRAFT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
    },
  );
}
