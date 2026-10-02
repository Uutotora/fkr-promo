import React from "react";
import { C, FONT } from "../theme";
import { EXPO, IN, tw, useSec } from "../lib";

/** Words rise out of a mask with a soft blur, staggered. Leaves on `out`. */
export const Rise: React.FC<{
  text: string;
  at: number;
  out?: number;
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  lineHeight?: number;
  tracking?: number;
  style?: React.CSSProperties;
  highlight?: string[];
  highlightColor?: string;
  center?: boolean;
}> = ({ text, at, out, size, weight = 700, color = C.ink, stagger = 0.06, lineHeight = 1.06, tracking = -0.025, style, highlight = [], highlightColor = C.blue, center }) => {
  const s = useSec();
  const lines = text.split("\n");
  let idx = 0;
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight, letterSpacing: `${tracking}em`, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", columnGap: size * 0.26, justifyContent: center ? "center" : undefined }}>
          {line.split(" ").map((w, wi) => {
            const i = idx++;
            const t0 = at + i * stagger;
            const k = tw(s, [t0, t0 + 0.7], [0, 1], EXPO);
            const o = out === undefined ? 0 : tw(s, [out + i * 0.025, out + 0.35 + i * 0.025], [0, 1], IN);
            const hl = highlight.some((h) => w.replace(/[.,—«»]/g, "").startsWith(h));
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
                <span
                  style={{
                    display: "inline-block",
                    translate: `0 ${(1 - k) * 105 - o * 60}%`,
                    opacity: Math.min(k * 1.4, 1 - o),
                    filter: `blur(${(1 - k) * 8 + o * 8}px)`,
                    color: hl ? highlightColor : undefined,
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Chapter eyebrow: number in a glow pill + label. */
export const Eyebrow: React.FC<{ n: string; label: string; at: number; out?: number; dark?: boolean }> = ({ n, label, at, out, dark }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
  const o = out === undefined ? 0 : tw(s, [out, out + 0.3], [0, 1]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, opacity: k * (1 - o), translate: `${(1 - k) * -20}px 0` }}>
      <div
        style={{
          height: 36,
          padding: "0 14px",
          borderRadius: 99,
          display: "grid",
          placeItems: "center",
          fontSize: 17,
          fontWeight: 700,
          color: dark ? "#fff" : C.blue,
          background: dark ? "rgba(255,255,255,0.1)" : "radial-gradient(ellipse 75% 160% at 50% 50%, #edf1ff 0%, #dde6ff 100%)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: dark ? "rgba(255,255,255,0.7)" : C.muted, letterSpacing: "0.01em" }}>{label}</div>
    </div>
  );
};

export const Fade: React.FC<{ at: number; out?: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, dur = 0.6, y = 24, children, style }) => {
  const s = useSec();
  const k = tw(s, [at, at + dur], [0, 1], EXPO);
  const o = out === undefined ? 0 : tw(s, [out, out + 0.35], [0, 1], IN);
  return <div style={{ opacity: k * (1 - o), translate: `0 ${(1 - k) * y - o * 16}px`, filter: `blur(${(1 - k) * 6 + o * 6}px)`, ...style }}>{children}</div>;
};
