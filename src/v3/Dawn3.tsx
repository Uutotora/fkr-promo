import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, pop, tw, useSec } from "../lib";
import { LogoMark, Wordmark } from "../components/Logo";
import { Rise } from "../components/Type";
import { DAWN } from "../v2/Dawn";

/* The city wakes up and the mark draws itself in the morning sky — then the open frame of
   the mark stretches into the window of the app (the dashboard lands inside it). */

const K = 330 / 56;
const MX = 960 - 430;
const MY = 170;
/** Frame of the mark on screen (path M40 14V4H4v48h36V41). */
const FRAME = { x: MX + 4 * K, y: MY + 4 * K, w: 36 * K, h: 48 * K };
/** Where the app window lands, flat (pose x 960, y 560, s 0.62). */
export const DAWN_WIN = { x: 960 - 800 * 0.62, y: 560 - 500 * 0.62, w: 1600 * 0.62, h: 1000 * 0.62, r: 26 * 0.62 };
const RECTS: [number, number][] = [
  [21, 10],
  [10, 21],
  [10, 32],
  [16, 32],
  [17, 42],
  [23, 42],
];

/** A rounded frame open on its right side between g0..g1 (fractions of the height). */
const framePath = (x: number, y: number, w: number, h: number, r: number, g0: number, g1: number) => {
  const R = Math.min(r, w / 2, h / 2);
  const right = x + w;
  const top = y + h * g0;
  const bot = y + h * g1;
  return [
    `M ${right} ${Math.max(top, y + R)}`,
    `L ${right} ${y + R}`,
    `Q ${right} ${y} ${right - R} ${y}`,
    `L ${x + R} ${y}`,
    `Q ${x} ${y} ${x} ${y + R}`,
    `L ${x} ${y + h - R}`,
    `Q ${x} ${y + h} ${x + R} ${y + h}`,
    `L ${right - R} ${y + h}`,
    `Q ${right} ${y + h} ${right} ${y + h - R}`,
    `L ${right} ${Math.min(bot, y + h - R)}`,
  ].join(" ");
};

export const Dawn3: React.FC = () => {
  const s = useSec();
  const m = tw(s, [DAWN.expand, DAWN.expand + 0.8], [0, 1], INOUT);
  const textOut = tw(s, [DAWN.expand - 0.05, DAWN.expand + 0.3], [0, 1], IN);
  const lineK = tw(s, [DAWN.line, DAWN.line + 0.9], [0, 1], EXPO) * (1 - tw(s, [25.9, 26.4], [0, 1]));
  const L = (a: number, b: number) => a + (b - a) * m;
  const fr = { x: L(FRAME.x, DAWN_WIN.x), y: L(FRAME.y, DAWN_WIN.y), w: L(FRAME.w, DAWN_WIN.w), h: L(FRAME.h, DAWN_WIN.h) };
  const close = tw(m, [0, 0.6], [0, 1], INOUT);
  const g0 = 10 / 48 + (0.5 - 10 / 48) * close;
  const g1 = 37 / 48 + (0.5 - 37 / 48) * close;
  const fill = tw(m, [0.5, 1], [0, 1]);
  const gone = tw(s, [DAWN.expand + 0.75, DAWN.expand + 0.95], [0, 1]);
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* the turn line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: lineK }}>
        {/* the mask leaves room for the glow, so it is never cut into a box */}
        <div style={{ overflow: "hidden", padding: "70px 120px", margin: "-70px -120px" }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", textShadow: "0 0 60px rgba(120,150,255,0.6)", translate: `0 ${(1 - lineK) * 200}%` }}>
            Пора собрать всё <span style={{ color: C.orange }}>в одном окне</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: MX, top: MY, display: "flex", alignItems: "center", gap: 46 }}>
        <div style={{ opacity: m > 0 ? 0 : 1 }}>
          <LogoMark size={330} draw={DAWN.draw} windows={DAWN.windows} strokeW={3.2} />
        </div>
        <div style={{ opacity: 1 - textOut, translate: `${textOut * 60}px 0` }}>
          <Wordmark size={118} at={DAWN.word} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center", opacity: 1 - textOut }}>
        <Rise text="Единая система капитального ремонта" at={DAWN.title} size={56} weight={750} color={C.ink} highlight={["Единая"]} />
      </div>
      {/* the frame of the mark becomes the window */}
      {m > 0 && gone < 1 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - gone }}>
          {fill > 0 && <rect x={fr.x} y={fr.y} width={fr.w} height={fr.h} rx={L(0, DAWN_WIN.r)} fill={C.bg} opacity={fill} style={{ filter: "drop-shadow(0 40px 60px rgba(0,2,48,0.22))" }} />}
          <path d={framePath(fr.x, fr.y, fr.w, fr.h, L(0, DAWN_WIN.r), g0, g1)} fill="none" stroke={C.logoInk} strokeOpacity={1 - fill * 0.92} strokeWidth={L(3.2 * K, 2)} />
          {RECTS.map(([x, y], i) => {
            const fx = (x - 4) / 36;
            const fy = (y - 4) / 48;
            const k = 1 - tw(m, [0.1, 0.55], [0, 1]);
            const sc = Math.max(0, pop(s, DAWN.windows[i], 0.5));
            const w = 3 * K * (1 + m * 2) * sc;
            const h = 6 * K * (1 + m * 2) * sc;
            return <rect key={i} x={fr.x + fx * fr.w + (3 * K - w) / 2} y={fr.y + fy * fr.h + (6 * K - h) / 2} width={w} height={h} fill={C.orangeLogo} opacity={k} />;
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};
