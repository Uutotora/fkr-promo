import React from "react";
import { C } from "../theme";
import { INOUT, clamp01, useSec } from "../lib";

/** Smooth pointer with click feedback. Keys are [time, x, y] in window coordinates. */
export const Cursor: React.FC<{
  keys: [number, number, number][];
  clicks?: number[];
  scale?: number; // inverse of the window scale so the pointer keeps its screen size
  show?: [number, number];
}> = ({ keys, clicks = [], scale = 1, show }) => {
  const s = useSec();
  if (show && (s < show[0] - 0.3 || s > show[1] + 0.3)) return null;
  const vis = show ? clamp01(Math.min((s - show[0] + 0.3) / 0.3, (show[1] + 0.3 - s) / 0.3)) : 1;

  let x = keys[0][1];
  let y = keys[0][2];
  if (s >= keys[keys.length - 1][0]) {
    x = keys[keys.length - 1][1];
    y = keys[keys.length - 1][2];
  } else {
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i];
      const [t1, x1, y1] = keys[i + 1];
      if (s >= t0 && s <= t1) {
        const k = INOUT((s - t0) / (t1 - t0));
        // gentle arc, like a hand moving a mouse
        const arc = Math.sin(k * Math.PI) * Math.min(60, Math.hypot(x1 - x0, y1 - y0) * 0.12);
        const nx = -(y1 - y0);
        const ny = x1 - x0;
        const nl = Math.hypot(nx, ny) || 1;
        x = x0 + (x1 - x0) * k + (nx / nl) * arc;
        y = y0 + (y1 - y0) * k + (ny / nl) * arc;
        break;
      }
    }
  }

  let press = 0;
  const ripples: React.ReactNode[] = [];
  clicks.forEach((c, i) => {
    const d = s - c;
    if (d > -0.08 && d < 0.18) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.12);
    if (d >= 0 && d < 0.7) {
      const k = d / 0.7;
      ripples.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 90 * scale,
            height: 90 * scale,
            marginLeft: -45 * scale,
            marginTop: -45 * scale,
            borderRadius: 999,
            border: `${3 * scale}px solid ${C.blue}`,
            background: "rgba(49,107,253,0.10)",
            scale: String(0.2 + k * 0.9),
            opacity: (1 - k) * 0.9,
          }}
        />,
      );
    }
  });

  return (
    <>
      {ripples}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: vis,
          transformOrigin: "0 0",
          scale: String(scale * (1 - clamp01(press) * 0.16)),
          filter: "drop-shadow(0 6px 10px rgba(0,2,48,0.35))",
          zIndex: 50,
        }}
      >
        <svg width={34} height={40} viewBox="0 0 17 20" style={{ marginLeft: -3, marginTop: -2 }}>
          <path d="M1.5 1.2 L1.5 16.3 L5.3 12.7 L7.9 18.6 L10.7 17.4 L8.1 11.6 L13.4 11.6 Z" fill="#0b0d2c" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};
