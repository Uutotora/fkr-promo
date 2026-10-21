import React from "react";
import { C, FONT } from "../../theme";
import { clamp01, easeOut } from "../geom";

/** The ФКР mark (frame + six lit windows) and wordmark, driven by progress values. */
const WINDOWS: [number, number][] = [
  [21, 10],
  [10, 21],
  [10, 32],
  [16, 32],
  [17, 42],
  [23, 42],
];

export const Mark13: React.FC<{ size: number; draw?: number; lit?: number; ink?: string }> = ({ size, draw = 1, lit = 1, ink = C.logoInk }) => {
  const len = 187;
  return (
    <svg width={(size * 44) / 56} height={size} viewBox="0 0 44 56" fill="none" style={{ overflow: "visible" }}>
      <path d="M40 14V4H4v48h36V41" stroke={ink} strokeWidth={3.5} strokeDasharray={len} strokeDashoffset={len * (1 - clamp01(draw))} />
      {WINDOWS.map(([x, y], i) => {
        const p = easeOut(clamp01(lit * 6 - i));
        return <rect key={i} x={x} y={y} width={3} height={6} fill={C.orangeLogo} style={{ transformBox: "fill-box", transformOrigin: "50% 50%", scale: String(p) }} />;
      })}
    </svg>
  );
};

export const Lockup: React.FC<{ size: number; draw?: number; lit?: number; word?: number; ink?: string }> = ({ size, draw = 1, lit = 1, word = 1, ink = C.logoInk }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
    <Mark13 size={size} draw={draw} lit={lit} ink={ink} />
    <div style={{ fontFamily: FONT, color: ink, lineHeight: 0.95, clipPath: `inset(0 ${(1 - clamp01(word)) * 100}% 0 0)` }}>
      <div style={{ fontSize: size * 0.42, fontWeight: 800, letterSpacing: size * 0.008 }}>ФКР</div>
      <div style={{ fontSize: size * 0.39, fontWeight: 400, letterSpacing: size * 0.016 }}>МОСКВЫ</div>
    </div>
  </div>
);
