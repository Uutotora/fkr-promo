import React from "react";
import { C, FONT } from "../theme";
import { EXPO, pop, tw, useSec } from "../lib";

/** The ФКР mark: an open frame with six lit windows. Drawn and lit on cue. */
export const LogoMark: React.FC<{
  size: number; // height in px
  draw?: [number, number];
  windows?: number[];
  ink?: string;
  windowColor?: string;
  strokeW?: number;
}> = ({ size, draw, windows, ink = C.logoInk, windowColor = C.orangeLogo, strokeW = 3.5 }) => {
  const s = useSec();
  const len = 36 + 10 + 36 + 48 + 36 + 11 + 10; // approx path length incl. both arms
  const k = draw ? tw(s, draw, [0, 1], EXPO) : 1;
  const rects: [number, number][] = [
    [21, 10],
    [10, 21],
    [10, 32],
    [16, 32],
    [17, 42],
    [23, 42],
  ];
  return (
    <svg width={(size * 44) / 56} height={size} viewBox="0 0 44 56" fill="none" style={{ overflow: "visible" }}>
      <path
        d="M40 14V4H4v48h36V41"
        stroke={ink}
        strokeWidth={strokeW}
        strokeDasharray={len}
        strokeDashoffset={len * (1 - k)}
        strokeLinecap="butt"
      />
      {rects.map(([x, y], i) => {
        const p = windows ? pop(s, windows[i], 0.5) : 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={3}
            height={6}
            fill={windowColor}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%", scale: String(Math.max(0, p)) }}
          />
        );
      })}
    </svg>
  );
};

export const Wordmark: React.FC<{ size: number; color?: string; at?: number }> = ({ size, color = C.logoInk, at }) => {
  const s = useSec();
  const k = at === undefined ? 1 : tw(s, [at, at + 0.7], [0, 1], EXPO);
  return (
    <div style={{ fontFamily: FONT, color, lineHeight: 0.95, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: size * 0.02 }}>ФКР</div>
      <div style={{ fontSize: size * 0.92, fontWeight: 400, letterSpacing: size * 0.04 }}>МОСКВЫ</div>
    </div>
  );
};
