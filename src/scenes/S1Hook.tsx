import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, TL, fmt, rand, tw, useSec } from "../lib";

type Bld = { x: number; w: number; h: number; cols: number; rows: number; seed: number };

const makeSkyline = (seed: number, count: number, minH: number, maxH: number, scale: number): Bld[] => {
  const out: Bld[] = [];
  let x = -120;
  for (let i = 0; i < count && x < 2100; i++) {
    const r = rand(seed + i * 7.13);
    const cols = Math.round(4 + r * 8);
    const rows = Math.round((minH + rand(seed + i * 3.7) * (maxH - minH)) / (30 * scale));
    const w = cols * 22 * scale + 26 * scale;
    out.push({ x, w, h: rows * 30 * scale + 30 * scale, cols, rows, seed: seed * 1000 + i * 37 });
    x += w + (8 + rand(seed + i) * 26) * scale;
  }
  return out;
};

const Skyline: React.FC<{ blds: Bld[]; scale: number; lit: number; tone: string; dim: number; bottom: number }> = ({ blds, scale, lit, tone, dim, bottom }) => {
  const s = useSec();
  const ww = 9 * scale;
  const wh = 14 * scale;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <filter id={`glow${scale}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={4 * scale} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`bg${scale}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone} />
          <stop offset="1" stopColor="#020427" />
        </linearGradient>
      </defs>
      {blds.map((b) => (
        <rect key={b.seed} x={b.x} y={1080 - bottom - b.h} width={b.w} height={b.h + bottom} fill={`url(#bg${scale})`} />
      ))}
      <g filter={`url(#glow${scale})`}>
        {blds.map((b) => {
          const items: React.ReactNode[] = [];
          for (let r = 0; r < b.rows; r++) {
            for (let c = 0; c < b.cols; c++) {
              const th = rand(b.seed + r * 13.1 + c * 5.7);
              // each window switches on when the city-wide level passes its threshold
              const on = tw(lit - th, [0, 0.04], [0, 1]);
              const flick = 0.85 + 0.15 * Math.sin(s * (3 + th * 5) + th * 40);
              const warm = rand(b.seed + r + c * 2.3) > 0.18;
              const a = on * flick * dim;
              if (a < 0.02) continue;
              items.push(
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 13 * scale + c * 22 * scale}
                  y={1080 - bottom - b.h + 18 * scale + r * 30 * scale}
                  width={ww}
                  height={wh}
                  rx={1.5 * scale}
                  fill={warm ? C.orangeLogo : "#ffd9a8"}
                  opacity={a}
                />,
              );
            }
          }
          return <React.Fragment key={b.seed}>{items}</React.Fragment>;
        })}
      </g>
    </svg>
  );
};

const STATS: { n: number; prefix?: string; text?: string; label: string }[] = [
  { n: 3000, label: "домов в капитальном ремонте каждый год" },
  { n: 12000, label: "инженерных систем в работе" },
  { n: 3, prefix: "×", label: "поставки материалов на объект — в среднем" },
  { n: 20, prefix: "≈", label: "документов вручную после каждого КС-2" },
];

export const S1Hook: React.FC = () => {
  const s = useSec();
  const slams = TL.hook.slams;
  const far = useMemo(() => makeSkyline(3, 40, 120, 300, 0.62), []);
  const near = useMemo(() => makeSkyline(11, 24, 180, 430, 1), []);

  // city lights up with every statement
  const lit = tw(s, [0, 0.6], [0.02, 0.18]) + tw(s, [2.5, 3.1], [0, 0.22]) + tw(s, [4.5, 5.1], [0, 0.2]) + tw(s, [6.5, 7.1], [0, 0.25]);
  const exit = tw(s, [7.55, 8.25], [0, 1], IN);
  const cam = 1 + s * 0.012;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 120% 90% at 50% 100%, #101a7a 0%, ${C.night} 55%, #00011a 100%)` }} />
      {/* stars of distant windows */}
      <AbsoluteFill style={{ scale: String(cam), translate: `0 ${s * -4 + exit * 260}px`, filter: `blur(${exit * 10}px)`, opacity: 1 - exit * 0.6 }}>
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 6}px 40px` }}>
          <Skyline blds={far} scale={0.62} lit={lit * 1.15} tone="#0d1460" dim={0.55} bottom={200} />
        </div>
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 14}px 0` }}>
          <Skyline blds={near} scale={1} lit={lit} tone="#0a1056" dim={1} bottom={0} />
        </div>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,2,48,0.0) 40%, rgba(0,2,48,0.65) 100%)" }} />
      </AbsoluteFill>

      {/* statements */}
      {STATS.map((st, i) => {
        const at = slams[i];
        const next = i < STATS.length - 1 ? slams[i + 1] : 7.55;
        if (s < at - 0.05 || s > next + 0.5) return null;
        const k = tw(s, [at, at + 0.55], [0, 1], EXPO);
        const o = tw(s, [next - 0.12, next + 0.28], [0, 1], IN);
        const count = tw(s, [at, at + 0.55], [st.n * (st.n > 100 ? 0.62 : 0), st.n], EXPO);
        return (
          <AbsoluteFill key={i} style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, paddingBottom: 330 }}>
            <div
              style={{
                fontSize: 230,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.045em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                scale: String(1.28 - 0.28 * k + o * 0.1),
                opacity: Math.min(1, k * 1.6) * (1 - o),
                filter: `blur(${(1 - k) * 18 + o * 14}px)`,
                translate: `0 ${-o * 80}px`,
                textShadow: "0 0 60px rgba(255,133,12,0.25)",
              }}
            >
              {st.prefix ? <span style={{ color: C.orangeLogo, marginRight: 8 }}>{st.prefix}</span> : null}
              {st.n > 100 ? fmt(count) : Math.round(count)}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 44,
                fontWeight: 500,
                color: "rgba(255,255,255,0.78)",
                letterSpacing: "-0.01em",
                opacity: tw(s, [at + 0.15, at + 0.6], [0, 1]) * (1 - o),
                translate: `0 ${(1 - tw(s, [at + 0.15, at + 0.8], [0, 1], EXPO)) * 26 - o * 50}px`,
              }}
            >
              {st.label}
            </div>
          </AbsoluteFill>
        );
      })}

      {/* corner signature */}
      <div style={{ position: "absolute", left: 80, top: 64, fontFamily: FONT, fontSize: 20, fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)", opacity: tw(s, [0.2, 1], [0, 1]) * (1 - exit) }}>
        ФОНД КАПИТАЛЬНОГО РЕМОНТА · МОСКВА
      </div>
    </AbsoluteFill>
  );
};
