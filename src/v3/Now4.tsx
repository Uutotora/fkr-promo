import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";
import { IPencil } from "../components/Icons";

/* «Как это работает сейчас» — one hero object that keeps changing form:
   a question splits into four systems → they merge into one request → the request is
   loaded as a truck's cargo → the road bends into a loop → the loop becomes a sheet of
   paper → the sheet is copied three times → the copies merge into one lit window. */

export const NOW4 = { intro: 8.1, p: [9.0, 13.8, 18.6, 23.4, 28.2], end: 33.0 };
const P = NOW4.p;
/** Each problem leaves 0.45 s before the next one lands (after its reading hold). */
const O = [P[1] - 0.45, P[2] - 0.45, P[3] - 0.45, P[4] - 0.45, NOW4.end - 0.45];

const HX = 1320;
const HY = 540;
const CARD = "#1A1F66";
const CARD_SHADOW = "0 34px 70px -34px rgba(0,0,0,0.75)";
const MUTED = "rgba(255,255,255,0.62)";
const PAPER = "#F6F4EE";

type R = { x: number; y: number; w: number; h: number; r: number };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpR = (a: R, b: R, k: number): R => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), r: lerp(a.r, b.r, k) });
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
};
const at = (r: R): React.CSSProperties => ({ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: r.r });

/* ------------------------------------------------------------------ type */

/** Lines slide in and out of a mask — no blur, no fade: the cut of the type does the work. */
const MaskLines: React.FC<{ lines: string[]; inAt: number; outAt?: number; size: number; weight: number; color: string; lh?: number; stagger?: number; style?: React.CSSProperties }> = ({ lines, inAt, outAt, size, weight, color, lh = 1.08, stagger = 0.07, style }) => {
  const s = useSec();
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight: lh, letterSpacing: size > 40 ? "-0.03em" : "-0.005em", ...style }}>
      {lines.map((l, i) => {
        const k = tw(s, [inAt + i * stagger, inAt + i * stagger + 0.75], [0, 1], EXPO);
        const o = outAt === undefined ? 0 : tw(s, [outAt + i * 0.045, outAt + i * 0.045 + 0.42], [0, 1], (x) => x * x * x);
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: size * 0.14, marginBottom: -size * 0.14 }}>
            <div style={{ translate: `0 ${(1 - k) * 112 - o * 112}%`, whiteSpace: "nowrap" }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

/** «01 / 05» — the digit rolls to the next one while the problems hand over. */
const Counter: React.FC = () => {
  const s = useSec();
  const k0 = tw(s, [P[0] - 0.1, P[0] + 0.5], [0, 1], EXPO);
  let v = 0;
  for (let i = 0; i < 4; i++) v += tw(s, [O[i] + 0.1, O[i] + 0.65], [0, 1], INOUT);
  const out = tw(s, [O[4], O[4] + 0.4], [0, 1], (x) => x * x);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: FONT, fontWeight: 800, fontVariantNumeric: "tabular-nums", overflow: "hidden", height: 40 }}>
      <div style={{ height: 40, overflow: "hidden", fontSize: 30, color: C.orange }}>
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

/* ------------------------------------------------------------------ pieces */

const Tag: React.FC<{ at: number; out: number; x: number; y: number; children: React.ReactNode; tone?: "orange" | "red" }> = ({ at, out, x, y, children, tone = "orange" }) => {
  const s = useSec();
  const p = Math.max(0, pop(s, at, 0.5)) * (1 - tw(s, [out, out + 0.22], [0, 1], IN));
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(p), padding: "13px 26px", borderRadius: 99, background: tone === "orange" ? C.orange : "#ff5a6e", color: tone === "orange" ? "#1d0b00" : "#fff", fontFamily: FONT, fontSize: 25, fontWeight: 800, whiteSpace: "nowrap", boxShadow: `0 0 44px ${tone === "orange" ? "rgba(253,132,49,0.42)" : "rgba(255,90,110,0.45)"}` }}>
      {children}
    </div>
  );
};

/* ---------- 01 · the question splits into four systems ---------- */
const BAR: R = { x: HX - 410, y: 236, w: 820, h: 76, r: 22 };
const CELL = (i: number): R => ({ x: HX - 410 + (i % 2) * 421, y: 340 + Math.floor(i / 2) * 170, w: 399, h: 148, r: 20 });
const REQ: R = { x: HX - 320, y: 292, w: 640, h: 196, r: 20 };
const SYS = [
  { badge: "1С", bg: "#F6C744", fg: "#3a2a00", name: "1С:Склад", k: "Остаток", v: 96 },
  { badge: "РС", bg: "#4C7BFF", fg: "#fff", name: "ИС РСКР", k: "Поставлено", v: 120 },
  { badge: "XLS", bg: "#2E9E5B", fg: "#fff", name: "остатки_v7.xlsx", k: "Остаток", v: -1 },
  { badge: "Д", bg: "#14B3A6", fg: "#fff", name: "Контур.Диадок", k: "По УПД", v: 110 },
];
const Q1 = "Сколько радиаторов на ул. Нагорной, 20 к4?";

const Systems: React.FC = () => {
  const s = useSec();
  const t = P[0];
  const o = O[0];
  if (s < t - 0.2 || s > o + 0.8) return null;
  // the bar opens from a pill
  const open = tw(s, [t - 0.15, t + 0.5], [0, 1], EXPO);
  const barOut = tw(s, [o, o + 0.3], [0, 1], IN);
  const bar: R = { ...BAR, x: HX - (BAR.w * (0.093 + 0.907 * open)) / 2, w: BAR.w * (0.093 + 0.907 * open), r: lerp(38, 22, open) };
  const typed = Math.round(tw(s, [t + 0.3, t + 1.05], [0, Q1.length], (x) => x));
  const merge = (i: number) => tw(s, [o + 0.05 + i * 0.03, o + 0.75], [0, 1], INOUT);
  return (
    <>
      {/* four systems: each is born from the bar and dies into the request */}
      {SYS.map((x, i) => {
        const split = tw(s, [t + 0.95 + i * 0.07, t + 1.65 + i * 0.07], [0, 1], EXPO);
        if (split <= 0) return null;
        const m = merge(i);
        const r = m > 0 ? lerpR(CELL(i), REQ, m) : lerpR(BAR, CELL(i), split);
        const c = tw(s, [t + 1.3 + i * 0.07, t + 1.75 + i * 0.07], [0, 1]) * (1 - tw(s, [o, o + 0.2], [0, 1]));
        const cnt = Math.round(tw(s, [t + 1.5 + i * 0.1, t + 2.2 + i * 0.1], [0, Math.max(0, x.v)], OUT));
        return (
          <div key={i} style={{ ...at(r), background: CARD, boxShadow: CARD_SHADOW, overflow: "hidden", zIndex: 4 - i }}>
            <div style={{ position: "absolute", left: 24, top: 22, width: 360, opacity: c, translate: `0 ${(1 - c) * 10}px` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: x.bg, color: x.fg, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 900 }}>{x.badge}</div>
                <div style={{ fontSize: 21, fontWeight: 700, color: "#fff" }}>{x.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 14 }}>
                <span style={{ fontSize: 20, color: MUTED }}>{x.k}</span>
                <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", color: x.v < 0 ? "#ff8a98" : "#fff", fontVariantNumeric: "tabular-nums" }}>{x.v < 0 ? (s > t + 1.6 ? "?" : "") : cnt}</span>
                {x.v >= 0 && <span style={{ fontSize: 20, color: MUTED }}>шт.</span>}
              </div>
            </div>
          </div>
        );
      })}
      {/* the question */}
      <div style={{ ...at(bar), background: "#232A80", boxShadow: CARD_SHADOW, overflow: "hidden", opacity: 1 - barOut, translate: `0 ${-barOut * 24}px`, zIndex: 5 }}>
        <div style={{ position: "absolute", left: 26, top: 0, height: BAR.h, display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap", fontSize: 27, fontWeight: 700, color: "#fff", opacity: tw(s, [t + 0.15, t + 0.4], [0, 1]) }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2.4} strokeLinecap="round">
            <circle cx={11} cy={11} r={7} />
            <path d="M21 21l-4.5-4.5" />
          </svg>
          {Q1.slice(0, typed)}
          {typed < Q1.length && <span style={{ width: 2, height: 28, background: "#fff", opacity: Math.floor(s * 5) % 2 }} />}
        </div>
      </div>
      {/* ≠ between neighbours */}
      {[
        [HX, 414],
        [HX, 584],
        [HX - 210, 499],
        [HX + 211, 499],
      ].map(([x, y], i) => {
        const p = Math.max(0, pop(s, t + 2.4 + i * 0.12, 0.45)) * (1 - tw(s, [o, o + 0.2], [0, 1], IN));
        return p > 0 ? (
          <div key={i} style={{ position: "absolute", left: x - 25, top: y - 25, width: 50, height: 50, borderRadius: 99, background: C.orange, color: "#1d0b00", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 900, scale: String(p), zIndex: 6, boxShadow: "0 0 26px rgba(253,132,49,0.45)" }}>≠</div>
        ) : null;
      })}
      <Tag at={t + 3.0} out={o} x={HX} y={720}>
        4 источника — 4 разных ответа
      </Tag>
    </>
  );
};

/* ---------- 02 · one request, three versions, checked by hand ---------- */
const PencilCheck: React.FC<{ k: number }> = ({ k }) => (
  <svg width={34} height={34} viewBox="0 0 34 34">
    <rect x={2} y={2} width={30} height={30} rx={9} fill={k > 0.98 ? "rgba(76,123,255,0.3)" : "rgba(255,255,255,0.06)"} />
    <path d="M9 17.5l5.5 5.5L25.5 11" fill="none" stroke="#A9C0FF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
  </svg>
);

const VERS = [
  { v: "v1", q: "42", was: "" },
  { v: "v2", q: "36", was: "42" },
  { v: "v3", q: "31", was: "36" },
];
/** Cargo box of the truck at the warehouse (truck scale 1.2, centre x = A). */
const TS = 1.2;
const GROUND = 770;
const A = 1060;
const B = 1590;
const truckTop = GROUND - 103 * TS;
const CARGO: R = { x: A - 105 * TS + 4 * TS, y: truckTop + 16 * TS, w: 128 * TS, h: 66 * TS, r: 8 * TS };

const Requests: React.FC = () => {
  const s = useSec();
  const t = P[1];
  const o = O[1];
  if (s < O[0] + 0.7 || s > o + 0.85) return null;
  const arrive = [O[0] + 0.7, t + 1.35, t + 2.5];
  const checks = ["Сверить с уточнённой потребностью", "Сверить с остатками на объекте", "Сверить с проектными объёмами"];
  const checkAt = [t + 1.0, t + 2.1, t + 3.2];
  const latest = arrive.filter((a) => s >= a).length - 1;
  const drop = tw(s, [o, o + 0.32], [0, 1], IN);
  const cargo = tw(s, [o + 0.05, o + 0.8], [0, 1], INOUT);
  const panel = tw(s, [t + 0.5, t + 1.1], [0, 1], EXPO);
  return (
    <>
      {VERS.map((ver, i) => {
        const k = i === 0 ? 1 : tw(s, [arrive[i], arrive[i] + 0.65], [0, 1], EXPO);
        if (s < arrive[i]) return null;
        const depth = arrive.reduce((d, a, j) => d + (j > i ? tw(s, [a, a + 0.6], [0, 1], INOUT) : 0), 0);
        const front = i === 2;
        if (!front && drop >= 1) return null;
        const stamp = i < 2 ? pop(s, arrive[i + 1] + 0.25, 0.45) : 0;
        const roll = i === 0 ? tw(s, [arrive[0] + 0.05, arrive[0] + 0.5], [0, 1], OUT) : tw(s, [arrive[i] + 0.15, arrive[i] + 0.8], [0, 1], OUT);
        let r: R = { ...REQ, x: REQ.x - depth * 34 + (1 - k) * 180, y: REQ.y - depth * 30 };
        let bg = mix("#1F2675", "#151a57", Math.min(1, depth));
        let content = i === 0 ? tw(s, [arrive[0], arrive[0] + 0.35], [0, 1]) : 1;
        let op = Math.min(1, k * 5) * (1 - Math.min(1, depth) * 0.25 - Math.max(0, depth - 1) * 0.2);
        if (front && cargo > 0) {
          r = lerpR(r, CARGO, cargo);
          bg = mix("#1F2675", "#EEF1F8", tw(cargo, [0.25, 0.9], [0, 1]));
          content = 1 - tw(s, [o, o + 0.2], [0, 1]);
        }
        if (!front) op *= 1 - drop;
        content *= 1 - tw(depth, [0, 0.3], [0, 0.92]); // a card pushed back goes quiet
        const scale = 1 - depth * 0.045;
        return (
          <div key={ver.v} style={{ ...at(r), background: bg, boxShadow: CARD_SHADOW, overflow: "hidden", opacity: op, scale: String(scale), translate: !front ? `0 ${drop * 40}px` : undefined, zIndex: i + 10 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: REQ.w, opacity: content }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", background: "rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 21, fontWeight: 800, flex: 1, color: "#fff" }}>Заявка З-2026-0188 · утеплитель</div>
                <div style={{ padding: "7px 14px", borderRadius: 10, fontSize: 18, fontWeight: 900, background: i === latest ? C.orange : "rgba(255,255,255,0.1)", color: i === latest ? "#1d0b00" : MUTED }}>{ver.v}</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 28, padding: "20px 24px 24px", color: "#fff" }}>
                <div>
                  <div style={{ fontSize: 17, color: MUTED }}>Количество</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 4 }}>
                    <span style={{ fontSize: 58, fontWeight: 900, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", display: "inline-block", translate: `0 ${(1 - roll) * 30}px`, opacity: roll }}>{ver.q} м³</span>
                    {ver.was && (
                      <span style={{ position: "relative", fontSize: 26, fontWeight: 800, color: "#ff8a98", opacity: roll }}>
                        было {ver.was}
                        <span style={{ position: "absolute", left: 0, top: "52%", height: 3, borderRadius: 2, width: `${tw(s, [arrive[i] + 0.5, arrive[i] + 0.9], [0, 100], INOUT)}%`, background: "#ff8a98" }} />
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 17, color: MUTED }}>Основание</div>
                  <div style={{ fontSize: 22, fontWeight: 750, marginTop: 6 }}>предварительный объём</div>
                </div>
              </div>
            </div>
            {/* the stripe of the cargo box appears as the card turns into it */}
            {front && cargo > 0.4 && <div style={{ position: "absolute", left: "9%", right: "9%", top: "40%", height: "12%", borderRadius: 6, background: C.orange, opacity: tw(cargo, [0.4, 0.9], [0, 1]) }} />}
            {stamp > 0 && (
              <div style={{ position: "absolute", right: 24, top: 74, rotate: "-8deg", scale: String(Math.max(0, stamp)), padding: "8px 16px", borderRadius: 10, background: "#ff5a6e", color: "#fff", fontSize: 21, fontWeight: 900, letterSpacing: "0.05em" }}>ПЕРЕСОЗДАНА</div>
            )}
          </div>
        );
      })}
      {/* hand checks */}
      <div style={{ position: "absolute", left: REQ.x, top: 530, width: REQ.w, padding: "14px 24px", boxSizing: "border-box", borderRadius: 20, background: CARD, boxShadow: CARD_SHADOW, opacity: panel * (1 - drop), translate: `0 ${(1 - panel) * 40 + drop * 40}px`, fontFamily: FONT }}>
        {checks.map((c, i) => {
          const k = tw(s, [checkAt[i], checkAt[i] + 0.55], [0, 1], INOUT);
          const writing = k > 0 && k < 1;
          return (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, height: 56, fontSize: 22, fontWeight: 650, color: k > 0.98 ? "#fff" : MUTED }}>
              <PencilCheck k={k} />
              {c}
              {writing && <IPencil size={24} color={C.orange} style={{ translate: `${Math.sin(s * 34) * 3}px ${Math.cos(s * 27) * 2}px` }} />}
              <span style={{ marginLeft: "auto", fontSize: 17, fontWeight: 800, color: C.orange, opacity: tw(s, [checkAt[i] + 0.5, checkAt[i] + 0.8], [0, 1]) }}>вручную</span>
            </div>
          );
        })}
      </div>
      <Tag at={t + 3.6} out={o} x={HX} y={800}>
        3 версии одной заявки
      </Tag>
    </>
  );
};

/* ---------- 03 · the request is the cargo: a night street, three trips ---------- */
const Truck: React.FC<{ flip: boolean; wheel: number; lights: number; cab: number }> = ({ flip, wheel, lights, cab }) => (
  <svg width={210 * TS} height={110 * TS} viewBox="0 0 210 110" style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}>
    <defs>
      <linearGradient id="beam4" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="rgba(255,236,190,0.7)" />
        <stop offset="1" stopColor="rgba(255,236,190,0)" />
      </linearGradient>
    </defs>
    <path d="M196 70 L330 52 L330 100 Z" fill="url(#beam4)" opacity={lights * cab} />
    <ellipse cx={104} cy={104} rx={96} ry={6} fill="rgba(0,0,0,0.45)" opacity={cab} />
    <rect x={4} y={16} width={128} height={66} rx={8} fill="#EEF1F8" />
    <rect x={4} y={16} width={128} height={12} rx={6} fill="#D6DCEB" />
    <rect x={16} y={42} width={104} height={8} rx={4} fill={C.orange} />
    <g opacity={cab} transform={`translate(${(1 - cab) * 30} 0)`}>
      <path d="M134 34h38c4 0 7 2 9 5l17 22c1 2 2 4 2 6v15h-66z" fill="#3A63F0" />
      <path d="M142 40h26l14 18h-40z" fill="#BFD6FF" opacity={0.9} />
      <circle cx={196} cy={70} r={4} fill="#FFF3C8" />
    </g>
    {[42, 166].map((cx) => (
      <g key={cx} transform={`translate(${cx} 88) scale(${cab}) rotate(${wheel})`}>
        <circle r={15} fill="#0F1230" />
        <circle r={6} fill="#9AA6C8" />
        <rect x={-1.5} y={-14} width={3} height={9} fill="#9AA6C8" />
      </g>
    ))}
  </svg>
);

/** A building rises out of the ground (and sinks back into it). */
const Rise3: React.FC<{ k: number; left: number; width: number; height: number; children: React.ReactNode }> = ({ k, left, width, height, children }) =>
  k <= 0 ? null : (
    <div style={{ position: "absolute", left, top: GROUND - height, width, height, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, translate: `0 ${(1 - k) * 100}%` }}>{children}</div>
    </div>
  );

const Trips: React.FC = () => {
  const s = useSec();
  const t = P[2];
  const o = O[2];
  if (s < O[1] + 0.78 || s > o + 0.4) return null;
  const legs: [number, number, number, number][] = [
    [t + 0.75, t + 1.75, A, B],
    [t + 2.3, t + 3.15, B, A],
    [t + 3.35, t + 4.2, A, B],
  ];
  let x = A;
  let flip = false;
  let moving = false;
  legs.forEach(([a, b, from, to]) => {
    if (s >= a) {
      x = from + (to - from) * tw(s, [a, b], [0, 1], INOUT);
      flip = to < from;
      moving = s < b;
    }
  });
  const trip = s >= legs[2][0] ? 3 : s >= legs[1][0] ? 2 : 1;
  const sink = tw(s, [o, o + 0.35], [0, 1], IN);
  const up = (a: number) => tw(s, [a, a + 0.6], [0, 1], EXPO) * (1 - sink);
  const cab = tw(s, [t + 0.3, t + 0.62], [0, 1], EXPO);
  const shrink = tw(s, [o, o + 0.3], [0, 1], IN);
  const ui = 1 - tw(s, [o, o + 0.22], [0, 1]);
  const notReady = Math.max(0, pop(s, t + 1.8, 0.5)) * ui;
  const bump = moving ? Math.sin(s * 40) * 1.2 : 0;
  const blink = 0.3 + 0.7 * Math.max(0, Math.sin(s * 4));
  const lamp = (lx: number, k: number) => (
    <React.Fragment key={lx}>
      <div style={{ position: "absolute", left: lx - 80, top: GROUND - 236, width: 160, height: 236, background: "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,214,150,0.26), rgba(255,214,150,0) 72%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", opacity: tw(k, [0.7, 1], [0, 1]) }} />
      <div style={{ position: "absolute", left: lx - 2, top: GROUND - 250 * k, width: 4, height: 250 * k, background: "#2A3166" }} />
      <div style={{ position: "absolute", left: lx - 16, top: GROUND - 252 * k, width: 32, height: 8, borderRadius: 4, background: "#FFE2A8", boxShadow: "0 0 22px 6px rgba(255,210,140,0.55)", opacity: k }} />
    </React.Fragment>
  );
  return (
    <>
      {lamp(1240, up(t + 0.3))}
      {lamp(1410, up(t + 0.4))}
      {/* warehouse */}
      <Rise3 k={up(t + 0.1)} left={890} width={280} height={240}>
        <svg width={280} height={240} viewBox="0 0 280 240">
          <path d="M14 80 L140 26 L266 80 V240 H14 Z" fill="#232A6B" />
          <path d="M14 80 L140 26 L266 80" stroke="#5967D9" strokeWidth={4} fill="none" />
          <rect x={84} y={124} width={112} height={116} fill="#FFB25E" opacity={0.22} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={84} y={126 + i * 16} width={112} height={4} fill="#3A438F" />
          ))}
          <rect x={70} y={54} width={140} height={34} rx={8} fill="#11163F" />
        </svg>
        <div style={{ position: "absolute", left: 70, top: 61, width: 140, textAlign: "center", fontFamily: FONT, fontSize: 17, fontWeight: 900, letterSpacing: "0.08em", color: C.orange }}>СКЛАД ФКР</div>
      </Rise3>
      {/* construction site */}
      <Rise3 k={up(t + 0.2)} left={1500} width={280} height={330}>
        <svg width={280} height={330} viewBox="0 0 280 330">
          <rect x={36} y={150} width={160} height={180} fill="#232A6B" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={52 + c * 36} y={166 + r * 40} width={18} height={24} fill={(r * 3 + c) % 5 === 0 ? "#FFB25E" : "#141838"} />),
          )}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={26 + i * 42} y={140} width={4} height={190} fill={C.orange} opacity={0.8} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={26} y={160 + i * 44} width={172} height={4} fill={C.orange} opacity={0.8} />
          ))}
          <rect x={226} y={20} width={8} height={310} fill="#F6C744" />
          <rect x={110} y={20} width={160} height={8} fill="#F6C744" />
          <line x1={150} y1={28} x2={150} y2={90} stroke="#c9d2ff" strokeWidth={2} />
          <circle cx={268} cy={16} r={5} fill="#ff3b4d" opacity={blink} />
        </svg>
      </Rise3>
      {/* street sign */}
      <div style={{ position: "absolute", left: 1440, top: GROUND - 74, opacity: up(t + 0.5) * ui, fontFamily: FONT }}>
        <div style={{ position: "absolute", left: 64, top: 26, width: 3, height: 48, background: "#9AA6C8" }} />
        <div style={{ padding: "6px 12px", borderRadius: 6, background: "#2F5BE8", color: "#fff", fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>ул. Нагорная, 20 к4</div>
      </div>
      {/* the truck: its cargo box is the request we just saw */}
      <div style={{ position: "absolute", left: x - 105 * TS, top: truckTop + bump, scale: String(1 - shrink), transformOrigin: "50% 94%", opacity: 1 - tw(shrink, [0.6, 1], [0, 1]) }}>
        <Truck flip={flip} wheel={x * 2.2 * (flip ? -1 : 1)} lights={moving ? 1 : 0.4} cab={cab} />
      </div>
      {/* the status bubble */}
      <div style={{ position: "absolute", left: 1640, top: 392, translate: "-50% -100%", scale: String(notReady), transformOrigin: "50% 100%", fontFamily: FONT }}>
        <div style={{ padding: "11px 18px", borderRadius: 14, background: "#ff5a6e", color: "#fff", fontSize: 19, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 0 40px rgba(255,90,110,0.45)" }}>Объект не готов к приёмке</div>
        <div style={{ margin: "0 auto", width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "12px solid #ff5a6e" }} />
      </div>
      {/* trip counter */}
      <div style={{ position: "absolute", left: 900, top: 260, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, opacity: tw(s, [t + 0.5, t + 0.9], [0, 1]) * ui }}>
        <span style={{ fontSize: 22, color: MUTED, fontWeight: 650 }}>Рейс</span>
        <span style={{ fontSize: 54, fontWeight: 900, color: trip > 1 ? C.orange : "#fff", fontVariantNumeric: "tabular-nums" }}>{trip}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((n) => (
            <span key={n} style={{ width: 12, height: 12, borderRadius: 9, background: n <= trip ? (n > 1 ? C.orange : "#fff") : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
      </div>
      <Tag at={t + 3.6} out={o} x={HX} y={890}>
        +2 лишних рейса
      </Tag>
    </>
  );
};

/* ---------- the road ⇄ the loop: one line that bends into a circle ---------- */
const RING_R = 200;
const L0 = 880;
const L1 = 2 * Math.PI * RING_R;
const DOT_S0 = B - HX; // where the truck stands on the road when it turns into a dot
/** A line of length L bent with curvature κ around its middle point (bx, by). */
const bent = (u: number, L: number, kap: number, bx: number, by: number) => {
  const sArc = (u - 0.5) * L;
  if (kap < 1e-6) return [bx + sArc, by];
  const ph = kap * sArc;
  return [bx + Math.sin(ph) / kap, by - (1 - Math.cos(ph)) / kap];
};

const Road: React.FC = () => {
  const s = useSec();
  const draw = tw(s, [O[1] + 0.35, O[1] + 1.0], [0, 1], EXPO);
  const bend = tw(s, [O[2] + 0.25, O[2] + 0.95], [0, 1], INOUT);
  const gone = s > O[3] + 0.16;
  if (draw <= 0 || gone) return null;
  const L = lerp(L0, L1, bend) * draw;
  const kap = bend > 0 ? (bend * 2 * Math.PI) / lerp(L0, L1, bend) : 0;
  const by = lerp(GROUND, HY + RING_R, bend);
  const pts = Array.from({ length: 97 }, (_, i) => bent(i / 96, L, kap, HX, by));
  const d = "M" + pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join(" L");
  const lane = 1 - tw(s, [O[2], O[2] + 0.2], [0, 1]);
  // the truck shrinks into a dot of light that rides the bend
  const dotK = tw(s, [O[2] + 0.1, O[2] + 0.35], [0, 1], EXPO);
  const sDot = (DOT_S0 / L0) * lerp(L0, L1, bend);
  const dp = bent(0.5 + sDot / Math.max(1, L), L, kap, HX, by);
  const inLoop = s > P[3] + 0.6;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id="roadGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* a dark ground under the street, fading out at the ends */}
      {bend === 0 && (
        <>
          <linearGradient id="gnd" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0d1140" stopOpacity="0" />
            <stop offset="0.18" stopColor="#0d1140" stopOpacity="0.9" />
            <stop offset="0.82" stopColor="#0d1140" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0d1140" stopOpacity="0" />
          </linearGradient>
          <rect x={HX - (L0 / 2 + 60) * draw} y={GROUND + 5} width={(L0 + 120) * draw} height={70} fill="url(#gnd)" opacity={1 - tw(s, [O[2], O[2] + 0.25], [0, 1])} />
        </>
      )}
      <path d={d} fill="none" stroke="rgba(170,185,255,0.16)" strokeWidth={12} strokeLinecap="round" />
      {lane > 0 && <path d={d} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={3} strokeDasharray="22 22" opacity={lane * draw} />}
      {dotK > 0 && !inLoop && (
        <g opacity={dotK}>
          <circle cx={dp[0]} cy={dp[1]} r={16} fill={C.orange} filter="url(#roadGlow)" opacity={0.8} />
          <circle cx={dp[0]} cy={dp[1]} r={8} fill="#fff" />
        </g>
      )}
    </svg>
  );
};

/* ---------- 04 · statuses go round in a circle ---------- */
const StatusIcon: React.FC<{ kind: number; color: string }> = ({ kind, color }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    {kind === 0 && <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />}
    {kind === 1 && <path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />}
    {kind === 2 && <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />}
    {kind === 3 && <path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />}
  </svg>
);
const A0 = 90 - ((DOT_S0 / L0) * L1 / RING_R) * (180 / Math.PI); // where the dot lands on the ring

const Loop: React.FC = () => {
  const s = useSec();
  const t = P[3];
  const o = O[3];
  if (s < O[2] + 0.9 || s > o + 0.3) return null;
  const NODES = [
    { l: "На проверке", a: -90, c: "#8EA8FF" },
    { l: "Возвращена\nна доработку", a: 0, c: "#FFC56B" },
    { l: "Исправлена", a: 90, c: "#6FE0B0" },
    { l: "Повторная\nпроверка", a: 180, c: "#8EA8FF" },
  ];
  const turn = tw(s, [t + 0.6, t + 3.05], [0, 1.75], INOUT);
  const ang = A0 + turn * 360;
  const fail = tw(s, [t + 3.05, t + 3.4], [0, 1], EXPO);
  const stamp = tw(s, [t + 3.25, t + 3.5], [0, 1], (x) => x * x);
  const shock = tw(s, [t + 3.45, t + 4.3], [0, 1], OUT);
  const day = Math.round(tw(s, [t + 0.6, t + 3.1], [1, 14], (x) => x));
  const lap = Math.min(2, Math.floor(turn) + 1);
  const out = tw(s, [o, o + 0.25], [0, 1], IN);
  const center = tw(s, [t + 0.25, t + 0.8], [0, 1], EXPO) * (1 - out);
  const pos = (deg: number, r = RING_R) => ({ x: HX + Math.cos((deg * Math.PI) / 180) * r, y: HY + Math.sin((deg * Math.PI) / 180) * r });
  const ringCol = fail > 0 ? "#ff5a6e" : C.orange;
  const circ = 2 * Math.PI * RING_R;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="cometGlow4" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={HX} cy={HY} r={RING_R} fill="none" stroke={ringCol} strokeWidth={6} strokeDasharray={`${Math.min(1, turn) * circ} 99999`} transform={`rotate(${A0} ${HX} ${HY})`} strokeLinecap="round" opacity={(0.4 + 0.45 * fail) * (s < o + 0.16 ? 1 : 0)} />
        <g filter="url(#cometGlow4)" opacity={(1 - fail) * (1 - out)}>
          {Array.from({ length: 26 }, (_, i) => {
            const p = pos(ang - i * 3.2);
            const k = turn > 0 ? 1 : i === 0 ? 1 : 0;
            return <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 8 : 10 - i * 0.33} fill={i === 0 ? "#fff" : C.orange} opacity={k * (i === 0 ? 1 : (1 - i / 26) * 0.75)} />;
          })}
        </g>
        <g opacity={center}>
          <circle cx={HX} cy={HY} r={128} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
          <circle cx={HX} cy={HY} r={128} fill="none" stroke={fail > 0 ? "#ff5a6e" : "#8EA8FF"} strokeWidth={6} strokeDasharray={`${(day / 14) * 2 * Math.PI * 128} 9999`} transform={`rotate(-90 ${HX} ${HY})`} strokeLinecap="round" />
        </g>
        {shock > 0 && shock < 1 && <circle cx={HX} cy={HY} r={60 + shock * 420} fill="none" stroke={`rgba(255,90,110,${0.7 * (1 - shock)})`} strokeWidth={3} filter="url(#cometGlow4)" />}
      </svg>
      {NODES.map((n, i) => {
        const p = pos(n.a);
        const d = (((ang - n.a) % 360) + 360) % 360;
        const near = turn > 0.02 && d < 40 && fail === 0 ? 1 - d / 40 : 0;
        const k = Math.max(0, pop(s, t + 0.2 + i * 0.1, 0.5)) * (1 - out);
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", opacity: 1 - stamp * 0.65, display: "flex", alignItems: "center", gap: 10, padding: "11px 16px 11px 12px", borderRadius: 16, background: "#1E2470", boxShadow: `0 0 ${40 * near}px ${n.c}, ${CARD_SHADOW}`, scale: String(k * (1 + near * 0.08)), color: "#fff", fontFamily: FONT }}>
            <span style={{ width: 34, height: 34, borderRadius: 99, display: "grid", placeItems: "center", background: near > 0.3 ? n.c : "rgba(255,255,255,0.08)" }}>
              <StatusIcon kind={i} color={near > 0.3 ? "#10144a" : n.c} />
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "pre", lineHeight: 1.15 }}>{n.l}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: HX, top: HY, translate: "-50% -50%", textAlign: "center", color: "#fff", whiteSpace: "nowrap", opacity: center * (1 - stamp * 0.85), fontFamily: FONT, scale: String(0.9 + 0.1 * center) }}>
        <div style={{ fontSize: 18, color: MUTED, fontWeight: 650 }}>на согласовании</div>
        <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1.02, fontVariantNumeric: "tabular-nums" }}>{day}</div>
        <div style={{ fontSize: 20, color: MUTED, fontWeight: 650 }}>дней</div>
        <div style={{ marginTop: 10, display: "inline-block", padding: "5px 12px", borderRadius: 99, background: lap > 1 ? "rgba(253,132,49,0.2)" : "rgba(255,255,255,0.08)", color: lap > 1 ? C.orange : MUTED, fontSize: 16, fontWeight: 800 }}>круг {lap}</div>
      </div>
      {stamp > 0 && out < 1 && (
        <div style={{ position: "absolute", left: HX, top: HY, translate: "-50% -50%", rotate: `${-10 + (1 - stamp) * -12}deg`, scale: String((2.3 - 1.3 * stamp) * (1 - out)), opacity: stamp, padding: "13px 26px", borderRadius: 14, background: "#ff5a6e", color: "#fff", fontSize: 38, zIndex: 5, fontWeight: 900, letterSpacing: "0.04em", fontFamily: FONT, boxShadow: "0 0 60px rgba(255,90,110,0.45)" }}>АННУЛИРОВАНА</div>
      )}
    </>
  );
};

/* ---------- 05 · the ring folds into a sheet; the sheet is copied three times ---------- */
const DOC_W = 260;
const DOC_H = 330;
const DOC_Y = HY - 40 - DOC_H / 2;
const DOCS = [
  { d: "УПД № 418", name: "Радиатор биметалл. 10 с.", q: "100", dx: -290, rot: -3 },
  { d: "ТТН № 77", name: "Радиатор БМ 10 секций", q: "100", dx: 0, rot: 0 },
  { d: "М-15 № 12", name: "Радиатор 10-секц.", q: "98", dx: 290, rot: 3, bad: true },
];

const Retype: React.FC = () => {
  const s = useSec();
  const t = P[4];
  const o4 = O[3];
  const o = O[4];
  if (s < o4 + 0.15 || s > o + 1.15) return null;
  // ring → sheet
  const fold = tw(s, [o4 + 0.15, o4 + 0.85], [0, 1], INOUT);
  const ringR: R = { x: HX - RING_R, y: HY - RING_R, w: RING_R * 2, h: RING_R * 2, r: RING_R };
  const sheet: R = { x: HX - DOC_W / 2, y: DOC_Y, w: DOC_W, h: DOC_H, r: 12 };
  const split = tw(s, [t + 0.4, t + 0.95], [0, 1], EXPO);
  const merge = tw(s, [o, o + 0.4], [0, 1], INOUT);
  const lines = tw(s, [t + 0.3, t + 0.7], [0, 1]);
  const ask = Math.max(0, pop(s, t + 3.0, 0.5)) * (1 - tw(s, [o, o + 0.2], [0, 1], IN));
  if (fold < 1) {
    const r = lerpR(ringR, sheet, fold);
    const fill = tw(fold, [0.15, 0.85], [0, 1]);
    return (
      <div style={{ ...at(r), boxSizing: "border-box", border: `${lerp(6, 0, fill)}px solid ${mix("#ff5a6e", "#F6F4EE", fill)}`, background: `rgba(246,244,238,${fill})`, boxShadow: fill > 0.5 ? "0 30px 60px -20px rgba(0,0,0,0.7)" : undefined }} />
    );
  }
  // the merged sheet shrinks into one lit window and drops into the waking city
  const shrink = tw(s, [o + 0.3, o + 0.65], [0, 1], INOUT);
  const fall = tw(s, [o + 0.6, o + 0.95], [0, 1], IN);
  return (
    <>
      {DOCS.map((doc, i) => {
        const dx = doc.dx * split * (1 - merge);
        const at0 = t + 0.95 + i * 0.25;
        const n = Math.round(tw(s, [at0, at0 + 1.0], [0, doc.name.length], (x) => x));
        const typed = doc.name.slice(0, n);
        const done = n >= doc.name.length;
        if (i !== 1 && (split <= 0 || merge >= 1)) return null;
        const win: R = { x: HX - 13, y: DOC_Y + DOC_H / 2 - 18, w: 26, h: 36, r: 3 };
        const r = i === 1 && shrink > 0 ? lerpR(sheet, win, shrink) : { ...sheet, x: sheet.x + dx };
        const warm = i === 1 ? shrink : 0;
        return (
          <div key={doc.d} style={{ ...at(r), rotate: `${doc.rot * split * (1 - merge)}deg`, background: warm > 0 ? mix("#F6F4EE", "#FFB25E", warm) : PAPER, boxShadow: warm > 0.3 ? `0 0 ${60 * warm}px ${20 * warm}px rgba(255,170,80,${0.6 * warm})` : "0 30px 60px -20px rgba(0,0,0,0.7)", overflow: "hidden", translate: `0 ${fall * 330}px`, opacity: 1 - tw(fall, [0.6, 1], [0, 1]), zIndex: i === 1 ? 3 : 1, fontFamily: FONT }}>
            <div style={{ position: "absolute", left: 20, top: 20, width: DOC_W - 40, color: "#1c1f33", opacity: lines * (1 - tw(s, [o, o + 0.25], [0, 1])) }}>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.04em" }}>{doc.d}</div>
              <div style={{ height: 2, background: "#1c1f33", opacity: 0.15, margin: "10px 0 14px" }} />
              <div style={{ fontSize: 13, color: "#6b6d85" }}>Наименование</div>
              <div style={{ fontSize: 19, fontWeight: 700, minHeight: 52, marginTop: 4, color: done ? "#c42a40" : "#1c1f33" }}>
                {typed}
                {!done && s > at0 && <span style={{ display: "inline-block", width: 2, height: 20, background: "#1c1f33", marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 4) % 2 }} />}
              </div>
              <div style={{ fontSize: 13, color: "#6b6d85", marginTop: 10 }}>Количество</div>
              <div style={{ fontSize: 34, fontWeight: 900, minHeight: 42, color: doc.bad && done ? "#c42a40" : "#1c1f33" }}>{done ? doc.q : ""}</div>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ height: 7, borderRadius: 9, background: "#1c1f33", opacity: 0.08, marginTop: 12, width: `${80 - j * 20}%` }} />
              ))}
            </div>
          </div>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {DOCS.map((doc, i) => (
          <path key={i} d={`M ${HX + doc.dx} ${DOC_Y + DOC_H + 6} Q ${HX + doc.dx * 0.5} ${DOC_Y + DOC_H + 90} ${HX} ${DOC_Y + DOC_H + 132}`} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="7 9" opacity={tw(s, [t + 2.6 + i * 0.1, t + 3.0], [0, 0.9]) * (1 - tw(s, [o, o + 0.2], [0, 1]))} />
        ))}
      </svg>
      {ask > 0 && (
        <div style={{ position: "absolute", left: HX, top: DOC_Y + DOC_H + 160, translate: "-50% -50%", scale: String(ask), padding: "16px 28px", borderRadius: 99, background: C.orange, color: "#1d0b00", fontFamily: FONT, fontSize: 28, fontWeight: 900, whiteSpace: "nowrap", boxShadow: "0 0 50px rgba(253,132,49,0.45)" }}>Это одна позиция?</div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ the scene */

export const Now4: React.FC = () => {
  const s = useSec();
  const intro = NOW4.intro;
  const dock = tw(s, [P[0] - 0.3, P[0] + 0.4], [0, 1], INOUT);
  const hudOut = tw(s, [NOW4.end - 0.3, NOW4.end + 0.2], [0, 1], IN);
  // which problem we're on, for the light behind the hero
  const w = (i: number) => tw(s, [i === 0 ? P[0] - 0.4 : O[i - 1] + 0.2, (i === 0 ? P[0] - 0.4 : O[i - 1] + 0.2) + 0.7], [0, 1], INOUT) * (i < 4 ? 1 - tw(s, [O[i] + 0.2, O[i] + 0.9], [0, 1], INOUT) : 1 - hudOut);
  const fail = tw(s, [P[3] + 3.05, P[3] + 3.4], [0, 1]) * (1 - tw(s, [O[3], O[3] + 0.6], [0, 1]));
  const GLOW = ["90,120,255", "253,132,49", "255,190,120", "120,140,255", "253,150,70"];
  const intro2 = tw(s, [intro, intro + 0.9], [0, 1], EXPO);
  const fontSize = 92 + (24 - 92) * dock;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* light behind the hero object — it changes colour with the story */}
      {GLOW.map((g, i) => {
        const k = w(i);
        return k > 0 ? <div key={i} style={{ position: "absolute", left: HX - 620, top: HY - 480, width: 1240, height: 960, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${g},0.2), rgba(${g},0))`, opacity: k }} /> : null;
      })}
      {fail > 0 && <div style={{ position: "absolute", left: HX - 620, top: HY - 480, width: 1240, height: 960, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,80,100,0.26), rgba(255,80,100,0))", opacity: fail }} />}

      {/* title: rises out of a mask, then docks top-left */}
      <div style={{ position: "absolute", left: 960 + (96 - 960) * dock, top: 470 + (74 - 470) * dock, translate: `${-50 * (1 - dock)}% 0`, fontSize, fontWeight: 800 - dock * 150, letterSpacing: "-0.03em", color: "#fff", whiteSpace: "nowrap", opacity: 1 - hudOut, display: "flex", gap: fontSize * 0.26 }}>
        {["Как", "это", "работает", "сейчас"].map((wd, i) => (
          <span key={wd} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
            <span style={{ display: "inline-block", translate: `0 ${(1 - tw(s, [intro + i * 0.07, intro + i * 0.07 + 0.8], [0, 1], EXPO)) * 110}%`, color: i === 3 ? C.orange : "#fff" }}>{wd}</span>
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 96, top: 118, display: "flex", gap: 8, opacity: dock * (1 - hudOut) * intro2 }}>
        {P.map((t, i) => (
          <div key={i} style={{ width: 58, height: 5, borderRadius: 9, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
            <div style={{ width: `${tw(s, [t, (P[i + 1] ?? NOW4.end) - 0.1], [0, 100], (x) => x)}%`, height: 5, background: C.orange }} />
          </div>
        ))}
      </div>

      {/* the text column */}
      <div style={{ position: "absolute", left: 96, top: 318, width: 720 }}>
        <Counter />
        <div style={{ height: 18 }} />
        <div style={{ position: "relative", height: 170 }}>
          {TEXT.map((x, i) =>
            s > P[i] - 0.3 && s < O[i] + 0.7 ? (
              <div key={i} style={{ position: "absolute", left: 0, top: 0 }}>
                <MaskLines lines={x.t} inAt={P[i] - 0.05} outAt={O[i]} size={66} weight={800} color="#fff" />
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

      {/* the hero object */}
      <Road />
      <Trips />
      <Systems />
      <Requests />
      <Loop />
      <Retype />
    </AbsoluteFill>
  );
};
