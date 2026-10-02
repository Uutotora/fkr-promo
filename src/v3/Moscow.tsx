import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { INOUT, rand, track, tw, useSec } from "../lib";

/* Night Moscow, drawn: a Stalin high-rise with a spire, the University, Ostankino,
   the Moscow-City cluster, П-44 panel towers with loggias and brick five-storeys.
   One persistent world for the first act — night → dawn. */

export const W3 = {
  litEnd: 33.0,
  tiltUp: [7.7, 8.9] as [number, number],
  tiltDown: [32.4, 33.9] as [number, number],
  dawn: [34.0, 36.6] as [number, number],
  off: [33.8, 36.2] as [number, number],
  flare: [34.3, 35.2, 36.4],
  fly: [38.0, 38.75] as [number, number],
};

type Win = { x: number; y: number; w: number; h: number; th: number; tone: number; row: number; rows: number };
type Shape = { d: string; rim?: string };
type Bld = { shapes: Shape[]; wins: Win[]; red?: { x: number; y: number; p: number }[] };

const P = (pts: [number, number][]) => "M" + pts.map((p) => p.join(" ")).join(" L") + " Z";

let SEED = 1;
const R = () => rand(SEED++ * 1.37);

/** Windows on a rectangle, floor by floor. */
const grid = (x: number, top: number, w: number, h: number, k: number, opt: { cols?: number; fh?: number; ww?: number; wh?: number; pair?: boolean; tone?: number } = {}): Win[] => {
  const fh = (opt.fh ?? 30) * k;
  const rows = Math.max(1, Math.floor((h - 14 * k) / fh));
  const ww = (opt.ww ?? 8) * k;
  const wh = (opt.wh ?? 15) * k;
  const cols = opt.cols ?? Math.max(1, Math.floor((w - 12 * k) / (ww * (opt.pair ? 2.6 : 2.4))));
  const step = (w - 12 * k) / cols;
  const out: Win[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + 6 * k + c * step + (step - ww) / 2;
      const cy = top + 10 * k + r * fh;
      const th = R();
      const tone = opt.tone ?? R();
      if (opt.pair) {
        out.push({ x: cx - ww * 0.6, y: cy, w: ww, h: wh, th, tone, row: r, rows });
        out.push({ x: cx + ww * 0.6, y: cy, w: ww, h: wh, th: th * 0.9 + 0.05, tone, row: r, rows });
      } else out.push({ x: cx, y: cy, w: ww, h: wh, th, tone, row: r, rows });
    }
  }
  return out;
};

const panel = (x: number, base: number, w: number, floors: number, k: number): Bld => {
  const fh = 30 * k;
  const h = floors * fh + 18 * k;
  const top = base - h;
  const shapes: Shape[] = [{ d: P([[x, base + 400], [x, top], [x + w, top], [x + w, base + 400]]), rim: P([[x, top], [x + w, top], [x + w, top + 2 * k], [x, top + 2 * k]]) }];
  // loggia columns: slightly lighter vertical bands
  const bands = Math.max(1, Math.round(w / (70 * k)));
  for (let b = 0; b < bands; b++) {
    const bx = x + (b + 0.5) * (w / bands) - 9 * k;
    shapes.push({ d: P([[bx, top + 8 * k], [bx + 18 * k, top + 8 * k], [bx + 18 * k, base + 400], [bx, base + 400]]) });
  }
  if (R() > 0.4) shapes.push({ d: P([[x + w * 0.35, top], [x + w * 0.35, top - 16 * k], [x + w * 0.55, top - 16 * k], [x + w * 0.55, top]]) });
  const red = R() > 0.55 ? [{ x: x + w * 0.8, y: top - 3 * k, p: R() * 6 }] : [];
  return { shapes, wins: grid(x, top, w, h, k, { pair: true }), red };
};

const brick5 = (x: number, base: number, w: number, k: number): Bld => {
  const h = 5 * 30 * k + 16 * k;
  const top = base - h;
  return { shapes: [{ d: P([[x, base + 400], [x, top], [x + w, top], [x + w, base + 400]]), rim: P([[x, top], [x + w, top], [x + w, top + 2 * k], [x, top + 2 * k]]) }], wins: grid(x, top, w, h, k, {}) };
};

/** Stepped Stalin tower with wings and a spire (Kotelnicheskaya / University family). */
const stalin = (cx: number, base: number, k: number, wide = 1): Bld => {
  const tiers: [number, number][] = [
    [380 * wide, 150],
    [230, 130],
    [150, 120],
    [90, 90],
    [48, 60],
  ];
  const shapes: Shape[] = [];
  const wins: Win[] = [];
  let y = base;
  // wings
  const ww = 210 * wide * k;
  for (const side of [-1, 1]) {
    const wx = side < 0 ? cx - (tiers[0][0] / 2) * k - ww + 30 * k : cx + (tiers[0][0] / 2) * k - 30 * k;
    const wt = base - 120 * k;
    shapes.push({ d: P([[wx, base + 400], [wx, wt], [wx + ww, wt], [wx + ww, base + 400]]), rim: P([[wx, wt], [wx + ww, wt], [wx + ww, wt + 2 * k], [wx, wt + 2 * k]]) });
    wins.push(...grid(wx, wt, ww, 120 * k, k, { fh: 26, ww: 6, wh: 12 }));
    // small corner turret
    const tx = side < 0 ? wx + 10 * k : wx + ww - 34 * k;
    shapes.push({ d: P([[tx, wt], [tx, wt - 40 * k], [tx + 12 * k, wt - 52 * k], [tx + 24 * k, wt - 40 * k], [tx + 24 * k, wt]]) });
  }
  for (const [tw_, th_] of tiers) {
    const w = tw_ * k;
    const h = th_ * k;
    const x = cx - w / 2;
    shapes.push({ d: P([[x, y + (y === base ? 400 : 2)], [x, y - h], [x + w, y - h], [x + w, y + (y === base ? 400 : 2)]]), rim: P([[x, y - h], [x + w, y - h], [x + w, y - h + 2 * k], [x, y - h + 2 * k]]) });
    wins.push(...grid(x, y - h, w, h, k, { fh: 24, ww: 6, wh: 11 }));
    y -= h;
  }
  // spire + star
  shapes.push({ d: P([[cx - 9 * k, y], [cx, y - 150 * k], [cx + 9 * k, y]]) });
  return { shapes, wins, red: [{ x: cx, y: y - 156 * k, p: 0 }] };
};

const ostankino = (cx: number, base: number, k: number): Bld => {
  const H = 640 * k;
  const shapes: Shape[] = [
    { d: P([[cx - 70 * k, base + 400], [cx - 22 * k, base - 120 * k], [cx - 9 * k, base - H * 0.68], [cx + 9 * k, base - H * 0.68], [cx + 22 * k, base - 120 * k], [cx + 70 * k, base + 400]]) },
    { d: P([[cx - 24 * k, base - H * 0.66], [cx - 26 * k, base - H * 0.7], [cx + 26 * k, base - H * 0.7], [cx + 24 * k, base - H * 0.66]]) },
    { d: P([[cx - 6 * k, base - H * 0.7], [cx - 3 * k, base - H], [cx + 3 * k, base - H], [cx + 6 * k, base - H * 0.7]]) },
  ];
  const wins: Win[] = [];
  for (let i = 0; i < 9; i++) wins.push({ x: cx - 22 * k + i * 5.2 * k, y: base - H * 0.695, w: 3 * k, h: 5 * k, th: R() * 0.4, tone: 0.95, row: 0, rows: 1 });
  return { shapes, wins, red: [0.35, 0.55, 0.8, 1].map((f, i) => ({ x: cx, y: base - H * f, p: i * 1.3 })) };
};

const cityTower = (x: number, base: number, w: number, h: number, k: number, kind: number): Bld => {
  const top = base - h;
  let d: string;
  if (kind === 0) d = P([[x, base + 400], [x, top + 20 * k], [x + w * 0.5, top], [x + w, top + 20 * k], [x + w, base + 400]]);
  else if (kind === 1) d = P([[x, base + 400], [x + w * 0.12, top], [x + w * 0.88, top], [x + w, base + 400]]);
  else if (kind === 2) d = `M${x} ${base + 400} C ${x - w * 0.15} ${base - h * 0.4}, ${x + w * 0.2} ${top + h * 0.3}, ${x + w * 0.1} ${top} L ${x + w * 0.9} ${top} C ${x + w * 1.1} ${top + h * 0.4}, ${x + w * 0.85} ${base - h * 0.3}, ${x + w} ${base + 400} Z`;
  else d = P([[x, base + 400], [x, top + 40 * k], [x + w * 0.4, top + 40 * k], [x + w * 0.4, top], [x + w, top], [x + w, base + 400]]);
  const wins: Win[] = [];
  const fh = 9 * k;
  const rows = Math.floor((h - 30 * k) / fh);
  for (let r = 0; r < rows; r++) {
    const segs = 3;
    for (let sgm = 0; sgm < segs; sgm++) {
      const th = R();
      wins.push({ x: x + w * 0.16 + sgm * (w * 0.7) / segs, y: top + 26 * k + r * fh, w: (w * 0.7) / segs - 3 * k, h: 2.6 * k, th, tone: 0.82 + R() * 0.18, row: r, rows });
    }
  }
  return { shapes: [{ d, rim: P([[x + w * 0.1, top], [x + w * 0.9, top], [x + w * 0.9, top + 2], [x + w * 0.1, top + 2]]) }], wins, red: [{ x: x + w / 2, y: top - 2 * k, p: R() * 5 }] };
};

/** night → twilight → day, so the sky never passes through grey */
const mix3 = (a: string, m: string, b: string, t: number) => (t < 0.5 ? mix(a, m, t * 2) : mix(m, b, (t - 0.5) * 2));
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

const WARM = ["#FF9A3C", "#FFB25E", "#FFC983", "#FF8A1F", "#FFE3B8"];

const Layer: React.FC<{ id: string; blds: Bld[]; lit: number; dim: number; dawn: number; off: number; night: [string, string]; day: [string, string]; bloom: number }> = ({ id, blds, lit, dim, dawn, off, night, day, bloom }) => {
  const s = useSec();
  const top = mix3(night[0], "#6a5d9a", day[0], dawn);
  const bot = mix3(night[1], "#8a7aa8", day[1], dawn);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <filter id={`b${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={bloom} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {blds.map((b, i) =>
        b.shapes.map((sh, j) => (
          <React.Fragment key={`${i}-${j}`}>
            <path d={sh.d} fill={`url(#g${id})`} />
            {j > 0 && sh.rim === undefined && <path d={sh.d} fill={`rgba(150,170,230,${0.035 * (1 - dawn)})`} />}
            {sh.rim && <path d={sh.rim} fill={`rgba(150,175,255,${0.32 * (1 - dawn)})`} />}
          </React.Fragment>
        )),
      )}
      <g filter={`url(#b${id})`}>
        {blds.map((b, i) =>
          b.wins.map((w, j) => {
            const on = tw(lit - w.th, [0, 0.03], [0, 1]);
            const offK = tw(off - (1 - w.row / Math.max(1, w.rows)) * 0.5 - w.th * 0.4, [0, 0.1], [0, 1]);
            const flick = 0.85 + 0.15 * Math.sin(s * (1.5 + w.th * 3) + w.th * 50);
            const a = on * flick * dim * (1 - offK);
            if (a < 0.03) return null;
            const fill = w.tone > 0.94 ? "#BFD6FF" : w.tone > 0.8 ? "#E9F0FF" : WARM[Math.floor(w.tone * 5) % 5];
            return <rect key={`${i}-${j}`} x={w.x} y={w.y} width={w.w} height={w.h} fill={fill} opacity={a} />;
          }),
        )}
      </g>
      {blds.map((b, i) =>
        (b.red ?? []).map((r, j) => (
          <circle key={`r${i}-${j}`} cx={r.x} cy={r.y} r={3} fill="#ff3b4d" opacity={(0.25 + 0.75 * Math.max(0, Math.sin(s * 2.2 + r.p))) * (1 - dawn)} style={{ filter: "drop-shadow(0 0 6px #ff3b4d)" }} />
        )),
      )}
    </svg>
  );
};

const STARS = Array.from({ length: 120 }, (_, i) => ({ x: rand(i * 3.1) * 1920, y: rand(i * 7.7) * 560, r: 0.5 + rand(i * 1.3) * 1.2, p: rand(i * 5.5) * 6 }));

export const Moscow: React.FC = () => {
  const s = useSec();
  const world = useMemo(() => {
    SEED = 7;
    // far: Ostankino, the University, the Moscow-City cluster, low fill
    const k0 = 0.55;
    const far: Bld[] = [ostankino(260, 860, k0), stalin(800, 860, k0, 1.5)];
    const cityX = [1300, 1360, 1420, 1490, 1555, 1620, 1690];
    const cityH = [300, 420, 520, 470, 600, 380, 330];
    cityX.forEach((x, i) => far.push(cityTower(x, 860, (40 + (i % 3) * 14) * 1.0, cityH[i] * k0 * 1.2, k0, i % 4)));
    for (let x = -100; x < 2000; x += 70 + R() * 90) far.push(panel(x, 860, 60 + R() * 70, 4 + Math.floor(R() * 8), k0));
    // mid: a Stalin high-rise and slab towers
    const k1 = 0.78;
    const mid: Bld[] = [stalin(1120, 970, k1, 1)];
    for (let x = -120; x < 2050; x += 130 + R() * 120) {
      if (Math.abs(x + 60 - 1120) < 260) continue;
      mid.push(R() > 0.3 ? panel(x, 970, 110 + R() * 90, 10 + Math.floor(R() * 8), k1) : brick5(x, 970, 140 + R() * 60, k1));
    }
    // near: П-44 towers, 9-storeys and brick five-storeys
    const k2 = 1;
    const near: Bld[] = [];
    for (let x = -140; x < 2080; x += 170 + R() * 120) {
      const t = R();
      near.push(t > 0.62 ? panel(x, 1095, 150 + R() * 70, 14 + Math.floor(R() * 4), k2) : t > 0.25 ? panel(x, 1095, 180 + R() * 90, 8 + Math.floor(R() * 2), k2) : brick5(x, 1095, 200 + R() * 80, k2));
    }
    return { far, mid, near };
  }, []);

  const lit = 0.05 + tw(s, [0, 0.8], [0, 0.16]) + tw(s, [2.5, 3.1], [0, 0.2]) + tw(s, [4.5, 5.1], [0, 0.18]) + tw(s, [6.5, 7.1], [0, 0.2]) + tw(s, [8, W3.litEnd], [0, 0.12]);
  const tilt = track(s, [[0, 0], [W3.tiltUp[0], 0], [W3.tiltUp[1], 1], [W3.tiltDown[0], 1], [W3.tiltDown[1], 0]], INOUT);
  const dawn = tw(s, W3.dawn, [0, 1], INOUT);
  const off = tw(s, W3.off, [0, 1.6], (t) => t);
  const fly = tw(s, W3.fly, [0, 1], (t) => t * t);
  const push = 1 + s * 0.004 + fly * 0.6;

  // Moscow night: deep ink at the zenith, warm sodium haze at the horizon
  const skyTop = mix3("#010210", "#5a63b8", "#eef2fb", dawn);
  const skyMid = mix3("#060a26", "#d9a9c6", "#f4f6fb", dawn);
  const skyLow = mix3("#2a1f45", "#ffc49a", "#fff4ea", dawn);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 50%, ${skyLow} 100%)` }} />
      {/* soft night glows — light, not gradients */}
      <div style={{ position: "absolute", left: -400 + Math.sin(s * 0.2) * 50, top: -520, width: 1400, height: 1100, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(70,90,255,0.20), rgba(70,90,255,0))", opacity: 1 - dawn }} />
      <div style={{ position: "absolute", right: -420, top: -480 + Math.cos(s * 0.23) * 40, width: 1300, height: 1000, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(150,90,255,0.14), rgba(150,90,255,0))", opacity: 1 - dawn }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: (1 - dawn) * 0.9, translate: `0 ${tilt * 120}px` }}>
        {STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#d6deff" opacity={0.2 + 0.3 * Math.abs(Math.sin(s * 0.7 + st.p))} />
        ))}
      </svg>
      {/* horizon glow */}
      <div style={{ position: "absolute", left: -300, right: -300, top: 600 + tilt * 420 - dawn * 60, height: 760, borderRadius: "50%", background: `radial-gradient(closest-side, ${dawn > 0 ? `rgba(255,214,170,${0.25 + dawn * 0.55})` : "rgba(255,130,60,0.34)"}, rgba(255,130,60,0))` }} />
      {dawn > 0 && <div style={{ position: "absolute", left: 960 - 450, top: 760 + tilt * 420 - dawn * 160, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,255,255,${dawn}), rgba(255,236,214,${0.6 * dawn}) 30%, rgba(255,236,214,0) 70%)` }} />}
      <AbsoluteFill style={{ scale: String(push), translate: `0 ${tilt * 470}px`, filter: fly > 0 ? `blur(${fly * 14}px)` : undefined, opacity: 1 - fly * 0.6 }}>
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 4}px ${-30 + tilt * -60}px` }}>
          <Layer id="f" blds={world.far} lit={lit * 1.2} dim={0.55} dawn={dawn} off={off} night={["#0c1033", "#060818"]} day={["#cdd6ea", "#dfe5f1"]} bloom={2.5} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, height: 320, background: `linear-gradient(180deg, transparent, ${dawn > 0 ? `rgba(240,244,252,${0.5 * dawn})` : "rgba(70,40,80,0.28)"}, transparent)` }} />
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 8}px ${tilt * -30}px` }}>
          <Layer id="m" blds={world.mid} lit={lit * 1.05} dim={0.78} dawn={dawn} off={off} night={["#0a0d2b", "#04061a"]} day={["#d7deee", "#e4e9f3"]} bloom={3.5} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 260, background: `linear-gradient(180deg, transparent, ${dawn > 0 ? "transparent" : "rgba(60,30,60,0.22)"}, transparent)` }} />
        <div style={{ position: "absolute", inset: 0, translate: `${-s * 13}px 0` }}>
          <Layer id="n" blds={world.near} lit={lit} dim={1} dawn={dawn} off={off} night={["#080a22", "#020311"]} day={["#e1e6f2", "#eef1f7"]} bloom={4.5} />
        </div>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 60%, ${dawn > 0 ? `rgba(244,245,248,${0.6 * dawn})` : "rgba(1,2,16,0.6)"} 100%)` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 80% at 50% 45%, transparent 55%, rgba(0,1,12,${0.6 * (1 - dawn)}) 100%)` }} />
      <AbsoluteFill style={{ background: "#fff2e2", opacity: tw(s, W3.flare, [0, 0.16, 0], INOUT) }} />
      <div style={{ display: "none" }}>{C.ink}</div>
    </AbsoluteFill>
  );
};
