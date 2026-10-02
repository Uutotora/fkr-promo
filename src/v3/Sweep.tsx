import React from "react";
import { AbsoluteFill } from "remotion";
import { INOUT, tw, useSec } from "../lib";

/** A soft band of light that sweeps across the frame on a cut — glow, not gradient. */
export const Sweeps: React.FC<{ at: { t: number; dark?: boolean; dir?: 1 | -1 }[] }> = ({ at }) => {
  const s = useSec();
  return (
    <>
      {at.map(({ t, dark, dir = 1 }, i) => {
        const k = tw(s, [t - 0.35, t + 0.45], [0, 1], INOUT);
        if (k <= 0 || k >= 1) return null;
        const x = dir > 0 ? -700 + k * 3300 : 2600 - k * 3300;
        const a = Math.sin(k * Math.PI);
        return (
          <AbsoluteFill key={i} style={{ pointerEvents: "none", mixBlendMode: dark ? "screen" : "normal" }}>
            <div style={{ position: "absolute", left: x - 450, top: -200, width: 900, height: 1480, borderRadius: "50%", background: dark ? "radial-gradient(closest-side, rgba(140,170,255,0.55), rgba(90,120,255,0.18) 50%, rgba(90,120,255,0))" : "radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(220,230,255,0.55) 45%, rgba(220,230,255,0))", opacity: a, rotate: "12deg" }} />
            <div style={{ position: "absolute", left: x - 3, top: -200, width: 6, height: 1480, background: dark ? "rgba(200,215,255,0.8)" : "rgba(255,255,255,0.9)", boxShadow: dark ? "0 0 40px 10px rgba(130,160,255,0.6)" : "0 0 40px 14px rgba(255,255,255,0.9)", opacity: a * 0.9, rotate: "12deg" }} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};
