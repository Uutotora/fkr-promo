import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, tw, useSec } from "../lib";
import { LogoMark, Wordmark } from "../components/Logo";
import { Rise } from "../components/Type";

export const DAWN = { line: 24.55, draw: [26.25, 27.25] as [number, number], windows: [26.6, 26.85, 27.1, 27.35, 27.6, 27.85], word: 26.85, title: 28.0, expand: 29.0 };

/** The city wakes up; the mark draws itself in the morning sky and we fly through it. */
export const Dawn: React.FC = () => {
  const s = useSec();
  const z = tw(s, [DAWN.expand, DAWN.expand + 0.75], [1, 16], (t) => t * t);
  const textOut = tw(s, [DAWN.expand - 0.05, DAWN.expand + 0.3], [0, 1], IN);
  const lineK = tw(s, [DAWN.line, DAWN.line + 0.9], [0, 1], EXPO) * (1 - tw(s, [25.9, 26.4], [0, 1]));
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* the turn line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: lineK }}>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", textShadow: "0 0 60px rgba(120,150,255,0.6)", filter: `blur(${(1 - lineK) * 8}px)` }}>
          Пора собрать всё <span style={{ color: C.orange }}>в одном окне</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 960 - 430, top: 170, display: "flex", alignItems: "center", gap: 46 }}>
        <div style={{ transformOrigin: "62% 50%", scale: String(z), opacity: 1 - tw(z, [2.2, 7], [0, 1]), filter: `blur(${tw(z, [2, 10], [0, 10])}px)` }}>
          <LogoMark size={330} draw={DAWN.draw} windows={DAWN.windows} strokeW={3.2} />
        </div>
        <div style={{ opacity: 1 - textOut, translate: `${textOut * 60}px 0` }}>
          <Wordmark size={118} at={DAWN.word} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center", opacity: 1 - textOut }}>
        <Rise text="Единая система капитального ремонта" at={DAWN.title} size={56} weight={750} color={C.ink} highlight={["Единая"]} />
      </div>
    </AbsoluteFill>
  );
};
