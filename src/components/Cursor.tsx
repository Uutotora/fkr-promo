import React from "react";
import { clamp01, useFilmSec, useSec } from "../lib";

/** A hand on a mouse: it accelerates, overshoots a touch and settles; it leans into the
    movement; when resting it never quite freezes; a click is a soft bloom of light.
    Keys are [time, x, y] in window coordinates. */
const settle = (k: number) => {
  // fast start, a 3% overshoot, settled by the end
  const e = 1 - Math.pow(1 - k, 3);
  return e + Math.sin(Math.PI * Math.min(1, k * 1.15)) * 0.03 * k;
};

export const Cursor: React.FC<{
  keys: [number, number, number][];
  clicks?: number[];
  scale?: number; // inverse of the window scale so the pointer keeps its screen size
  show?: [number, number];
}> = ({ keys, clicks = [], scale = 1, show }) => {
  const s = useSec();
  const film = useFilmSec();
  if (show && (s < show[0] - 0.3 || s > show[1] + 0.3)) return null;
  const vis = show ? clamp01(Math.min((s - show[0] + 0.3) / 0.3, (show[1] + 0.3 - s) / 0.3)) : 1;

  const at = (tt: number) => {
    if (tt <= keys[0][0]) return [keys[0][1], keys[0][2]];
    if (tt >= keys[keys.length - 1][0]) return [keys[keys.length - 1][1], keys[keys.length - 1][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i];
      const [t1, x1, y1] = keys[i + 1];
      if (tt >= t0 && tt <= t1) {
        const u = (tt - t0) / (t1 - t0);
        const k = settle(u);
        const dist = Math.hypot(x1 - x0, y1 - y0);
        const arc = Math.sin(Math.min(1, u * 1.1) * Math.PI) * Math.min(70, dist * 0.14);
        const nl = dist || 1;
        return [x0 + (x1 - x0) * k + (-(y1 - y0) / nl) * arc, y0 + (y1 - y0) * k + ((x1 - x0) / nl) * arc];
      }
    }
    return [keys[0][1], keys[0][2]];
  };
  const [x0, y0] = at(s);
  const [xp, yp] = at(s - 1 / 30);
  const vx = (x0 - xp) * 30;
  const vy = (y0 - yp) * 30;
  const speed = Math.hypot(vx, vy);
  // resting hand: a tiny wander on the real clock
  const rest = clamp01(1 - speed / 120);
  const x = x0 + rest * (Math.sin(film * 1.3) * 1.6 + Math.sin(film * 2.9) * 0.7);
  const y = y0 + rest * (Math.cos(film * 1.1) * 1.4 + Math.sin(film * 2.3) * 0.6);
  const lean = Math.max(-9, Math.min(9, vx / 260));

  let press = 0;
  let hover = 0;
  const blooms: React.ReactNode[] = [];
  clicks.forEach((c, i) => {
    // hover: the target answers before the press — a soft light gathers under the pointer
    const hd = c - s;
    if (hd > -0.25 && hd < 0.6) hover = Math.max(hover, hd > 0 ? 1 - hd / 0.6 : 1 + hd / 0.25);
    const d = s - c;
    if (d > -0.08 && d < 0.2) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.13);
    if (d >= 0 && d < 0.8) {
      const k = d / 0.8;
      blooms.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 120 * scale,
            height: 120 * scale,
            marginLeft: -60 * scale,
            marginTop: -60 * scale,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(49,107,253,0.42), rgba(49,107,253,0.16) 55%, rgba(49,107,253,0))",
            scale: String(0.25 + (1 - Math.pow(1 - k, 3)) * 0.95),
            opacity: (1 - k) * 0.95,
          }}
        />,
      );
    }
  });

  const hk = hover * hover * (3 - 2 * hover);
  return (
    <>
      {hk > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 150 * scale,
            height: 150 * scale,
            marginLeft: -75 * scale,
            marginTop: -75 * scale,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(49,107,253,0.22), rgba(49,107,253,0.08) 55%, rgba(49,107,253,0))",
            scale: String(0.7 + 0.3 * hk),
            opacity: hk * vis,
          }}
        />
      )}
      {blooms}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: vis,
          transformOrigin: "0 0",
          rotate: `${lean}deg`,
          scale: String(scale * (1 - clamp01(press) * 0.14)),
          filter: `drop-shadow(0 ${6 + speed / 400}px ${10 + speed / 300}px rgba(0,2,48,0.32))`,
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
