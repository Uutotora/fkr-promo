import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { EXPO, INOUT, IN, rand, tw, useSec, track } from "../lib";

/* One continuous world for the first 30 seconds: a night city whose lit windows are
   the ФКР mark's windows. The camera tilts up into the sky for the problems, tilts
   back down, and the city meets the dawn when the unified system appears. */

type Bld = { x: number; w: number; h: number; cols: number; rows: number; seed: number; roof: number };

const makeSkyline = (seed: number, minH: number, maxH: number, k: number): Bld[] => {
  const out: Bld[] = [];
  let x = -160;
  let i = 0;
  while (x < 2120) {
    const r = rand(seed + i * 7.13);
    const cols = Math.round(3 + r * 7);
    const rows = Math.round((minH + rand(seed + i * 3.7) * (maxH - minH)) / (34 * k));
    const w = cols * 24 * k + 28 * k;
    out.push({ x, w, h: rows * 34 * k + 34 * k, cols, rows, seed: seed * 1000 + i * 37, roof: rand(seed + i * 9.1) });
    x += w + (6 + rand(seed + i) * 30) * k;
    i++;
  }
  return out;
};

/** Mix two hex colours. */
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

const Layer: React.FC<{ blds: Bld[]; k: number; lit: number; dim: number; base: number; night: string; day: string; dawn: number; off: number; id: string }> = ({ blds, k, lit, dim, base, night, day, dawn, off, id }) => {
  const s = useSec();
  const ww = 8 * k;
  const wh = 16 * k;
  const top = mix(night, day, dawn);
  const bottom = mix("#03052e", "#dfe4f0", dawn);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id={`bloom${id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={5 * k} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`fac${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`rim${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(140,170,255,0.0)" />
          <stop offset="0.5" stopColor={`rgba(150,180,255,${0.55 * (1 - dawn)})`} />
          <stop offset="1" stopColor="rgba(140,170,255,0.0)" />
        </linearGradient>
      </defs>
      {blds.map((b) => {
        const y0 = base - b.h;
        return (
          <g key={b.seed}>
            <rect x={b.x} y={y0} width={b.w} height={b.h + 400} fill={`url(#fac${id})`} />
            {/* roof light: a thin rim like the mark's frame */}
            <rect x={b.x} y={y0} width={b.w} height={2 * k} fill={`url(#rim${id})`} />
            {b.roof > 0.7 && <rect x={b.x + b.w * 0.3} y={y0 - 18 * k} width={b.w * 0.25} height={18 * k} fill={`url(#fac${id})`} />}
            {b.roof > 0.88 && <rect x={b.x + b.w * 0.7} y={y0 - 60 * k} width={2 * k} height={60 * k} fill={`url(#fac${id})`} />}
            {b.roof > 0.88 && <circle cx={b.x + b.w * 0.7 + k} cy={y0 - 60 * k} r={2.5 * k} fill={C.red} opacity={(0.4 + 0.6 * Math.abs(Math.sin(s * 2 + b.seed))) * (1 - dawn)} />}
          </g>
        );
      })}
      <g filter={`url(#bloom${id})`}>
        {blds.map((b) => {
          const items: React.ReactNode[] = [];
          for (let r = 0; r < b.rows; r++) {
            for (let c = 0; c < b.cols; c++) {
              const th = rand(b.seed + r * 13.1 + c * 5.7);
              const on = tw(lit - th, [0, 0.03], [0, 1]);
              // daylight switches windows off in a wave from the horizon upwards
              const offK = tw(off - (1 - r / b.rows) * 0.5 - th * 0.4, [0, 0.1], [0, 1]);
              const flick = 0.82 + 0.18 * Math.sin(s * (2 + th * 4) + th * 40);
              const warm = rand(b.seed + r + c * 2.3) > 0.16;
              const a = on * flick * dim * (1 - offK);
              if (a < 0.02) continue;
              items.push(
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 14 * k + c * 24 * k}
                  y={base - b.h + 20 * k + r * 34 * k}
                  width={ww}
                  height={wh}
                  fill={warm ? C.orangeLogo : "#ffe2b8"}
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

const STARS = Array.from({ length: 90 }, (_, i) => ({ x: rand(i * 3.1) * 1920, y: rand(i * 7.7) * 620, r: 0.6 + rand(i * 1.3) * 1.4, p: rand(i * 5.5) * 6 }));

export const NightWorld: React.FC = () => {
  const s = useSec();
  const far = useMemo(() => makeSkyline(3, 140, 320, 0.6), []);
  const mid = useMemo(() => makeSkyline(17, 160, 380, 0.8), []);
  const near = useMemo(() => makeSkyline(11, 170, 420, 1), []);

  // how much of the city is lit: statements light it, problems keep it busy
  const lit = 0.04 + tw(s, [0, 0.8], [0, 0.16]) + tw(s, [2.5, 3.1], [0, 0.2]) + tw(s, [4.5, 5.1], [0, 0.18]) + tw(s, [6.5, 7.1], [0, 0.22]) + tw(s, [8, 24], [0, 0.12]);
  // camera tilt: city -> sky (problems) -> city (dawn)
  const tilt = track(s, [
    [0, 0],
    [7.7, 0],
    [8.9, 1],
    [23.4, 1],
    [24.9, 0],
  ], INOUT);
  const dawn = tw(s, [25.0, 27.6], [0, 1], INOUT);
  const off = tw(s, [24.8, 27.2], [0, 1.6], (t) => t);
  const fly = tw(s, [29.0, 29.75], [0, 1], (t) => t * t);
  const push = 1 + s * 0.006 + fly * 0.6;

  const skyTop = mix("#01021a", "#eef2fb", dawn);
  const skyMid = mix("#050a36", "#f4f6fb", dawn);
  const skyLow = mix("#0d1a6a", "#fff6ee", dawn);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 55%, ${skyLow} 100%)` }} />
      {/* colour blooms — soft, never muddy */}
      <div style={{ position: "absolute", left: -300 + Math.sin(s * 0.2) * 60, top: -500, width: 1500, height: 1200, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(49,107,253,0.22), rgba(49,107,253,0))", opacity: 1 - dawn * 0.6 }} />
      <div style={{ position: "absolute", right: -400, top: -300 + Math.cos(s * 0.25) * 50, width: 1400, height: 1100, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(110,92,255,0.12), rgba(120,92,255,0))", opacity: 1 - dawn }} />
      {/* stars */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: (1 - dawn) * 0.9, translate: `0 ${tilt * 120}px` }}>
        {STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#cfd8ff" opacity={0.25 + 0.35 * Math.abs(Math.sin(s * 0.8 + st.p))} />
        ))}
      </svg>
      {/* horizon glow: city light at night, sunrise at dawn */}
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 620 + tilt * 420 - dawn * 60,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${dawn > 0 ? `rgba(255,214,170,${0.25 + dawn * 0.55})` : "rgba(255,140,60,0.30)"}, rgba(255,140,60,0))`,
        }}
      />
      {dawn > 0 && (
        <div style={{ position: "absolute", left: 960 - 450, top: 760 + tilt * 420 - dawn * 160, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,255,255,${dawn}), rgba(255,236,214,${0.6 * dawn}) 30%, rgba(255,236,214,0) 70%)` }} />
      )}
      <AbsoluteFill style={{ scale: String(push), translate: `0 ${tilt * 470}px`, filter: fly > 0 ? `blur(${fly * 14}px)` : undefined, opacity: 1 - fly * 0.6 }}>
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 5}px ${-40 + tilt * -60}px` }}>
          <Layer id="f" blds={far} k={0.6} lit={lit * 1.2} dim={0.5} base={890} night="#0a1150" day="#cdd6ea" dawn={dawn} off={off} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, height: 300, background: `linear-gradient(180deg, transparent, ${dawn > 0 ? `rgba(240,244,252,${0.5 * dawn})` : "rgba(20,30,120,0.35)"}, transparent)` }} />
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 9}px ${tilt * -30}px` }}>
          <Layer id="m" blds={mid} k={0.8} lit={lit * 1.05} dim={0.75} base={980} night="#070d44" day="#d7deee" dawn={dawn} off={off} />
        </div>
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 15}px 0` }}>
          <Layer id="n" blds={near} k={1} lit={lit} dim={1} base={1090} night="#050a36" day="#e1e6f2" dawn={dawn} off={off} />
        </div>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 55%, ${dawn > 0 ? `rgba(244,245,248,${0.6 * dawn})` : "rgba(1,2,30,0.55)"} 100%)` }} />
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 80% at 50% 45%, transparent 55%, rgba(0,1,25,${0.55 * (1 - dawn)}) 100%)` }} />
      {/* night → day exposure flare */}
      <AbsoluteFill style={{ background: "#fff", opacity: tw(s, [25.3, 26.2, 27.4], [0, 0.35, 0], INOUT) }} />
    </AbsoluteFill>
  );
};
