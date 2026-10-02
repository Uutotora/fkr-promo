import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, TL, tw, useSec } from "../lib";
import { LogoMark, Wordmark } from "../components/Logo";
import { Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";

export const S3Turn: React.FC = () => {
  const s = useSec();
  const { flash, draw, windows, title, expand } = TL.turn;
  const z = tw(s, [expand, expand + 0.85], [1, 14], (t) => t * t * t);
  const textOut = tw(s, [expand - 0.05, expand + 0.3], [0, 1], IN);
  const settle = tw(s, [flash, flash + 1.2], [1.08, 1], EXPO);
  const fadeAll = tw(s, [expand + 0.55, expand + 0.9], [1, 0]);
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage glowX={0.5} glowY={0.5} intensity={tw(s, [flash, flash + 1.5], [0, 1])} />
      <AbsoluteFill style={{ opacity: fadeAll }}>
        {/* the mark: we fly through its open side into the product */}
        <div
          style={{
            position: "absolute",
            left: 960 - 430,
            top: 540 - 230,
            display: "flex",
            alignItems: "center",
            gap: 46,
            scale: String(settle),
          }}
        >
          <div style={{ transformOrigin: "62% 50%", scale: String(z), filter: `blur(${tw(z, [6, 14], [0, 6])}px)` }}>
            <LogoMark size={330} draw={draw as [number, number]} windows={windows} strokeW={3.2} />
          </div>
          <div style={{ opacity: 1 - textOut, translate: `${textOut * 60}px 0` }}>
            <Wordmark size={118} at={draw[0] + 0.55} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", opacity: 1 - textOut }}>
          <Rise text="Единая система капитального ремонта" at={title} size={54} weight={650} color={C.ink} highlight={["Единая"]} />
        </div>
      </AbsoluteFill>
      {/* white flash on the cut */}
      <AbsoluteFill style={{ background: "#fff", opacity: tw(s, [flash, flash + 0.55], [1, 0], EXPO) }} />
    </AbsoluteFill>
  );
};
