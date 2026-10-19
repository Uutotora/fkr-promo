import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useFilmSec, useSec } from "../lib";
import { BEACON, nearToScreen } from "./Moscow12";
import { AMB, to5 } from "./pace";

/* v12 · «Как это работает сейчас» — the seven problems of the roadmap deck (slide 2), in the art
   direction of v9: glass in space, huge numbers, light instead of lines. One object keeps changing
   form: four sources typed by hand → one request typed twice → a point of light on a route (trips
   from three tables) → the delivery opens into three documents → they become the three systems of
   a loop → the loop folds into paper → ≈20 documents → one report with doubled rows → a lit window.
   Story clock s12 (8.0 → 42.6); the window lands in the city at BEACON_AT12. */

export const NOW7 = { intro: 8.1, p: [9.0, 13.8, 18.6, 23.4, 28.2, 33.0, 37.8], end: 42.6 };
export const BEACON_AT12 = 43.1;
const P = NOW7.p;
const O = [...P.slice(1).map((p) => p - 0.45), NOW7.end - 0.45];

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
const NUM: React.CSSProperties = { fontFamily: FONT, fontWeight: 800, letterSpacing: "-0.045em", fontVariantNumeric: "tabular-nums", lineHeight: 1, color: WHITE };

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
  for (let i = 0; i < 6; i++) v += tw(s, [O[i] + 0.1, O[i] + 0.65], [0, 1], INOUT);
  const out = tw(s, [O[6], O[6] + 0.4], [0, 1], (x) => x * x);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: FONT, fontWeight: 800, fontVariantNumeric: "tabular-nums", height: 40 }}>
      <div style={{ height: 40, overflow: "hidden", fontSize: 30, color: ORANGE }}>
        <div style={{ translate: `0 ${(1 - k0) * 40 - v * 40 - out * 40}px` }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n} style={{ height: 40, lineHeight: "40px" }}>0{n}</div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.38)", opacity: k0 * (1 - out) }}>/ 07</div>
    </div>
  );
};

/** Roadmap deck, slide 2: one stage of the programme per problem. Numbers only where the deck gives them. */
const TEXT = [
  { st: "Программа ремонта", t: ["Данные о домах", "переносят вручную"], d: ["ТЭП из техпаспортов БТИ — в Excel,", "решения собственников — в план"] },
  { st: "Заявки на материалы", t: ["Одну заявку", "вводят дважды"], d: ["Из ИС РСКР — заново в 1С, номенклатуру", "переводят по справочникам вручную"] },
  { st: "Планирование поставок", t: ["Поставки —", "в разных таблицах"], d: ["Даты и объёмы согласуют", "в отдельных электронных таблицах"] },
  { st: "Приёмка материалов", t: ["У материала —", "три названия"], d: ["УПД и ТТН сверяют вручную,", "факт поставки — обзвоном подрядчиков"] },
  { st: "Остатки материалов", t: ["Остатки сверяют", "в трёх системах"], d: ["МОС ЭДО, Контур.Диадок, ИС РСКР;", "возвраты не связаны с бухучётом"] },
  { st: "Приёмка работ", t: ["Документы к приёмке —", "вручную"], d: ["Исполнительная документация:", "около 20 типовых документов на объект"] },
  { st: "Контроль программы", t: ["Отчёт завышает", "поставки"], d: ["Из-за повторов строк — 7,76 млрд ₽", "вместо фактических 6,1 млрд ₽"] },
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

/* ---------- 01 · four sources, every value typed again by hand ---------- */
const TILES = [
  { name: "Техпаспорт БТИ", dot: "#7EA2FF", v: "9 850", u: "м²", typed: false, at: { x: -198, y: -122, z: 50 } },
  { name: "Протокол ОСС", dot: "#B79CFF", v: "Кровля", u: "", typed: false, at: { x: 198, y: -122, z: -60 } },
  { name: "Excel", dot: "#33B36B", v: "9 850", u: "м²", typed: true, at: { x: -198, y: 128, z: -25 } },
  { name: "План контрактации", dot: "#F6C744", v: "Кровля", u: "", typed: true, at: { x: 198, y: 128, z: 85 } },
];
const SHEET: B3 = { x: 0, y: -10, z: 0, w: 640, h: 340, r: 32 };
const Q1 = "Откуда данные о доме?";

const Sources: React.FC = () => {
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
        // sources show their value; the copies are typed again, letter by letter, by a person
        const ta = t + 1.55 + (i - 2) * 0.55;
        const n = x.typed ? Math.round(tw(s, [ta, ta + 0.85], [0, x.v.length], (q) => q)) : x.v.length;
        const shown = x.typed ? x.v.slice(0, n) : tw(s, [t + 1.0 + i * 0.12, t + 1.4 + i * 0.12], [0, 1]) > 0.5 ? x.v : "";
        const typing = x.typed && s > ta - 0.2 && n < x.v.length;
        const hand = x.typed ? tw(s, [ta + 0.85, ta + 1.2], [0, 1], EXPO) : 0;
        const drift = Math.sin(s * 0.9 + i * 1.7) * 6;
        const fs = x.v.length > 5 ? 72 : 88;
        return (
          <div key={i} style={{ ...slab({ ...bb, y: bb.y + drift * (1 - m) }), ...glass(), opacity: op, overflow: "hidden" }}>
            <Sheen at={t + 1.1 + i * 0.12} />
            <div style={{ position: "absolute", left: 28, top: 24, right: 24, bottom: 22, opacity: 1 - fade, display: "flex", flexDirection: "column", fontFamily: FONT }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 650, color: "rgba(255,255,255,0.82)", whiteSpace: "nowrap" }}>
                <span style={{ width: 10, height: 10, borderRadius: 9, background: x.dot, boxShadow: `0 0 14px ${x.dot}`, flex: "none" }} />
                {x.name}
              </div>
              <div style={{ marginTop: 8, height: 18, fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", color: ORANGE, opacity: hand }}>{x.typed ? "ВВЕДЕНО ВРУЧНУЮ" : ""}</div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, whiteSpace: "nowrap" }}>
                <span style={{ ...NUM, fontSize: fs }}>{shown}</span>
                {typing && <span style={{ display: "inline-block", width: 4, height: fs * 0.72, background: ORANGE, borderRadius: 2, alignSelf: "center", opacity: Math.floor(s * 5) % 2 ? 1 : 0.35 }} />}
                {x.u && shown.length === x.v.length && <span style={{ fontFamily: FONT, fontSize: 22, color: MUTED }}>{x.u}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ---------- 02 · one request, typed twice: ИС РСКР, then again in 1С ---------- */
const REQ_ARR = [O[0] + 0.72, P[1] + 1.45];
const SYS = ["ИС РСКР", "1С"];
const NAMES = ["Радиатор биметалл. 10 с.", "Радиатор БМ 10 секций"];

const SheetFace: React.FC<{ v: number; roll: number; ghost?: boolean }> = ({ v, roll, ghost }) => (
  <div style={{ position: "absolute", inset: 0, padding: "28px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: FONT }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontSize: 23, fontWeight: 700, color: WHITE }}>Заявка З-2026-0188</div>
        <div style={{ fontSize: 18, color: MUTED, marginTop: 4 }}>ул. Нагорная, 20 к4 · отопление</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ height: 38, overflow: "hidden", padding: "0 16px", borderRadius: 11, background: ghost ? "rgba(255,255,255,0.10)" : "rgba(253,132,49,0.18)", color: ghost ? "rgba(255,255,255,0.75)" : ORANGE, fontSize: 19, fontWeight: 800 }}>
        <div style={{ translate: `0 ${-(ghost ? v : roll) * 38}px` }}>
          {SYS.map((x) => (
            <div key={x} style={{ height: 38, lineHeight: "38px", whiteSpace: "nowrap" }}>{x}</div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ position: "relative", height: 34, overflow: "hidden", fontSize: 25, fontWeight: 650, color: "rgba(255,255,255,0.9)" }}>
      <div style={{ translate: `0 ${-(ghost ? v : roll) * 34}px` }}>
        {NAMES.map((q) => (
          <div key={q} style={{ height: 34, lineHeight: "34px", whiteSpace: "nowrap" }}>{q}</div>
        ))}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
      <div style={{ ...NUM, fontSize: 120, lineHeight: "130px" }}>10</div>
      <span style={{ fontSize: 38, fontWeight: 700, color: MUTED }}>шт.</span>
    </div>
  </div>
);

const CHECKS = ["заявка в ИС РСКР", "та же заявка — заново в 1С", "номенклатура — по справочнику"];
const CHECK_AT = [P[1] + 0.9, P[1] + 2.0, P[1] + 2.95];
/** Route of the trips (03) — the request becomes a point of light at its start. */
const RA = { x: 1000, y: 640 };
const RB = { x: 1680, y: 640 };

const Requests: React.FC = () => {
  const s = useSec();
  const o = O[1];
  if (s < REQ_ARR[0] - 0.02 || s > o + 0.85) return null;
  const roll = tw(s, [REQ_ARR[1] + 0.1, REQ_ARR[1] + 0.65], [0, 1], INOUT);
  const faceIn = tw(s, [REQ_ARR[0], REQ_ARR[0] + 0.35], [0, 1]);
  const drop = tw(s, [o, o + 0.3], [0, 1], IN);
  const shrink = tw(s, [o + 0.12, o + 0.8], [0, 1], INOUT);
  const faceOut = tw(s, [o, o + 0.2], [0, 1]);
  const sx = lerp(HX + SHEET.x, RA.x, shrink);
  const sy = lerp(GY + SHEET.y, RA.y, shrink);
  const sw = lerp(SHEET.w, 18, shrink);
  const sh = lerp(SHEET.h, 18, shrink);
  const glow = tw(shrink, [0.65, 1], [0, 1]);
  const d = tw(s, [REQ_ARR[1], REQ_ARR[1] + 0.7], [0, 1], EXPO);
  return (
    <>
      <Space>
        {/* the first entry (ИС РСКР) is pushed back into depth: the same request now lives twice */}
        {d > 0 && (
          <div style={{ ...slab({ ...SHEET, x: SHEET.x - 190 * d, y: SHEET.y - 150 * d, z: -320 * d }), ...glass(0.7), opacity: 0.55 * (1 - drop), overflow: "hidden", filter: `blur(${2.2 * d}px)` }}>
            <div style={{ opacity: 0.85 }}>
              <SheetFace v={0} roll={0} ghost />
            </div>
          </div>
        )}
        {shrink === 0 && (
          <div style={{ ...slab(SHEET), ...solidGlass, overflow: "hidden" }}>
            <Sheen at={REQ_ARR[0] + 0.1} />
            <Sheen at={REQ_ARR[1] + 0.2} />
            <div style={{ opacity: faceIn * (1 - faceOut) }}>
              <SheetFace v={1} roll={roll} />
            </div>
          </div>
        )}
        {CHECKS.map((c, i) => {
          const k = tw(s, [CHECK_AT[i] - 0.25, CHECK_AT[i] + 0.2], [0, 1], EXPO) * (1 - drop);
          const draw = tw(s, [CHECK_AT[i], CHECK_AT[i] + 0.45], [0, 1], INOUT);
          return (
            <div key={c} style={{ position: "absolute", left: -300, top: 190 + i * 46, width: 600, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontSize: 22, fontWeight: 600, color: draw >= 1 ? WHITE : MUTED, opacity: k, transform: "translateZ(0px)" }}>
              <svg width={26} height={26} viewBox="0 0 26 26" style={{ overflow: "visible" }}>
                <path d="M3 14 L10 20 L23 5" fill="none" stroke={ORANGE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: "drop-shadow(0 0 6px rgba(253,132,49,0.7))" }} />
              </svg>
              {c}
              <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 800, letterSpacing: "0.12em", color: ORANGE, opacity: tw(s, [CHECK_AT[i] + 0.4, CHECK_AT[i] + 0.7], [0, 1]) }}>ВРУЧНУЮ</span>
            </div>
          );
        })}
      </Space>
      {shrink > 0 && (
        <div style={{ position: "absolute", left: sx - sw / 2, top: sy - sh / 2, width: sw, height: sh, borderRadius: lerp(30, 9, shrink), ...glass(1 - glow), background: glow > 0 ? `rgba(253,132,49,${glow})` : glass().background, boxShadow: `0 0 ${50 * glow}px ${14 * glow}px rgba(253,132,49,${0.55 * glow})`, overflow: "hidden" }}>
          <div style={{ opacity: 1 - faceOut }}>
            <SheetFace v={1} roll={roll} />
          </div>
        </div>
      )}
    </>
  );
};
/* ---------- 03 · three tables, three dates — and the trips they cause ---------- */
const TRIPS = [
  { a: P[2] + 1.0, b: P[2] + 1.9, from: RA, to: RB, bow: -110 },
  { a: P[2] + 2.3, b: P[2] + 3.1, from: RB, to: RA, bow: -180 },
  { a: P[2] + 3.3, b: P[2] + 4.1, from: RA, to: RB, bow: -250 },
];
const TABLES = [
  { l: "Таблица УРО", d: "20.10" },
  { l: "Таблица подрядчика", d: "22.10" },
  { l: "Таблица поставщика", d: "24.10" },
];
const quad = (A: { x: number; y: number }, Bp: { x: number; y: number }, bow: number, u: number) => {
  const cx = (A.x + Bp.x) / 2;
  const cy = A.y + 2 * bow;
  return { x: (1 - u) ** 2 * A.x + 2 * (1 - u) * u * cx + u * u * Bp.x, y: (1 - u) ** 2 * A.y + 2 * (1 - u) * u * cy + u * u * Bp.y };
};

/** A small glass spreadsheet: a label, a grid, one date in the highlighted cell. */
const MiniTable: React.FC<{ l: string; d: string; k: number; hot: number }> = ({ l, d, k, hot }) => (
  <div style={{ width: 196, padding: "14px 16px 16px", borderRadius: 18, ...glass(1), opacity: k, translate: `0 ${(1 - k) * 24}px`, fontFamily: FONT, boxShadow: hot > 0 ? `0 0 ${36 * hot}px rgba(253,132,49,${0.35 * hot}), 0 40px 70px -40px rgba(0,0,0,0.8)` : undefined }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 650, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#33B36B" }} />
      {l}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 12 }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ height: 22, borderRadius: 5, background: i === 4 ? `rgba(253,132,49,${0.25 + 0.5 * hot})` : "rgba(255,255,255,0.07)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: WHITE }}>
          {i === 4 ? d : ""}
        </div>
      ))}
    </div>
  </div>
);

const Trips: React.FC = () => {
  const s = useSec();
  const t = P[2];
  const o = O[2];
  if (s < O[1] + 0.5 || s > o + 0.9) return null;
  const out = tw(s, [o, o + 0.3], [0, 1], IN);
  const map = tw(s, [t - 0.2, t + 0.8], [0, 1]) * (1 - out);
  const ends = tw(s, [t + 0.1, t + 0.6], [0, 1], EXPO) * (1 - out);
  const trip = s >= TRIPS[2].a ? 3 : s >= TRIPS[1].a ? 2 : 1;
  const counter = tw(s, [t + 0.9, t + 1.4], [0, 1], EXPO) * (1 - out);
  const notReady = tw(s, [t + 1.95, t + 2.35], [0, 1], EXPO) * (1 - tw(s, [TRIPS[1].a + 0.4, TRIPS[1].a + 0.7], [0, 1])) * (1 - out);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="mapFade7" cx="50%" cy="55%" r="55%">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="mapMask7">
            <rect x={860} y={200} width={960} height={620} fill="url(#mapFade7)" />
          </mask>
          <filter id="arcGlow7" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g mask="url(#mapMask7)" opacity={map * 0.9} stroke="rgba(170,185,255,0.09)" strokeWidth={1.5} fill="none">
          {["M860 380 L1820 320", "M860 520 L1820 550", "M860 750 L1820 720", "M960 200 L1010 820", "M1180 200 L1150 820", "M1420 200 L1460 820", "M1640 200 L1610 820", "M900 260 L1300 820", "M1500 220 L1820 600"].map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <line x1={RA.x} y1={RA.y} x2={RB.x} y2={RB.y} stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" opacity={ends} />
        {TRIPS.map((tr, i) => {
          const u = tw(s, [tr.a, tr.b], [0, 1], INOUT);
          if (u <= 0) return null;
          const pts = Array.from({ length: 49 }, (_, j) => quad(tr.from, tr.to, tr.bow, (j / 48) * u));
          const d = "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L");
          const settled = s > tr.b ? 0.5 : 1;
          return <path key={i} d={d} fill="none" stroke={i === 0 ? "rgba(255,255,255,0.7)" : ORANGE} strokeWidth={3} strokeLinecap="round" opacity={settled * (1 - out)} filter="url(#arcGlow7)" />;
        })}
      </svg>
      {[
        { p: RA, l: "Склад", sub: "поставщика" },
        { p: RB, l: "Объект", sub: "ул. Нагорная, 20 к4" },
      ].map((e) => (
        <div key={e.l} style={{ position: "absolute", left: e.p.x, top: e.p.y, opacity: ends, fontFamily: FONT }}>
          <div style={{ position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: 9, background: WHITE, boxShadow: "0 0 18px rgba(255,255,255,0.7)" }} />
          <div style={{ position: "absolute", left: 0, top: 26, translate: "-50% 0", textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: WHITE }}>{e.l}</div>
            <div style={{ fontSize: 17, color: MUTED, marginTop: 3 }}>{e.sub}</div>
          </div>
        </div>
      ))}
      {/* three tables, three different dates for the same delivery */}
      <div style={{ position: "absolute", left: HX, top: 760, translate: "-50% 0", display: "flex", gap: 22 }}>
        {TABLES.map((x, i) => {
          const k = tw(s, [t + 0.35 + i * 0.16, t + 1.0 + i * 0.16], [0, 1], EXPO) * (1 - out);
          const hot = TRIPS[i] ? tw(s, [TRIPS[i].a - 0.1, TRIPS[i].a + 0.2], [0, 1]) * (1 - tw(s, [TRIPS[i].b, TRIPS[i].b + 0.4], [0, 0.6])) : 0;
          return <MiniTable key={x.l} l={x.l} d={x.d} k={k} hot={hot} />;
        })}
      </div>
      {(() => {
        let pos = RA;
        TRIPS.forEach((tr) => {
          if (s >= tr.a) pos = quad(tr.from, tr.to, tr.bow, tw(s, [tr.a, tr.b], [0, 1], INOUT));
        });
        if (s > o) return null; // from here the light becomes the delivery's documents (04)
        return <div style={{ position: "absolute", left: pos.x - 9, top: pos.y - 9, width: 18, height: 18, borderRadius: 9, background: ORANGE, boxShadow: "0 0 30px 10px rgba(253,132,49,0.55)" }} />;
      })()}
      <div style={{ position: "absolute", left: RB.x, top: RB.y - 64, translate: "-50% -100%", opacity: notReady, fontFamily: FONT, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10, fontSize: 21, fontWeight: 750, color: RED }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: RED, boxShadow: `0 0 12px ${RED}` }} />
        объект ещё не готов
      </div>
      <div style={{ position: "absolute", left: 1000, top: 230, opacity: counter, display: "flex", alignItems: "baseline", gap: 14, fontFamily: FONT }}>
        <div style={{ height: 130, overflow: "hidden" }}>
          <div style={{ translate: `0 ${-(tw(s, [TRIPS[1].a, TRIPS[1].a + 0.4], [0, 1], INOUT) + tw(s, [TRIPS[2].a, TRIPS[2].a + 0.4], [0, 1], INOUT)) * 130}px` }}>
            {["1", "2", "3"].map((n, i) => (
              <div key={n} style={{ ...NUM, fontSize: 116, height: 130, lineHeight: "130px", color: i > 0 ? ORANGE : WHITE }}>{n}</div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 26, color: MUTED, fontWeight: 500 }}>{trip === 1 ? "рейс" : "рейса"}</div>
      </div>
      <Verdict at={t + 3.75} out={o} x={RB.x - 120} y={300}>
        +2 лишних рейса
      </Verdict>
    </>
  );
};

/* ---------- 04 · the delivery opens into its documents: one radiator, three spellings ---------- */
const DOC_W = 250;
const DOC_H = 320;
const DOC_Y = GY - 30;
const DOCS = [
  { d: "УПД", n: "№ 418", by: "поставщик", name: "Радиатор биметалл. 10 с.", q: "100", dx: -275, ry: 24 },
  { d: "ТТН", n: "№ 77", by: "завод", name: "Радиатор БМ 10 секций", q: "100", dx: 0, ry: 0 },
  { d: "М-15", n: "№ 12", by: "Фонд", name: "Радиатор 10-секц.", q: "98", dx: 275, ry: -24, bad: true },
];

const Paper: React.FC<{ doc: (typeof DOCS)[number]; s: number; t: number; lines: number }> = ({ doc, s, t, lines }) => {
  const i = DOCS.indexOf(doc);
  const at0 = t + 1.0 + i * 0.3;
  const n = Math.round(tw(s, [at0, at0 + 1.0], [0, doc.name.length], (x) => x));
  const done = n >= doc.name.length;
  const mark = tw(s, [t + 2.55 + i * 0.12, t + 2.95 + i * 0.12], [0, 1], INOUT);
  return (
    <div style={{ position: "absolute", left: 22, top: 22, width: DOC_W - 44, color: "#1c1f33", opacity: lines }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 23, fontWeight: 850, letterSpacing: "0.04em" }}>{doc.d}</span>
        <span style={{ fontSize: 15, color: "#8a8ca0" }}>{doc.n}</span>
        <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#8a8ca0" }}>{doc.by}</span>
      </div>
      <div style={{ height: 1.5, background: "#1c1f33", opacity: 0.12, margin: "14px 0 18px" }} />
      <div style={{ position: "relative", fontSize: 19, fontWeight: 700, lineHeight: 1.3, minHeight: 50 }}>
        <span style={{ position: "absolute", left: -4, right: -4, top: 2, bottom: 2, borderRadius: 4, background: "rgba(253,132,49,0.35)", transformOrigin: "0 50%", scale: `${mark} 1` }} />
        <span style={{ position: "relative" }}>
          {doc.name.slice(0, n)}
          {!done && s > at0 && <span style={{ display: "inline-block", width: 2, height: 20, background: "#1c1f33", marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 4) % 2 }} />}
        </span>
      </div>
      <div style={{ marginTop: 20, ...NUM, fontSize: 46, color: doc.bad && done ? "#D0344B" : "#1c1f33" }}>{done ? doc.q : ""}</div>
      {[0, 1].map((j) => (
        <div key={j} style={{ height: 6, borderRadius: 9, background: "#1c1f33", opacity: 0.07, marginTop: 14, width: `${78 - j * 24}%` }} />
      ))}
    </div>
  );
};

/** Ring geometry (05): the three documents become its three nodes. */
const LY = 500;
const RING_R = 190;
const NODES = [
  { l: "МОС ЭДО", a: -90 },
  { l: "Контур.Диадок", a: 30 },
  { l: "ИС РСКР", a: 150 },
];
const ringPos = (deg: number, r = RING_R) => ({ x: HX + Math.cos((deg * Math.PI) / 180) * r, y: LY + Math.sin((deg * Math.PI) / 180) * r });

const Delivery: React.FC = () => {
  const s = useSec();
  const t = P[3];
  const o3 = O[2];
  const o = O[3];
  if (s < o3 - 0.02 || s > o + 0.9) return null;
  const born = tw(s, [o3, o3 + 0.75], [0, 1], INOUT);
  const split = tw(s, [t + 0.35, t + 0.95], [0, 1], EXPO);
  const lines = tw(s, [t + 0.2, t + 0.6], [0, 1]) * (1 - tw(s, [o, o + 0.2], [0, 1]));
  const toRing = tw(s, [o + 0.1, o + 0.8], [0, 1], INOUT);
  const call = tw(s, [t + 2.0, t + 2.5], [0, 1], EXPO) * (1 - tw(s, [o, o + 0.25], [0, 1], IN));
  return (
    <>
      {DOCS.map((doc, i) => {
        if (i !== 1 && split <= 0) return null;
        const k = split;
        // born: the point of light at the object grows into the middle sheet
        const bw = i === 1 ? lerp(18, DOC_W, born) : DOC_W;
        const bh = i === 1 ? lerp(18, DOC_H, born) : DOC_H;
        let cx = i === 1 ? lerp(RB.x, HX, born) : HX + doc.dx * k;
        let cy = i === 1 ? lerp(RB.y, DOC_Y, born) : DOC_Y;
        let w = bw, h = bh;
        // to the ring: each sheet shrinks into its node
        const np = ringPos(NODES[i].a);
        if (toRing > 0) {
          cx = lerp(HX + doc.dx * k, np.x, toRing);
          cy = lerp(DOC_Y, np.y, toRing);
          w = lerp(DOC_W, 16, toRing);
          h = lerp(DOC_H, 16, toRing);
        }
        const warm = i === 1 ? 1 - tw(born, [0.2, 0.7], [0, 1]) : 0;
        const dot = tw(toRing, [0.6, 1], [0, 1]);
        return (
          <div key={doc.d} style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: lerp(10, 8, toRing), transform: `perspective(1400px) rotateY(${doc.ry * k * (1 - toRing)}deg) translateZ(${-70 * k * (i === 1 ? 0 : 1) * (1 - toRing)}px)`,
            background: dot > 0 ? `rgba(255,255,255,${0.6 + 0.4 * dot})` : warm > 0 ? `rgb(${Math.round(lerp(245, 253, warm))},${Math.round(lerp(243, 132, warm))},${Math.round(lerp(238, 49, warm))})` : "#F5F3EE",
            boxShadow: dot > 0 ? `0 0 ${24 * dot}px rgba(255,255,255,0.7)` : warm > 0.4 ? `0 0 40px 12px rgba(253,132,49,${0.5 * warm})` : "0 40px 80px -30px rgba(0,0,0,0.8)", overflow: "hidden", zIndex: i === 1 ? 3 : 1, fontFamily: FONT }}>
            {toRing < 0.5 && <div style={{ opacity: 1 - tw(toRing, [0, 0.3], [0, 1]) }}><Paper doc={doc} s={s} t={t} lines={lines} /></div>}
          </div>
        );
      })}
      {/* the fact of delivery is checked by phone */}
      <div style={{ position: "absolute", left: HX, top: DOC_Y - DOC_H / 2 - 84, translate: "-50% 0", opacity: call, display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 14px", borderRadius: 99, ...glass(1), fontFamily: FONT, whiteSpace: "nowrap" }}>
        <div style={{ position: "relative", width: 40, height: 40, borderRadius: 99, background: "rgba(253,132,49,0.2)", display: "grid", placeItems: "center" }}>
          {[0, 1].map((j) => {
            const ph = (s * 1.4 + j * 0.5) % 1;
            return <div key={j} style={{ position: "absolute", inset: 0, borderRadius: 99, background: "rgba(253,132,49,0.35)", scale: String(1 + ph * 1.1), opacity: (1 - ph) * call }} />;
          })}
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
          </svg>
        </div>
        <div style={{ fontSize: 21, fontWeight: 650, color: WHITE }}>«Поставка пришла?» — обзвон подрядчиков</div>
      </div>
      <Verdict at={t + 3.1} out={o} x={HX} y={DOC_Y + DOC_H / 2 + 70}>
        Это одна позиция?
      </Verdict>
    </>
  );
};
/* ---------- 05 · three systems on one loop; the reconciliation never closes ---------- */
const Loop: React.FC = () => {
  const s = useSec();
  const t = P[4];
  const o = O[4];
  if (s < O[3] + 0.5 || s > o + 0.3) return null;
  const ring = tw(s, [O[3] + 0.55, O[3] + 1.0], [0, 1], INOUT);
  const turn = tw(s, [t + 0.6, t + 3.05], [0, 1.6], INOUT);
  const A0 = NODES[0].a;
  const ang = A0 + turn * 360;
  const fail = tw(s, [t + 3.05, t + 3.4], [0, 1], EXPO);
  const out = tw(s, [o, o + 0.25], [0, 1], IN);
  const center = tw(s, [t + 0.25, t + 0.85], [0, 1], EXPO) * (1 - out);
  const pulse = tw(s, [t + 3.15, t + 4.1], [0, 1], OUT);
  const col = fail > 0 ? RED : ORANGE;
  const arc = (a0: number, a1: number) => {
    const p0 = ringPos(a0);
    const p1 = ringPos(a1);
    return `M ${p0.x} ${p0.y} A ${RING_R} ${RING_R} 0 0 1 ${p1.x} ${p1.y}`;
  };
  const SEG = 36;
  const TAIL = 95;
  const circ = 2 * Math.PI * RING_R;
  return (
    <>
      {pulse > 0 && pulse < 1 && <div style={{ position: "absolute", left: HX - 400, top: LY - 400, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,90,110,0.35), rgba(255,90,110,0))", scale: String(0.5 + pulse), opacity: 1 - pulse }} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={HX} cy={LY} r={RING_R} fill="none" stroke={fail > 0 ? `rgba(255,107,126,${0.22 + 0.4 * fail})` : "rgba(255,255,255,0.22)"} strokeWidth={2} strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform={`rotate(-90 ${HX} ${LY})`} opacity={s < o + 0.16 ? 1 : 0} />
        <g opacity={(1 - fail) * (1 - out) * tw(s, [t + 0.45, t + 0.7], [0, 1])} style={{ filter: "drop-shadow(0 0 8px rgba(253,132,49,0.8))" }}>
          {Array.from({ length: SEG }, (_, j) => {
            const a1 = ang - (j * TAIL) / SEG;
            const a0 = ang - ((j + 1) * TAIL) / SEG;
            const k = 1 - j / SEG;
            return <path key={j} d={arc(a0, a1)} fill="none" stroke={col} strokeWidth={1 + 4 * k} strokeLinecap="round" opacity={Math.pow(k, 1.6)} />;
          })}
          <circle cx={ringPos(ang).x} cy={ringPos(ang).y} r={7} fill={WHITE} />
        </g>
        {NODES.map((n) => {
          const p = ringPos(n.a);
          const d = (((ang - n.a) % 360) + 360) % 360;
          const near = turn > 0.02 && fail === 0 ? Math.max(0, 1 - d / 60) : 0;
          return <circle key={n.l} cx={p.x} cy={p.y} r={8 + 4 * near} fill={fail > 0 ? RED : near > 0.3 ? ORANGE : WHITE} opacity={(1 - out) * (s > O[3] + 0.75 ? 1 : 0)} style={{ filter: `drop-shadow(0 0 ${8 + 10 * near}px ${near > 0.3 ? "rgba(253,132,49,0.9)" : "rgba(255,255,255,0.6)"})` }} />;
        })}
      </svg>
      {NODES.map((n, i) => {
        const p = ringPos(n.a, RING_R + 34);
        const d = (((ang - n.a) % 360) + 360) % 360;
        const near = turn > 0.02 && fail === 0 ? Math.max(0, 1 - d / 70) : 0;
        const k = tw(s, [t + 0.15 + i * 0.1, t + 0.65 + i * 0.1], [0, 1], EXPO) * (1 - out);
        const align = n.a === -90 ? "-50% -100%" : n.a === 30 ? "0 0" : "-100% 0";
        return (
          <div key={n.l} style={{ position: "absolute", left: p.x, top: p.y, translate: align, opacity: k, fontFamily: FONT, fontSize: 24, fontWeight: 750, whiteSpace: "nowrap", color: near > 0.35 ? WHITE : "rgba(255,255,255,0.6)", textShadow: near > 0.35 ? "0 0 20px rgba(253,132,49,0.6)" : undefined }}>
            {n.l}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: HX, top: LY, translate: "-50% -50%", textAlign: "center", opacity: center, scale: String(0.94 + 0.06 * center), fontFamily: FONT, whiteSpace: "nowrap" }}>
        <div style={{ ...NUM, fontSize: 128, color: fail > 0 ? RED : WHITE }}>3</div>
        <div style={{ position: "relative", height: 26, marginTop: 8 }}>
          <div style={{ fontSize: 20, color: MUTED, opacity: 1 - fail }}>системы · сверка вручную</div>
          <div style={{ position: "absolute", inset: 0, fontSize: 17, fontWeight: 800, letterSpacing: "0.16em", color: RED, opacity: fail }}>УЧЁТ НЕ СХОДИТСЯ</div>
        </div>
      </div>
    </>
  );
};

/* ---------- 06 · the loop folds into paper; the paper deals ≈20 documents ---------- */
const DOCS20 = ["Акт скрытых работ", "Исполнительная схема", "Общий журнал работ", "Акт М-15", "КС-2", "КС-3", "Отчёт по ДМ", "Сертификаты", "Паспорта качества", "Акт испытаний",
  "Акт освидетельствования", "Ведомость объёмов", "Фотофиксация", "Акт приёмки", "Опись комплекта", "Гарантийный паспорт", "Акт передачи", "Ф-5", "Протокол комиссии", "Справка ТУ"];
const CW = 124, CH = 156, GAP = 14, COLS = 5;
const PILE_Y = GY + 60;
const cell = (j: number) => {
  const c = j % COLS, r = Math.floor(j / COLS);
  return { x: HX - ((COLS - 1) / 2) * (CW + GAP) + c * (CW + GAP), y: PILE_Y - 1.5 * (CH + GAP) + r * (CH + GAP) };
};
/** Report table (07). */
const REP = { w: 760, h: 560 };

const Pile: React.FC = () => {
  const s = useSec();
  const t = P[5];
  const o4 = O[4];
  const o = O[5];
  if (s < o4 + 0.1 || s > o + 0.9) return null;
  const fold = tw(s, [o4 + 0.15, o4 + 0.85], [0, 1], INOUT);
  if (fold < 1) {
    const w = lerp(RING_R * 2, CW, fold);
    const h = lerp(RING_R * 2, CH, fold);
    const fill = tw(fold, [0.15, 0.45], [0, 1]);
    return (
      <div style={{ position: "absolute", left: HX - w / 2, top: lerp(LY, PILE_Y, fold) - h / 2, width: w, height: h, borderRadius: lerp(RING_R, 10, fold), boxSizing: "border-box", border: `${lerp(2, 0, fill)}px solid rgba(255,107,126,${1 - fill})`, background: `rgba(245,243,238,${fill})`, boxShadow: fill > 0.5 ? "0 40px 80px -30px rgba(0,0,0,0.8)" : undefined }} />
    );
  }
  const toRep = tw(s, [o + 0.05, o + 0.75], [0, 1], INOUT);
  const n = Math.min(20, Math.floor(tw(s, [t + 0.35, t + 0.35 + 19 * 0.11 + 0.01], [1, 20.999], (x) => x)));
  return (
    <>
      {DOCS20.map((name, j) => {
        const a = t + 0.35 + j * 0.11;
        const k = j === 0 ? 1 : tw(s, [a, a + 0.5], [0, 1], EXPO);
        if (k <= 0) return null;
        const c = cell(j);
        const from = { x: HX, y: PILE_Y };
        let x = lerp(from.x, c.x, k), y = lerp(from.y, c.y, k) - Math.sin(Math.PI * k) * 30;
        let w = CW, h = CH;
        // into the report: each sheet becomes a row of the table
        if (toRep > 0) {
          const row = j % 6;
          const tx = HX, ty = GY - REP.h / 2 + 150 + row * 52;
          x = lerp(x, tx, toRep); y = lerp(y, ty, toRep);
          w = lerp(CW, REP.w - 60, toRep); h = lerp(CH, 40, toRep);
        }
        const rot = (1 - k) * (j % 2 ? 8 : -8);
        return (
          <div key={name} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 10, background: "#F5F3EE", boxShadow: "0 24px 40px -22px rgba(0,0,0,0.85)", rotate: `${rot}deg`, opacity: toRep > 0 ? 1 - tw(toRep, [0.6, 1], [0, 1]) : 1, overflow: "hidden", fontFamily: FONT }}>
            <div style={{ padding: "14px 12px", opacity: 1 - toRep * 2 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: "#1c1f33", lineHeight: 1.2, height: 36 }}>{name}</div>
              {[0, 1, 2, 3].map((q) => (
                <div key={q} style={{ height: 5, borderRadius: 9, background: "#1c1f33", opacity: 0.08, marginTop: 10, width: `${86 - q * 14}%` }} />
              ))}
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 10, bottom: 10 }}>
                <path d="M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </div>
          </div>
        );
      })}
      {/* the count, above the pile */}
      <div style={{ position: "absolute", left: HX, top: cell(0).y - CH / 2 - 26, translate: "-50% -100%", display: "flex", alignItems: "baseline", gap: 12, fontFamily: FONT, whiteSpace: "nowrap", opacity: tw(s, [t + 0.5, t + 0.9], [0, 1]) * (1 - tw(s, [o, o + 0.25], [0, 1])) }}>
        <div style={{ ...NUM, fontSize: 84, color: n >= 20 ? ORANGE : WHITE }}>{n}</div>
        <div style={{ fontSize: 24, color: MUTED }}>{n % 10 === 1 && n !== 11 ? "документ" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "документа" : "документов"}</div>
      </div>
      <Verdict at={t + 3.1} out={o} x={HX} y={PILE_Y + 2 * (CH + GAP) + 44}>
        Около 20 документов на каждый объект
      </Verdict>
    </>
  );
};

/* ---------- 07 · one report: doubled rows inflate the total ---------- */
const ROWS = [
  { a: "ул. Нагорная, 20 к4", m: "Радиатор биметаллический", q: "100 шт." },
  { a: "ул. Косыгина, д. 65", m: "Краны латунные шаровые", q: "182 шт.", dup: false },
  { a: "ул. Косыгина, д. 65", m: "Краны латунные шаровые", q: "182 шт.", dup: true },
  { a: "Октябрьский пр-т, д. 61", m: "Плиты теплоизоляционные", q: "154 м²" },
  { a: "Октябрьский пр-т, д. 61", m: "Плиты теплоизоляционные", q: "154 м²", dup: true },
  { a: "Варшавское ш., д. 76", m: "Краска фасадная", q: "794 кг" },
];

const Report: React.FC = () => {
  const s = useSec();
  const film = AMB * useFilmSec();
  const t = P[6];
  const o5 = O[5];
  const o = O[6];
  if (s < o5 + 0.3 || s > BEACON_AT12 + 0.2) return null;
  const k = tw(s, [o5 + 0.35, o5 + 0.9], [0, 1], EXPO);
  const rows = (i: number) => tw(s, [o5 + 0.6 + i * 0.07, o5 + 1.0 + i * 0.07], [0, 1], EXPO);
  const sum = tw(s, [t + 0.5, t + 1.7], [0, 7.76], OUT);
  const dup = tw(s, [t + 1.9, t + 2.3], [0, 1], EXPO);
  const strike = tw(s, [t + 2.55, t + 2.95], [0, 1], INOUT);
  const fact = tw(s, [t + 2.85, t + 3.35], [0, 1], EXPO);
  // the report condenses into a warm window and falls into the waking city
  const shrink = tw(s, [o + 0.3, o + 0.65], [0, 1], INOUT);
  const fall = tw(s, [o + 0.6, BEACON_AT12], [0, 1], (x) => x * x);
  const bs = nearToScreen(to5(s), film, BEACON.x, BEACON.y);
  const w = lerp(lerp(REP.w, 26, shrink), BEACON.w * bs.push, fall);
  const h = lerp(lerp(REP.h, 36, shrink), BEACON.h * bs.push, fall);
  const cx = lerp(HX, bs.x, fall);
  const cy = lerp(GY, bs.y, fall) - Math.sin(Math.PI * fall) * 40;
  const warm = shrink;
  const face = 1 - tw(s, [o, o + 0.25], [0, 1]);
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: lerp(28, 3, shrink), opacity: Math.min(1, k * 1.3) * (1 - tw(s, [BEACON_AT12, BEACON_AT12 + 0.1], [0, 1])), translate: `0 ${(1 - k) * 30}px`,
      ...(warm > 0 ? { background: `rgb(${Math.round(lerp(40, 255, warm))},${Math.round(lerp(46, 178, warm))},${Math.round(lerp(120, 94, warm))})`, boxShadow: `0 0 ${60 * warm}px ${20 * warm}px rgba(255,170,80,${0.6 * warm})` } : solidGlass), overflow: "hidden", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 30, top: 26, right: 30, opacity: face }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 750, color: WHITE }}>Отчёт по давальческим материалам</div>
          <div style={{ marginLeft: "auto", fontSize: 16, color: MUTED }}>свод из таблиц</div>
        </div>
        <div style={{ display: "flex", fontSize: 15, fontWeight: 650, color: "rgba(255,255,255,0.45)", marginTop: 22, padding: "0 14px" }}>
          <span style={{ width: 250 }}>Адрес</span><span style={{ flex: 1 }}>Материал</span><span style={{ width: 90, textAlign: "right" }}>Объём</span>
        </div>
        {ROWS.map((r, i) => {
          const hot = r.dup ? dup : 0;
          return (
            <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", height: 44, marginTop: 8, padding: "0 14px", borderRadius: 12, background: hot > 0 ? `rgba(253,132,49,${0.2 * hot})` : "rgba(255,255,255,0.05)", opacity: rows(i), translate: `${(1 - rows(i)) * 20}px 0`, fontSize: 17, color: WHITE, boxShadow: hot > 0 ? `0 0 ${24 * hot}px rgba(253,132,49,${0.25 * hot})` : undefined }}>
              <span style={{ width: 250, fontWeight: 600 }}>{r.a}</span>
              <span style={{ flex: 1, color: "rgba(255,255,255,0.75)" }}>{r.m}</span>
              <span style={{ width: 90, textAlign: "right", fontWeight: 700 }}>{r.q}</span>
              {r.dup && <span style={{ position: "absolute", right: -6, top: -12, padding: "3px 9px", borderRadius: 99, background: ORANGE, color: WHITE, fontSize: 12.5, fontWeight: 800, letterSpacing: "0.06em", opacity: hot, scale: String(0.8 + 0.2 * hot) }}>ПОВТОР</span>}
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 20, padding: "0 14px", gap: 24 }}>
          <div style={{ fontSize: 18, color: MUTED, paddingBottom: 10 }}>Поставлено по отчёту</div>
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <span style={{ ...NUM, fontSize: 56, color: ORANGE }}>{sum.toFixed(2).replace(".", ",")}</span>
            <span style={{ fontSize: 24, fontWeight: 750, color: ORANGE, marginLeft: 8 }}>млрд ₽</span>
            <div style={{ position: "absolute", left: -6, top: 30, height: 5, borderRadius: 3, width: `calc(${strike * 100}% + 12px)`, background: RED, boxShadow: `0 0 14px ${RED}` }} />
          </div>
          <div style={{ opacity: fact, translate: `${(1 - fact) * 16}px 0`, textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", color: "#7CE0B6" }}>ФАКТ</div>
            <div><span style={{ ...NUM, fontSize: 56 }}>6,1</span><span style={{ fontSize: 24, fontWeight: 750, color: WHITE, marginLeft: 8 }}>млрд ₽</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ the scene */

export const Now7: React.FC = () => {
  const s = useSec();
  const intro = NOW7.intro;
  const dock = tw(s, [P[0] - 0.3, P[0] + 0.4], [0, 1], INOUT);
  const hudOut = tw(s, [NOW7.end - 0.3, NOW7.end + 0.2], [0, 1], IN);
  const w = (i: number) => {
    const a = i === 0 ? P[0] - 0.4 : O[i - 1] + 0.2;
    return tw(s, [a, a + 0.7], [0, 1], INOUT) * (i < 6 ? 1 - tw(s, [O[i] + 0.2, O[i] + 0.9], [0, 1], INOUT) : 1 - hudOut);
  };
  const fail = tw(s, [P[4] + 3.05, P[4] + 3.4], [0, 1]) * (1 - tw(s, [O[4], O[4] + 0.6], [0, 1]));
  const GLOW = ["90,120,255", "120,140,255", "253,132,49", "253,150,70", "120,140,255", "253,150,70", "253,132,49"];
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
          <div key={i} style={{ width: 46, height: 5, borderRadius: 9, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
            <div style={{ width: `${tw(s, [t, (P[i + 1] ?? NOW7.end) - 0.1], [0, 100], (x) => x)}%`, height: 5, background: ORANGE }} />
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 96, top: 300, width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Counter />
          <div style={{ position: "relative", height: 30, flex: 1 }}>
            {TEXT.map((x, i) =>
              s > P[i] - 0.3 && s < O[i] + 0.7 ? (
                <div key={i} style={{ position: "absolute", left: 0, top: 0 }}>
                  <MaskLines lines={[x.st]} inAt={P[i] + 0.05} outAt={O[i] + 0.02} size={24} weight={650} color="rgba(255,255,255,0.62)" />
                </div>
              ) : null,
            )}
          </div>
        </div>
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
                <MaskLines lines={x.d} inAt={P[i] + 0.22} outAt={O[i] + 0.04} size={28} weight={500} color="rgba(255,255,255,0.74)" lh={1.36} stagger={0.06} />
              </div>
            ) : null,
          )}
        </div>
      </div>

      <Question />
      <Space>
        <Sources />
      </Space>
      <Verdict at={P[0] + 3.0} out={O[0]} x={HX} y={GY + 300}>
        Каждое значение — вручную
      </Verdict>
      <Requests />
      <Verdict at={P[1] + 3.5} out={O[1]} x={HX + 120} y={GY + 360}>
        Одна заявка — два ввода
      </Verdict>
      <Trips />
      <Delivery />
      <Loop />
      <Pile />
      <Report />
      <Verdict at={P[6] + 3.4} out={O[6]} x={HX} y={GY + REP.h / 2 + 52}>
        +1,66 млрд ₽ — только на бумаге
      </Verdict>
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
