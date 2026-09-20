import { ImageResponse } from "next/og";

export const socialImageAlt = "Harmonije Panonije — Immuno Craft";
export const socialImageSize = { width: 1200, height: 630 };
export const socialImageContentType = "image/png";

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#17362d",
          color: "#fbf7ec",
        }}
      >
        {/* Background decorative circles - using display: none to avoid flex validation error */}
        <div style={{ position: "absolute", width: 650, height: 650, borderRadius: 999, border: "1px solid rgba(239,201,110,.2)", right: -150, top: -100, display: "none" }} />
        <div style={{ position: "absolute", width: 470, height: 470, borderRadius: 999, border: "1px solid rgba(239,201,110,.16)", right: -20, top: 35, display: "none" }} />
        
        {/* Main content container */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "70px 74px" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 690 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#efc96e" }}>
              <span style={{ width: 48, height: 1, background: "#efc96e" }} /> Novi Sad · od 2022.
            </div>
            <div style={{ marginTop: 30, fontSize: 78, lineHeight: .92, letterSpacing: -4 }}>Harmonija prirode u svakoj flaši.</div>
            <div style={{ marginTop: 34, width: 610, fontSize: 22, lineHeight: 1.45, color: "rgba(251,247,236,.72)" }}>
              Immuno Craft sirupi, sokovi i busteri sa livadskim medom, ceđenim limunom, voćem i biljem.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 430, marginRight: 45 }}>
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
                <div style={{ position: "absolute", left: 9, right: 9, top: "36%", height: 124, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#efe6d2", color: "#17362d" }}>
                  <span style={{ fontSize: 10, letterSpacing: 1.4 }}>HARMONIJE</span>
                  <span style={{ marginTop: 8, fontSize: item === 1 ? 24 : 18 }}>IMMUNO</span>
                  <span style={{ fontSize: item === 1 ? 24 : 18 }}>CRAFT</span>
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
