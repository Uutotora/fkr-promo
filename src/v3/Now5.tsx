import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";

/* «Как это работает сейчас», art-directed: glass slabs in space, huge thin numbers,
   light instead of lines and boxes. One object keeps changing form through the five problems:
   four systems → one request (its versions peel back into depth) → a point of light on a route
   (every extra trip leaves an arc) → the route bends into a loop → the loop folds into paper →
   three copies of the same document → one lit window in the waking city. */

export const NOW5 = { intro: 8.1, p: [9.0, 13.8, 18.6, 23.4, 28.2], end: 33.0 };
const P = NOW5.p;
const O = [P[1] - 0.45, P[2] - 0.45, P[3] - 0.45, P[4] - 0.45, NOW5.end - 0.45];

const HX = 1340;
const GY = 520;
const WHITE = "#fff";
const MUTED = "rgba(255,255,255,0.55)";
const ORANGE = C.orange;
const RED = "#FF6B7E";
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const glass = (a = 1): React.CSSProperties => ({
  background: `linear-gradient(155deg, rgba(255,255,255,${0.14 * a}), rgba(255,255,255,${0.045 * a}) 62%)`,
  boxShadow: `0 60px 100px -50px rgba(0,0,0,0.8), inset 0 0 60px rgba(150,170,255,${0.08 * a})`,
});
/** Dense glass: the sheet in front hides what is behind it. */
const solidGlass: React.CSSProperties = {
  background: "linear-gradient(155deg, rgba(52,60,148,0.97), rgba(24,29,88,0.97) 70%)",
  boxShadow: "0 60px 110px -40px rgba(0,0,0,0.85), inset 0 0 70px rgba(150,170,255,0.10)",
};
const NUM: React.CSSProperties = { fontFamily: FONT, fontWeight: 250, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", lineHeight: 1, color: WHITE };

/* ------------------------------------------------------------------ type */

const MaskLines: React.FC<{ lines: string[]; inAt: number; outAt?: number; size: number; weight: number; color: string; lh?: number; stagger?: number }> = ({ lines, inAt, outAt, size, weight, color, lh = 1.08, stagger = 0.07 }) => {
  const s = useSec();
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight: lh, letterSpacing: size > 40 ? "-0.03em" : "-0.005em" }}>
      {lines.map((l, i) => {
        const k = tw(s, [inAt + i * stagger, inAt + i * stagger + 0.75], [0, 1], EXPO);
        const o = outAt === undefined ? 0 : tw(s, [outAt + i * 0.045, outAt + i * 0.045 + 0.42], [0, 1], (x) => x * x * x);
        return (
          <div key={i} style={{ overflow: "hidden", padding: `0 0 ${size * 0.14}px`, marginBottom: -size * 0.14 }}>
            <div style={{ translate: `0 ${(1 - k) * 112 - o * 112}%`, whiteSpace: "nowrap" }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

const Counter: React.FC = () => {
  const s = useSec();
  const k0 = tw(s, [P[0] - 0.1, P[0] + 0.5], [0, 1], EXPO);
  let v = 0;
  for (let i = 0; i < 4; i++) v += tw(s, [O[i] + 0.1, O[i] + 0.65], [0, 1], INOUT);
  const out = tw(s, [O[4], O[4] + 0.4], [0, 1], (x) => x * x);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: FONT, fontWeight: 800, fontVariantNumeric: "tabular-nums", height: 40 }}>
      <div style={{ height: 40, overflow: "hidden", fontSize: 30, color: ORANGE }}>
        <div style={{ translate: `0 ${(1 - k0) * 40 - v * 40 - out * 40}px` }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ height: 40, lineHeight: "40px" }}>0{n}</div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.38)", opacity: k0 * (1 - out) }}>/ 05</div>
    </div>
  );
};

const TEXT = [
  { t: ["Несколько систем —", "разные цифры"], d: ["Сложно оценить обеспеченность", "объектов и причины задержек"] },
  { t: ["Заявки пересоздают", "и сверяют вручную"], d: ["Заказывают по предварительным объёмам,", "потом сверяют с потребностью и остатками"] },
  { t: ["Лишние", "перевозки"], d: ["Поставки не совпадают", "с готовностью объектов"] },
  { t: ["Заявки ходят", "по кругу"], d: ["Долгая ручная проверка, возвраты", "на доработку и аннулирования"] },
  { t: ["Одни данные —", "много раз"], d: ["Ручной ввод и сверка, расхождения", "в документах и названиях материалов"] },
];

/** A soft orange pill — the one-line verdict of each problem. */
const Verdict: React.FC<{ at: number; out: number; x: number; y: number; children: React.ReactNode; red?: boolean }> = ({ at, out, x, y, children, red }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.6], [0, 1], EXPO) * (1 - tw(s, [out, out + 0.25], [0, 1], IN));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: `-50% ${(1 - k) * 14 - 50}%`, opacity: k, padding: "11px 22px", borderRadius: 99, background: red ? "rgba(255,107,126,0.16)" : "rgba(253,132,49,0.16)", color: red ? RED : ORANGE, fontFamily: FONT, fontSize: 21, fontWeight: 750, whiteSpace: "nowrap", boxShadow: `0 0 40px ${red ? "rgba(255,107,126,0.25)" : "rgba(253,132,49,0.22)"}` }}>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ 3D space for 01–02 */

/** Camera of the glass space: a slow turn while the slabs float; flat when the sheet leaves. */
const camera = (s: number) => {
  const ry = s < P[1] ? lerp(-22, -11, tw(s, [P[0] - 0.2, O[0]], [0, 1], (x) => x)) : lerp(-11, -6, tw(s, [P[1], O[1]], [0, 1], (x) => x));
  const flat = tw(s, [O[1], O[1] + 0.5], [0, 1], INOUT);
  const rx = s < P[1] ? lerp(10, 6, tw(s, [P[0], O[0]], [0, 1])) : 6;
  return { ry: ry * (1 - flat), rx: rx * (1 - flat) };
};

const Space: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const s = useSec();
  const cam = camera(s);
  return (
    <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: `${HX}px ${GY}px` }}>
      <div style={{ position: "absolute", left: HX, top: GY, transformStyle: "preserve-3d", transform: `rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)` }}>{children}</div>
    </AbsoluteFill>
  );
};

type B3 = { x: number; y: number; z: number; w: number; h: number; r: number };
const slab = (b: B3): React.CSSProperties => ({ position: "absolute", left: b.x - b.w / 2, top: b.y - b.h / 2, width: b.w, height: b.h, borderRadius: b.r, transform: `translateZ(${b.z}px)` });
const lerpB = (a: B3, b: B3, k: number): B3 => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), r: lerp(a.r, b.r, k) });

/** A soft band of light crosses a glass surface once. */
const Sheen: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const k = tw(s, [at, at + 1.1], [0, 1], INOUT);
  if (k <= 0 || k >= 1) return null;
  return <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${k * 140 - 40}%, rgba(255,255,255,0.16) ${k * 140 - 25}%, transparent ${k * 140 - 10}%)` }} />;
};

/* ---------- 01 · four systems, four numbers ---------- */
const TILES = [
  { name: "1С:Склад", dot: "#F6C744", v: 96, at: { x: -198, y: -122, z: 50 } },
  { name: "ИС РСКР", dot: "#5B86FF", v: 120, at: { x: 198, y: -122, z: -60 } },
  { name: "Excel", dot: "#33B36B", v: -1, at: { x: -198, y: 128, z: -25 } },
  { name: "Диадок", dot: "#19C2B2", v: 110, at: { x: 198, y: 128, z: 85 } },
];
const SHEET: B3 = { x: 0, y: -10, z: 0, w: 640, h: 340, r: 32 };
const Q1 = "Сколько радиаторов на объекте?";

const Systems: React.FC = () => {
  const s = useSec();
  const t = P[0];
  const o = O[0];
  if (s < t - 0.3 || s > o + 0.8) return null;
  const merge = (i: number) => tw(s, [o + 0.05 + i * 0.03, o + 0.75], [0, 1], INOUT);
  const fade = tw(s, [o, o + 0.2], [0, 1]);
  return (
    <>
      {TILES.map((x, i) => {
        const k = tw(s, [t + 0.55 + i * 0.12, t + 1.45 + i * 0.12], [0, 1], EXPO);
        if (k <= 0) return null;
        const home: B3 = { ...x.at, w: 360, h: 225, r: 28 };
        const b = lerpB({ ...home, z: home.z - 500, y: home.y + 80 }, home, k);
        const m = merge(i);
        const bb = m > 0 ? lerpB(home, SHEET, m) : b;
        const op = Math.min(1, k * 1.4) * (i === 0 ? 1 : 1 - tw(s, [o + 0.45, o + 0.75], [0, 1]));
        const cnt = Math.round(tw(s, [t + 1.05 + i * 0.12, t + 2.0 + i * 0.12], [0, Math.max(0, x.v)], OUT));
        const drift = Math.sin(s * 0.9 + i * 1.7) * 6;
        return (
          <div key={i} style={{ ...slab({ ...bb, y: bb.y + drift * (1 - m) }), ...glass(), opacity: op, overflow: "hidden" }}>
            <Sheen at={t + 1.1 + i * 0.12} />
            <div style={{ position: "absolute", left: 28, top: 24, right: 24, bottom: 22, opacity: 1 - fade, display: "flex", flexDirection: "column", fontFamily: FONT }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 9, background: x.dot, boxShadow: `0 0 14px ${x.dot}` }} />
                {x.name}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ ...NUM, fontSize: 128, color: x.v < 0 ? RED : WHITE }}>{x.v < 0 ? (s > t + 1.5 ? "?" : "") : cnt}</span>
                {x.v >= 0 && <span style={{ fontFamily: FONT, fontSize: 22, color: MUTED }}>шт.</span>}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ---------- 02 · one request: its versions peel back into depth ---------- */
const REQ_ARR = [O[0] + 0.72, P[1] + 1.35, P[1] + 2.5];
const QTY = ["42", "36", "31"];

const SheetFace: React.FC<{ v: number; roll: number; ghost?: boolean; strike?: number }> = ({ v, roll, ghost, strike = 0 }) => (
  <div style={{ position: "absolute", inset: 0, padding: "28px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: FONT }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: WHITE }}>Заявка З-2026-0188</div>
        <div style={{ fontSize: 18, color: MUTED, marginTop: 4 }}>утеплитель</div>
      </div>
      <div style={{ flex: 1 }} />
      {ghost ? (
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.12em", color: RED }}>ПЕРЕСОЗДАНА</div>
      ) : (
        <div style={{ height: 36, overflow: "hidden", padding: "0 14px", borderRadius: 10, background: "rgba(253,132,49,0.16)", color: ORANGE, fontSize: 19, fontWeight: 800 }}>
          <div style={{ translate: `0 ${-roll * 36}px` }}>
            {["v1", "v2", "v3"].map((x) => (
              <div key={x} style={{ height: 36, lineHeight: "36px" }}>{x}</div>
            ))}
          </div>
        </div>
      )}
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <div style={{ translate: `0 ${-(ghost ? v : roll) * 150}px` }}>
          {QTY.map((q) => (
            <div key={q} style={{ ...NUM, fontSize: 150, height: 150, lineHeight: "150px" }}>{q}</div>
          ))}
        </div>
        {strike > 0 && <div style={{ position: "absolute", left: 0, top: 80, height: 5, borderRadius: 3, width: `${strike * 100}%`, background: RED, boxShadow: `0 0 16px ${RED}` }} />}
      </div>
      <span style={{ fontSize: 44, fontWeight: 300, color: MUTED }}>м³</span>
    </div>
  </div>
);

const CHECKS = ["сверка с потребностью", "сверка с остатками", "сверка с проектом"];
const CHECK_AT = [P[1] + 1.0, P[1] + 2.1, P[1] + 3.2];
/** Route of the trips (03) — the request becomes a point of light at its start. */
const RA = { x: 1000, y: 700 };
const RB = { x: 1680, y: 700 };

const Requests: React.FC = () => {
  const s = useSec();
  const o = O[1];
  if (s < REQ_ARR[0] - 0.02 || s > o + 0.85) return null;
  const roll = tw(s, [REQ_ARR[1] + 0.1, REQ_ARR[1] + 0.65], [0, 1], INOUT) + tw(s, [REQ_ARR[2] + 0.1, REQ_ARR[2] + 0.65], [0, 1], INOUT);
  const faceIn = tw(s, [REQ_ARR[0], REQ_ARR[0] + 0.35], [0, 1]);
  const drop = tw(s, [o, o + 0.3], [0, 1], IN);
  const shrink = tw(s, [o + 0.12, o + 0.8], [0, 1], INOUT);
  const faceOut = tw(s, [o, o + 0.2], [0, 1]);
  // the sheet in screen space when the camera is flat → a point of light at the route start
  const sx = lerp(HX + SHEET.x, RA.x, shrink);
  const sy = lerp(GY + SHEET.y, RA.y, shrink);
  const sw = lerp(SHEET.w, 18, shrink);
  const sh = lerp(SHEET.h, 18, shrink);
  const glow = tw(shrink, [0.65, 1], [0, 1]);
  return (
    <>
      <Space>
        {/* ghosts of the earlier versions, pushed back into depth */}
        {[0, 1].map((j) => {
          const d = tw(s, [REQ_ARR[j + 1], REQ_ARR[j + 1] + 0.7], [0, 1], EXPO) + (j === 0 ? tw(s, [REQ_ARR[2], REQ_ARR[2] + 0.7], [0, 1], EXPO) : 0);
          if (d <= 0) return null;
          const strike = tw(s, [REQ_ARR[j + 1] + 0.35, REQ_ARR[j + 1] + 0.75], [0, 1], INOUT);
          const b: B3 = { ...SHEET, x: SHEET.x - 170 * d, y: SHEET.y - 140 * d, z: -300 * d };
          return (
            <div key={j} style={{ ...slab(b), ...glass(0.7), opacity: (0.5 - 0.18 * (d - 1)) * (1 - drop), overflow: "hidden", filter: `blur(${2.5 * d}px)` }}>
              <div style={{ opacity: 0.85 }}>
                <SheetFace v={j} roll={j} ghost strike={strike} />
              </div>
            </div>
          );
        })}
        {shrink === 0 && (
          <div style={{ ...slab(SHEET), ...solidGlass, overflow: "hidden" }}>
            <Sheen at={REQ_ARR[0] + 0.1} />
            <Sheen at={REQ_ARR[1] + 0.2} />
            <Sheen at={REQ_ARR[2] + 0.2} />
            <div style={{ opacity: faceIn * (1 - faceOut) }}>
              <SheetFace v={2} roll={roll} />
            </div>
          </div>
        )}
        {/* hand checks under the sheet */}
        {CHECKS.map((c, i) => {
          const k = tw(s, [CHECK_AT[i] - 0.25, CHECK_AT[i] + 0.2], [0, 1], EXPO) * (1 - drop);
          const draw = tw(s, [CHECK_AT[i], CHECK_AT[i] + 0.45], [0, 1], INOUT);
          return (
            <div key={c} style={{ position: "absolute", left: -280, top: 185 + i * 44, width: 560, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontSize: 21, fontWeight: 600, color: draw >= 1 ? WHITE : MUTED, opacity: k, transform: "translateZ(0px)" }}>
              <svg width={26} height={26} viewBox="0 0 26 26" style={{ overflow: "visible" }}>
                <path d="M3 14 L10 20 L23 5" fill="none" stroke={ORANGE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: "drop-shadow(0 0 6px rgba(253,132,49,0.7))" }} />
              </svg>
              {c}
              <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 800, letterSpacing: "0.12em", color: ORANGE, opacity: tw(s, [CHECK_AT[i] + 0.4, CHECK_AT[i] + 0.7], [0, 1]) }}>ВРУЧНУЮ</span>
            </div>
          );
        })}
      </Space>
      {/* the sheet leaves the (now flat) space and condenses into a point of light */}
      {shrink > 0 && (
        <div style={{ position: "absolute", left: sx - sw / 2, top: sy - sh / 2, width: sw, height: sh, borderRadius: lerp(30, 9, shrink), ...glass(1 - glow), background: glow > 0 ? `rgba(253,132,49,${glow})` : glass().background, boxShadow: `0 0 ${50 * glow}px ${14 * glow}px rgba(253,132,49,${0.55 * glow})`, overflow: "hidden" }}>
          <div style={{ opacity: 1 - faceOut }}>
            <SheetFace v={2} roll={roll} />
          </div>
        </div>
      )}
    </>
  );
};

/* ---------- 03 · a point of light on a route; every extra trip leaves an arc ---------- */
const TRIPS = [
  { a: P[2] + 0.7, b: P[2] + 1.7, from: RA, to: RB, bow: -110 },
  { a: P[2] + 2.25, b: P[2] + 3.1, from: RB, to: RA, bow: -190 },
  { a: P[2] + 3.3, b: P[2] + 4.15, from: RA, to: RB, bow: -270 },
];
const quad = (A: { x: number; y: number }, Bp: { x: number; y: number }, bow: number, u: number) => {
  const cx = (A.x + Bp.x) / 2;
  const cy = A.y + 2 * bow;
  return { x: (1 - u) ** 2 * A.x + 2 * (1 - u) * u * cx + u * u * Bp.x, y: (1 - u) ** 2 * A.y + 2 * (1 - u) * u * cy + u * u * Bp.y };
};

const Trips: React.FC = () => {
  const s = useSec();
  const t = P[2];
  const o = O[2];
  if (s < O[1] + 0.5 || s > o + 0.4) return null;
  const out = tw(s, [o, o + 0.3], [0, 1], IN);
  const map = tw(s, [t - 0.2, t + 0.8], [0, 1]) * (1 - out);
  const ends = tw(s, [t + 0.1, t + 0.6], [0, 1], EXPO) * (1 - out);
  const trip = s >= TRIPS[2].a ? 3 : s >= TRIPS[1].a ? 2 : 1;
  const counter = tw(s, [t + 0.4, t + 0.9], [0, 1], EXPO) * (1 - out);
  const notReady = tw(s, [t + 1.75, t + 2.15], [0, 1], EXPO) * (1 - out);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="mapFade" cx="50%" cy="60%" r="55%">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="mapMask">
            <rect x={860} y={240} width={960} height={620} fill="url(#mapFade)" />
          </mask>
          <filter id="arcGlow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* a quiet city map underneath: a few streets, barely there */}
        <g mask="url(#mapMask)" opacity={map * 0.9} stroke="rgba(170,185,255,0.09)" strokeWidth={1.5} fill="none">
          {[
            "M860 420 L1820 360",
            "M860 560 L1820 590",
            "M860 790 L1820 760",
            "M960 240 L1010 860",
            "M1180 240 L1150 860",
            "M1420 240 L1460 860",
            "M1640 240 L1610 860",
            "M900 300 L1300 860",
            "M1500 260 L1820 640",
          ].map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {/* the trips: each one leaves an arc of light */}
        {TRIPS.map((tr, i) => {
          const u = tw(s, [tr.a, tr.b], [0, 1], INOUT);
          if (u <= 0) return null;
          const pts = Array.from({ length: 49 }, (_, j) => quad(tr.from, tr.to, tr.bow, (j / 48) * u));
          const d = "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L");
          const settled = s > tr.b ? 0.5 : 1;
          return <path key={i} d={d} fill="none" stroke={i === 0 ? "rgba(255,255,255,0.7)" : ORANGE} strokeWidth={3} strokeLinecap="round" opacity={settled * (1 - out)} filter="url(#arcGlow)" />;
        })}
      </svg>
      {/* end points */}
      {[
        { p: RA, l: "Склад ФКР", sub: "" },
        { p: RB, l: "Объект", sub: "ул. Нагорная, 20 к4" },
      ].map((e) => (
        <div key={e.l} style={{ position: "absolute", left: e.p.x, top: e.p.y, opacity: ends, fontFamily: FONT }}>
          <div style={{ position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: 9, background: WHITE, boxShadow: "0 0 18px rgba(255,255,255,0.7)" }} />
          <div style={{ position: "absolute", left: 0, top: 26, translate: "-50% 0", textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: WHITE }}>{e.l}</div>
            {e.sub && <div style={{ fontSize: 16, color: MUTED, marginTop: 3 }}>{e.sub}</div>}
          </div>
        </div>
      ))}
      {/* the point of light rides the current trip */}
      {(() => {
        let pos = RA;
        TRIPS.forEach((tr) => {
          if (s >= tr.a) pos = quad(tr.from, tr.to, tr.bow, tw(s, [tr.a, tr.b], [0, 1], INOUT));
        });
        const shrinkTo = s < O[2] ? 1 : 1 - tw(s, [o, o + 0.25], [0, 1]) * 0.4;
        return (
          <div style={{ position: "absolute", left: pos.x - 9, top: pos.y - 9, width: 18, height: 18, borderRadius: 9, background: ORANGE, boxShadow: "0 0 30px 10px rgba(253,132,49,0.55)", scale: String(shrinkTo), opacity: s > o + 0.3 ? 0 : 1 }} />
        );
      })()}
      {/* object not ready */}
      <div style={{ position: "absolute", left: RB.x, top: RB.y - 64, translate: "-50% -100%", opacity: notReady, fontFamily: FONT, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 750, color: RED }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: RED, boxShadow: `0 0 12px ${RED}` }} />
        объект не готов
      </div>
      {/* trips counter */}
      <div style={{ position: "absolute", left: 1000, top: 270, opacity: counter, display: "flex", alignItems: "baseline", gap: 14, fontFamily: FONT }}>
        <div style={{ height: 130, overflow: "hidden" }}>
          <div style={{ translate: `0 ${-(tw(s, [TRIPS[1].a, TRIPS[1].a + 0.4], [0, 1], INOUT) + tw(s, [TRIPS[2].a, TRIPS[2].a + 0.4], [0, 1], INOUT)) * 130}px` }}>
            {["1", "2", "3"].map((n, i) => (
              <div key={n} style={{ ...NUM, fontSize: 130, height: 130, lineHeight: "130px", color: i > 0 ? ORANGE : WHITE }}>{n}</div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 24, color: MUTED, fontWeight: 500 }}>{trip === 1 ? "рейс" : "рейса"}</div>
      </div>
      <Verdict at={t + 3.6} out={o} x={RB.x - 110} y={330}>
        +2 лишних рейса
      </Verdict>
    </>
  );
};

/* ---------- the route ⇄ the loop: one line that bends into a circle ---------- */
const LY = 510;
const RING_R = 190;
const L0 = RB.x - RA.x;
const L1 = 2 * Math.PI * RING_R;
const bent = (u: number, L: number, kap: number, bx: number, by: number) => {
  const a = (u - 0.5) * L;
  if (kap < 1e-6) return [bx + a, by];
  const ph = kap * a;
  return [bx + Math.sin(ph) / kap, by - (1 - Math.cos(ph)) / kap];
};

const Route: React.FC = () => {
  const s = useSec();
  const draw = tw(s, [O[1] + 0.55, O[1] + 1.25], [0, 1], EXPO);
  const bend = tw(s, [O[2] + 0.25, O[2] + 0.95], [0, 1], INOUT);
  if (draw <= 0 || s > O[3] + 0.16) return null;
  const L = lerp(L0, L1, bend);
  const kap = bend > 0 ? (bend * 2 * Math.PI) / L : 0;
  const by = lerp(RA.y, LY + RING_R, bend);
  const bx = (RA.x + RB.x) / 2;
  // drawn outward from the start point A (where the sheet became light)
  const u0 = 0;
  const u1 = draw;
  const pts = Array.from({ length: 121 }, (_, i) => bent(u0 + ((u1 - u0) * i) / 120, L, kap, bx, by));
  const d = "M" + pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join(" L");
  // the point of light rides the bend from B
  const dotK = tw(s, [O[2], O[2] + 0.2], [0, 1]);
  const dp = bent(1, L, kap, bx, by);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" />
      {dotK > 0 && s < P[3] + 0.6 && (
        <g>
          <circle cx={dp[0]} cy={dp[1]} r={22} fill="rgba(253,132,49,0.35)" style={{ filter: "blur(8px)" }} />
          <circle cx={dp[0]} cy={dp[1]} r={8} fill={WHITE} />
        </g>
      )}
    </svg>
  );
};

/* ---------- 04 · one ring, one streak of light ---------- */
const STATUS = [
  { l: "На проверке", a: -90 },
  { l: "Возвращена", a: 0 },
  { l: "Исправлена", a: 90 },
  { l: "Снова на проверке", a: 180 },
];
const A0 = -90; // the point of light arrives on top of the ring

const Loop: React.FC = () => {
  const s = useSec();
  const t = P[3];
  const o = O[3];
  if (s < O[2] + 0.9 || s > o + 0.3) return null;
  const turn = tw(s, [t + 0.6, t + 3.05], [0, 1.75], INOUT);
  const ang = A0 + turn * 360;
  const fail = tw(s, [t + 3.05, t + 3.4], [0, 1], EXPO);
  const out = tw(s, [o, o + 0.25], [0, 1], IN);
  const center = tw(s, [t + 0.25, t + 0.85], [0, 1], EXPO) * (1 - out);
  const day = Math.round(tw(s, [t + 0.6, t + 3.1], [1, 14], (x) => x));
  const lap = turn >= 1 ? 2 : 1;
  const pulse = tw(s, [t + 3.15, t + 4.1], [0, 1], OUT);
  const pos = (deg: number, r = RING_R) => ({ x: HX + Math.cos((deg * Math.PI) / 180) * r, y: LY + Math.sin((deg * Math.PI) / 180) * r });
  const col = fail > 0 ? RED : ORANGE;
  const arc = (a0: number, a1: number) => {
    const p0 = pos(a0);
    const p1 = pos(a1);
    return `M ${p0.x} ${p0.y} A ${RING_R} ${RING_R} 0 0 1 ${p1.x} ${p1.y}`;
  };
  const SEG = 36;
  const TAIL = 95;
  return (
    <>
      {/* the red bloom of an annulment — light, not a line */}
      {pulse > 0 && pulse < 1 && <div style={{ position: "absolute", left: HX - 400, top: LY - 400, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,90,110,0.35), rgba(255,90,110,0))", scale: String(0.5 + pulse), opacity: 1 - pulse }} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={HX} cy={LY} r={RING_R} fill="none" stroke={fail > 0 ? `rgba(255,107,126,${0.22 + 0.4 * fail})` : "rgba(255,255,255,0.22)"} strokeWidth={2} opacity={s < o + 0.16 ? 1 : 0} />
        {/* the streak: a tapering tail of light */}
        <g opacity={(1 - fail) * (1 - out) * tw(s, [t + 0.45, t + 0.7], [0, 1])} style={{ filter: "drop-shadow(0 0 8px rgba(253,132,49,0.8))" }}>
          {Array.from({ length: SEG }, (_, j) => {
            const a1 = ang - (j * TAIL) / SEG;
            const a0 = ang - ((j + 1) * TAIL) / SEG;
            const k = 1 - j / SEG;
            return <path key={j} d={arc(a0, a1)} fill="none" stroke={col} strokeWidth={1 + 4 * k} strokeLinecap="round" opacity={Math.pow(k, 1.6)} />;
          })}
          <circle cx={pos(ang).x} cy={pos(ang).y} r={7} fill={WHITE} />
        </g>
        {STATUS.map((st) => {
          const p = pos(st.a);
          const d = (((ang - st.a) % 360) + 360) % 360;
          const near = turn > 0.02 && fail === 0 ? Math.max(0, 1 - d / 60) : 0;
          return <circle key={st.l} cx={p.x} cy={p.y} r={5 + 3 * near} fill={near > 0 ? WHITE : "rgba(255,255,255,0.4)"} opacity={(1 - out) * tw(s, [t + 0.2, t + 0.6], [0, 1])} />;
        })}
      </svg>
      {STATUS.map((st, i) => {
        const p = pos(st.a, RING_R + 30);
        const d = (((ang - st.a) % 360) + 360) % 360;
        const near = turn > 0.02 && fail === 0 ? Math.max(0, 1 - d / 70) : 0;
        const k = tw(s, [t + 0.25 + i * 0.08, t + 0.75 + i * 0.08], [0, 1], EXPO) * (1 - out);
        const align = st.a === 0 ? "0 -50%" : st.a === 180 ? "-100% -50%" : st.a === -90 ? "-50% -100%" : "-50% 0";
        return (
          <div key={st.l} style={{ position: "absolute", left: p.x, top: p.y, translate: align, opacity: k, fontFamily: FONT, fontSize: 21, fontWeight: 650, whiteSpace: "nowrap", color: near > 0.35 ? WHITE : "rgba(255,255,255,0.42)", textShadow: near > 0.35 ? "0 0 20px rgba(253,132,49,0.6)" : undefined }}>
            {st.l}
          </div>
        );
      })}
      {/* the days, in the middle */}
      <div style={{ position: "absolute", left: HX, top: LY, translate: "-50% -50%", textAlign: "center", opacity: center, scale: String(0.94 + 0.06 * center), fontFamily: FONT, whiteSpace: "nowrap" }}>
        <div style={{ ...NUM, fontSize: 150, fontWeight: 200, color: fail > 0 ? RED : WHITE }}>{day}</div>
        <div style={{ position: "relative", height: 26, marginTop: 6 }}>
          <div style={{ fontSize: 19, color: MUTED, opacity: 1 - fail }}>{lap > 1 ? "дней · второй круг" : "дней на согласовании"}</div>
          <div style={{ position: "absolute", inset: 0, fontSize: 17, fontWeight: 800, letterSpacing: "0.2em", color: RED, opacity: fail }}>АННУЛИРОВАНА</div>
        </div>
      </div>
    </>
  );
};

/* ---------- 05 · the ring folds into paper; one document, three spellings ---------- */
const DOC_W = 250;
const DOC_H = 320;
const DOC_Y = LY - 20;
const DOCS = [
  { d: "УПД", n: "№ 418", name: "Радиатор биметалл. 10 с.", q: "100", dx: -275, ry: 24 },
  { d: "ТТН", n: "№ 77", name: "Радиатор БМ 10 секций", q: "100", dx: 0, ry: 0 },
  { d: "М-15", n: "№ 12", name: "Радиатор 10-секц.", q: "98", dx: 275, ry: -24, bad: true },
];

const Retype: React.FC = () => {
  const s = useSec();
  const t = P[4];
  const o4 = O[3];
  const o = O[4];
  if (s < o4 + 0.15 || s > o + 1.0) return null;
  const fold = tw(s, [o4 + 0.15, o4 + 0.85], [0, 1], INOUT);
  if (fold < 1) {
    const w = lerp(RING_R * 2, DOC_W, fold);
    const h = lerp(RING_R * 2, DOC_H, fold);
    const fill = tw(fold, [0.15, 0.45], [0, 1]);
    return (
      <div style={{ position: "absolute", left: HX - w / 2, top: lerp(LY, DOC_Y, fold) - h / 2, width: w, height: h, borderRadius: lerp(RING_R, 10, fold), boxSizing: "border-box", border: `${lerp(2, 0, fill)}px solid rgba(255,107,126,${1 - fill})`, background: `rgba(245,243,238,${fill})`, boxShadow: fill > 0.5 ? "0 40px 80px -30px rgba(0,0,0,0.8)" : undefined }} />
    );
  }
  const split = tw(s, [t + 0.4, t + 1.0], [0, 1], EXPO);
  const merge = tw(s, [o, o + 0.4], [0, 1], INOUT);
  const shrink = tw(s, [o + 0.3, o + 0.65], [0, 1], INOUT);
  const fall = tw(s, [o + 0.6, o + 0.95], [0, 1], IN);
  const lines = tw(s, [t + 0.3, t + 0.7], [0, 1]) * (1 - tw(s, [o, o + 0.2], [0, 1]));
  const ask = tw(s, [t + 3.0, t + 3.5], [0, 1], EXPO) * (1 - tw(s, [o, o + 0.2], [0, 1], IN));
  return (
    <>
      {DOCS.map((doc, i) => {
        if (i !== 1 && (split <= 0 || merge >= 1)) return null;
        const k = split * (1 - merge);
        const at0 = t + 1.0 + i * 0.25;
        const n = Math.round(tw(s, [at0, at0 + 1.0], [0, doc.name.length], (x) => x));
        const done = n >= doc.name.length;
        const mark = tw(s, [t + 2.45 + i * 0.12, t + 2.85 + i * 0.12], [0, 1], INOUT);
        const isWin = i === 1 && shrink > 0;
        const w = isWin ? lerp(DOC_W, 26, shrink) : DOC_W;
        const h = isWin ? lerp(DOC_H, 36, shrink) : DOC_H;
        const warm = isWin ? shrink : 0;
        return (
          <div key={doc.d} style={{ position: "absolute", left: HX + doc.dx * k - w / 2, top: DOC_Y - h / 2 + fall * 340, width: w, height: h, borderRadius: isWin ? lerp(10, 3, shrink) : 10, transform: `perspective(1400px) rotateY(${doc.ry * k}deg) translateZ(${-70 * k * (i === 1 ? 0 : 1)}px)`, background: warm > 0 ? `rgb(${Math.round(lerp(245, 255, warm))},${Math.round(lerp(243, 178, warm))},${Math.round(lerp(238, 94, warm))})` : "#F5F3EE", boxShadow: warm > 0.3 ? `0 0 ${60 * warm}px ${20 * warm}px rgba(255,170,80,${0.6 * warm})` : "0 40px 80px -30px rgba(0,0,0,0.8)", overflow: "hidden", opacity: 1 - tw(fall, [0.6, 1], [0, 1]), zIndex: i === 1 ? 3 : 1, fontFamily: FONT }}>
            <div style={{ position: "absolute", left: 22, top: 22, width: DOC_W - 44, color: "#1c1f33", opacity: lines }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 850, letterSpacing: "0.04em" }}>{doc.d}</span>
                <span style={{ fontSize: 15, color: "#8a8ca0" }}>{doc.n}</span>
              </div>
              <div style={{ height: 1.5, background: "#1c1f33", opacity: 0.12, margin: "14px 0 18px" }} />
              <div style={{ position: "relative", fontSize: 19, fontWeight: 700, lineHeight: 1.3, minHeight: 50 }}>
                <span style={{ position: "absolute", left: -4, right: -4, top: 2, bottom: 2, borderRadius: 4, background: "rgba(253,132,49,0.35)", transformOrigin: "0 50%", scale: `${mark} 1` }} />
                <span style={{ position: "relative" }}>
                  {doc.name.slice(0, n)}
                  {!done && s > at0 && <span style={{ display: "inline-block", width: 2, height: 20, background: "#1c1f33", marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 4) % 2 }} />}
                </span>
              </div>
              <div style={{ marginTop: 20, ...NUM, fontSize: 54, fontWeight: 300, color: doc.bad && done ? "#D0344B" : "#1c1f33" }}>{done ? doc.q : ""}</div>
              {[0, 1].map((j) => (
                <div key={j} style={{ height: 6, borderRadius: 9, background: "#1c1f33", opacity: 0.07, marginTop: 14, width: `${78 - j * 24}%` }} />
              ))}
            </div>
          </div>
        );
      })}
      <Verdict at={t + 3.0} out={o} x={HX} y={DOC_Y + DOC_H / 2 + 70}>
        Это одна позиция?
      </Verdict>
      {ask > 1 ? null : null}
    </>
  );
};

/* ------------------------------------------------------------------ the scene */

export const Now5: React.FC = () => {
  const s = useSec();
  const intro = NOW5.intro;
  const dock = tw(s, [P[0] - 0.3, P[0] + 0.4], [0, 1], INOUT);
  const hudOut = tw(s, [NOW5.end - 0.3, NOW5.end + 0.2], [0, 1], IN);
  const w = (i: number) => {
    const a = i === 0 ? P[0] - 0.4 : O[i - 1] + 0.2;
    return tw(s, [a, a + 0.7], [0, 1], INOUT) * (i < 4 ? 1 - tw(s, [O[i] + 0.2, O[i] + 0.9], [0, 1], INOUT) : 1 - hudOut);
  };
  const fail = tw(s, [P[3] + 3.05, P[3] + 3.4], [0, 1]) * (1 - tw(s, [O[3], O[3] + 0.6], [0, 1]));
  const GLOW = ["90,120,255", "120,140,255", "253,132,49", "120,140,255", "253,150,70"];
  const fontSize = 92 + (24 - 92) * dock;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {GLOW.map((g, i) => {
        const k = w(i);
        return k > 0 ? <div key={i} style={{ position: "absolute", left: HX - 640, top: GY - 500, width: 1280, height: 1000, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${g},0.2), rgba(${g},0))`, opacity: k }} /> : null;
      })}
      {fail > 0 && <div style={{ position: "absolute", left: HX - 640, top: GY - 500, width: 1280, height: 1000, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,80,100,0.22), rgba(255,80,100,0))", opacity: fail }} />}

      <div style={{ position: "absolute", left: 960 + (96 - 960) * dock, top: 470 + (74 - 470) * dock, translate: `${-50 * (1 - dock)}% 0`, fontSize, fontWeight: 800 - dock * 150, letterSpacing: "-0.03em", color: WHITE, whiteSpace: "nowrap", opacity: 1 - hudOut, display: "flex", gap: fontSize * 0.26 }}>
        {["Как", "это", "работает", "сейчас"].map((wd, i) => (
          <span key={wd} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
            <span style={{ display: "inline-block", translate: `0 ${(1 - tw(s, [intro + i * 0.07, intro + i * 0.07 + 0.8], [0, 1], EXPO)) * 110}%`, color: i === 3 ? ORANGE : WHITE }}>{wd}</span>
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 96, top: 118, display: "flex", gap: 8, opacity: dock * (1 - hudOut) }}>
        {P.map((t, i) => (
          <div key={i} style={{ width: 58, height: 5, borderRadius: 9, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
            <div style={{ width: `${tw(s, [t, (P[i + 1] ?? NOW5.end) - 0.1], [0, 100], (x) => x)}%`, height: 5, background: ORANGE }} />
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 96, top: 318, width: 720 }}>
        <Counter />
        <div style={{ height: 18 }} />
        <div style={{ position: "relative", height: 170 }}>
          {TEXT.map((x, i) =>
            s > P[i] - 0.3 && s < O[i] + 0.7 ? (
              <div key={i} style={{ position: "absolute", left: 0, top: 0 }}>
                <MaskLines lines={x.t} inAt={P[i] - 0.05} outAt={O[i]} size={66} weight={800} color={WHITE} />
              </div>
            ) : null,
          )}
        </div>
        <div style={{ height: 22 }} />
        <div style={{ position: "relative", height: 90 }}>
          {TEXT.map((x, i) =>
            s > P[i] && s < O[i] + 0.7 ? (
              <div key={i} style={{ position: "absolute", left: 0, top: 0 }}>
                <MaskLines lines={x.d} inAt={P[i] + 0.22} outAt={O[i] + 0.04} size={27} weight={500} color="rgba(255,255,255,0.7)" lh={1.36} stagger={0.06} />
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* the question of 01 — just type, typed */}
      <Question />
      <Space>
        <Systems />
      </Space>
      <Verdict at={P[0] + 2.9} out={O[0]} x={HX} y={GY + 300}>
        4 системы — 4 разных ответа
      </Verdict>
      <Requests />
      <Verdict at={P[1] + 3.6} out={O[1]} x={HX + 120} y={GY + 345}>
        3 версии одной заявки
      </Verdict>
      <Route />
      <Trips />
      <Loop />
      <Retype />
    </AbsoluteFill>
  );
};

const Question: React.FC = () => {
  const s = useSec();
  const t = P[0];
  const k = tw(s, [t - 0.15, t + 0.3], [0, 1], EXPO) * (1 - tw(s, [O[0], O[0] + 0.3], [0, 1], IN));
  if (k <= 0) return null;
  const n = Math.round(tw(s, [t + 0.05, t + 0.75], [0, Q1.length], (x) => x));
  return (
    <div style={{ position: "absolute", left: HX, top: GY - 300, translate: `-50% ${(1 - k) * 20}px`, opacity: k, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontSize: 30, fontWeight: 500, color: WHITE, whiteSpace: "nowrap" }}>
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2.2} strokeLinecap="round">
        <circle cx={11} cy={11} r={7} />
        <path d="M21 21l-4.5-4.5" />
      </svg>
      <span>
        {Q1.slice(0, n)}
        <span style={{ display: "inline-block", width: 2, height: 30, marginLeft: 3, verticalAlign: "middle", background: ORANGE, opacity: n < Q1.length || Math.floor(s * 2.5) % 2 ? 1 : 0 }} />
      </span>
    </div>
  );
};
