import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, OUT, TL, tw, useSec } from "../lib";

/** Rolling digits: each column spins down into place, left to right. */
export const Odometer: React.FC<{ text: string; at: number; size: number; color?: string; accent?: string }> = ({ text, at, size, color = "#fff", accent }) => {
  const s = useSec();
  const chars = text.split("");
  let di = 0;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", fontSize: size, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, color, fontVariantNumeric: "tabular-nums" }}>
      {chars.map((ch, i) => {
        if (!/[0-9]/.test(ch)) {
          const k = tw(s, [at, at + 0.5], [0, 1], EXPO);
          return (
            <span key={i} style={{ display: "inline-block", height: size * 1.2, paddingTop: size * 0.1, boxSizing: "border-box", opacity: k, color: /[×≈]/.test(ch) ? accent ?? color : color, width: ch === " " ? size * 0.22 : undefined, translate: `0 ${(1 - k) * 30}px` }}>
              {ch === " " ? "" : ch}
            </span>
          );
        }
        const d = Number(ch);
        const t0 = at + di * 0.06;
        di++;
        const spins = 10 + d; // land on the digit after a full turn
        const k = tw(s, [t0, t0 + 0.85], [0, 1], OUT);
        const pos = spins * k;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              height: size * 1.2,
              overflow: "hidden",
              position: "relative",
              width: size * 0.62,
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              maskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
            }}
          >
            <span style={{ position: "absolute", left: 0, top: size * 0.1, translate: `0 ${-(pos % 10) * size}px` }}>
              {Array.from({ length: 11 }, (_, n) => (
                <span key={n} style={{ display: "block", height: size }}>{n % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const STATS = [
  { v: "1 800", label: "объектов капитального ремонта" },
  { v: "12 000", label: "инженерных систем в работе" },
  { v: "×3", label: "поставки материалов на каждый объект" },
  { v: "≈20", label: "документов вручную после каждого КС-2" },
];

export const Hook: React.FC = () => {
  const s = useSec();
  const slams = TL.hook.slams;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {STATS.map((st, i) => {
        const at = slams[i];
        const next = i < STATS.length - 1 ? slams[i + 1] : 7.6;
        if (s < at - 0.05 || s > next + 0.5) return null;
        const k = tw(s, [at, at + 0.7], [0, 1], EXPO);
        const o = tw(s, [next - 0.3, next + 0.02], [0, 1], IN);
        return (
          <AbsoluteFill key={i} style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 210 }}>
            <div style={{ position: "relative", opacity: Math.min(1, k * 1.5) * (1 - o), translate: `0 ${-o * 70}px`, filter: o > 0 ? `blur(${o * 12}px)` : undefined, scale: String(1.06 - 0.06 * k) }}>
              <div style={{ position: "absolute", left: "-20%", right: "-20%", top: "-30%", bottom: "-30%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(110,140,255,0.22), rgba(110,140,255,0))", pointerEvents: "none" }} />
              <Odometer text={st.v} at={at} size={210} accent={C.orangeLogo} />
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 46,
                fontWeight: 550,
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "-0.01em",
                opacity: tw(s, [at + 0.2, at + 0.7], [0, 1]) * (1 - o),
                translate: `0 ${(1 - tw(s, [at + 0.2, at + 0.9], [0, 1], EXPO)) * 24 - o * 40}px`,
                filter: `blur(${(1 - tw(s, [at + 0.2, at + 0.8], [0, 1])) * 6}px)`,
              }}
            >
              {st.label}
            </div>
          </AbsoluteFill>
        );
      })}
      <div style={{ position: "absolute", left: 96, top: 64, fontSize: 19, fontWeight: 650, letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)", opacity: tw(s, [0.2, 1], [0, 1]) * (1 - tw(s, [7.4, 8], [0, 1])) }}>
        ФОНД КАПИТАЛЬНОГО РЕМОНТА · МОСКВА
      </div>
    </AbsoluteFill>
  );
};
