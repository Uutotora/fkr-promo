import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, TL, tw, useSec } from "../lib";
import { LogoMark, Wordmark } from "../components/Logo";
import { Rise, Fade } from "../components/Type";

const MARK_H = 300;
const K = MARK_H / 56;
const MX = 960 - 405;
const MY = 250;
const RECTS: [number, number][] = [
  [21, 10],
  [10, 21],
  [10, 32],
  [16, 32],
  [17, 42],
  [23, 42],
];
/** Screen centres of the six lit windows of the final mark. */
export const LOGO_WINDOWS = RECTS.map(([x, y]) => ({ x: MX + (x + 1.5) * K, y: MY + (y + 3) * K }));

export const S10Close: React.FC = () => {
  const s = useSec();
  const c = TL.close;
  // windows 1, 3, 5 arrive from the three cabinets; the others light on the beat
  const win = [68.42, 68.46, 68.5, 68.54, 68.58, 68.62];
  const zoom = 1 + tw(s, [68.4, 76], [0, 0.04]);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#fff" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(49,107,253,0.10), transparent 70%)", opacity: tw(s, [68.6, 70], [0, 1]) }} />
      <AbsoluteFill style={{ scale: String(zoom) }}>
        <div style={{ position: "absolute", left: MX, top: MY }}>
          <LogoMark size={MARK_H} draw={[68.55, 69.5]} windows={win} strokeW={3.2} />
        </div>
        <div style={{ position: "absolute", left: MX + MARK_H * (44 / 56) + 50, top: MY + 70 }}>
          <Wordmark size={112} at={c.logo} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, display: "flex", justifyContent: "center" }}>
          <Rise text="Единая система капитального ремонта" at={c.tagline} size={56} weight={750} highlight={["Единая"]} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 750, display: "flex", justifyContent: "center" }}>
          <Fade at={c.tagline + 0.7}>
            <div style={{ fontSize: 27, color: C.muted, fontWeight: 500, letterSpacing: "0.01em" }}>Объекты · Договоры · ТМЦ · Документы · Аналитика</div>
          </Fade>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
