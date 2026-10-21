import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, easeOut, ramp } from "../geom";
import { coverRect } from "./Insert";

/* Shared pieces for the v13 film: UI camera, captions, pointer, window → pin. */

const W = 1920;
const H = 1080;

/** Camera over a UI of logical size w×h. Keys: [film frame, focus x, focus y, zoom]
    where zoom 1 = the UI covers the frame. Moves are eased between keys. */
export type CamKey = [number, number, number, number];
export const UICam: React.FC<{ w: number; h: number; keys: CamKey[]; start: number; children: React.ReactNode }> = ({ w, h, keys, start, children }) => {
  const f = useCurrentFrame() + start;
  let fx = keys[0][1];
  let fy = keys[0][2];
  let z = keys[0][3];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ax, ay, az] = keys[i];
    const [b, bx, by, bz] = keys[i + 1];
    if (f >= a) {
      const u = easeInOut((f - a) / Math.max(1, b - a));
      fx = ax + (bx - ax) * u;
      fy = ay + (by - ay) * u;
      z = az * Math.pow(bz / az, u);
    }
  }
  const c = coverRect(w, h);
  const s = c.s * z;
  // keep the UI covering the frame: clamp the focus so no edge shows
  const halfW = W / 2 / s;
  const halfH = H / 2 / s;
  fx = Math.min(Math.max(fx, halfW), w - halfW);
  fy = Math.min(Math.max(fy, halfH), h - halfH);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#f3f3f3" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `translate(${W / 2 - fx * s}px, ${H / 2 - fy * s}px) scale(${s})` }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Lower-third caption: a solid ink chip, one line, Onest 700. */
export const Caption: React.FC<{ a: number; b: number; children: React.ReactNode; light?: boolean; y?: number }> = ({ a, b, children, light, y = 96 }) => {
  const f = useCurrentFrame();
  if (f < a - 2 || f > b + 2) return null;
  const k = easeOut(ramp(f, a, a + 26)) * (1 - easeInOut(ramp(f, b - 22, b)));
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        bottom: y,
        padding: "16px 26px 18px",
        borderRadius: 14,
        background: light ? "#fff" : C.ink,
        color: light ? C.ink : "#fff",
        fontFamily: FONT,
        fontSize: 38,
        fontWeight: 700,
        letterSpacing: -0.6,
        opacity: k,
        transform: `translateY(${(1 - k) * 14}px)`,
        boxShadow: light ? "0 10px 30px rgba(0,2,48,0.12)" : "0 10px 30px rgba(0,2,48,0.25)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

/** Big super over live footage or the map: number + caption. */
export const Super: React.FC<{ a: number; b: number; n?: string; cap: string; dark?: boolean; x?: number; y?: number; size?: number }> = ({ a, b, n, cap, dark, x = 120, y = 150, size = 150 }) => {
  const f = useCurrentFrame();
  if (f < a - 2 || f > b + 2) return null;
  const k1 = easeOut(ramp(f, a, a + 40));
  const k2 = easeOut(ramp(f, a + 10, a + 50));
  const out = 1 - easeInOut(ramp(f, b - 26, b));
  const ink = dark ? C.ink : "#fff";
  const sh = dark ? "none" : "0 2px 26px rgba(0,4,30,0.4)";
  return (
    <div style={{ position: "absolute", left: x, bottom: y, color: ink, fontFamily: FONT, opacity: out }}>
      {n && (
        <div style={{ fontSize: size, fontWeight: 800, letterSpacing: -size * 0.035, lineHeight: 1, opacity: k1, transform: `translateY(${(1 - k1) * 24}px)`, textShadow: sh, fontVariantNumeric: "tabular-nums" }}>
          {n}
        </div>
      )}
      <div style={{ fontSize: n ? 42 : 64, fontWeight: n ? 650 : 800, letterSpacing: n ? -0.6 : -1.8, marginTop: n ? 14 : 0, opacity: k2, transform: `translateY(${(1 - k2) * 16}px)`, textShadow: sh }}>
        {cap}
      </div>
    </div>
  );
};

/** The pointer, in UI coordinates. Path keys: [film frame, x, y]; clicks: film frames. */
export const Pointer: React.FC<{ keys: [number, number, number][]; clicks?: number[]; start: number; scale?: number }> = ({ keys, clicks = [], start, scale = 1 }) => {
  const f = useCurrentFrame() + start;
  let x = keys[0][1];
  let y = keys[0][2];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ax, ay] = keys[i];
    const [b, bx, by] = keys[i + 1];
    if (f >= a) {
      const u = easeInOut(clamp01((f - a) / Math.max(1, b - a)));
      // a slight arc, like a hand
      const dx = bx - ax;
      const dy = by - ay;
      const arc = Math.sin(Math.PI * u) * Math.min(40, Math.hypot(dx, dy) * 0.1);
      const L = Math.hypot(dx, dy) || 1;
      x = ax + dx * u + (-dy / L) * arc;
      y = ay + dy * u + (dx / L) * arc;
    }
  }
  const last = keys[keys.length - 1][0];
  if (f > last) {
    x += Math.sin(f / 37) * 1.2;
    y += Math.cos(f / 43) * 1;
  }
  const press = Math.max(0, ...clicks.map((c) => clamp01(1 - Math.abs(f - c) / 7)));
  const ring = Math.max(0, ...clicks.map((c) => (f >= c && f < c + 24 ? 1 - (f - c) / 24 : 0)));
  return (
    <>
      {ring > 0 && (
        <div style={{ position: "absolute", left: x - 18 * scale, top: y - 18 * scale, width: 36 * scale, height: 36 * scale, borderRadius: "50%", background: C.blue, opacity: 0.18 * ring, transform: `scale(${1.6 - 0.6 * ring})` }} />
      )}
      <svg width={26 * scale} height={34 * scale} viewBox="0 0 17 22" style={{ position: "absolute", left: x - 2 * scale, top: y - 2 * scale, transform: `scale(${1 - press * 0.12})`, transformOrigin: "2px 2px", zIndex: 100 }}>
        <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#0B0D2A" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** A full-frame layer that folds into a pin on the map (window → pin). */
export const ToPin: React.FC<{ a: number; b: number; pin: [number, number]; children: React.ReactNode; start: number }> = ({ a, b, pin, children, start }) => {
  const f = useCurrentFrame() + start;
  const e = easeInOut(ramp(f, a, b));
  if (e <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const s = 1 - e * (1 - 26 / W);
  const cx = W / 2 + (pin[0] - W / 2) * e;
  const cy = H / 2 + (pin[1] - H / 2) * e;
  const r = 14 + 40 * e;
  return (
    <AbsoluteFill style={{ opacity: 1 - ramp(f, b - 6, b) }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: "50% 50%",
          transform: `translate(${cx - W / 2}px, ${cy - H / 2}px) scale(${s})`,
          borderRadius: r / s,
          overflow: "hidden",
          boxShadow: `0 ${30 * e}px ${60 * e}px rgba(0,2,48,${0.25 * e})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
