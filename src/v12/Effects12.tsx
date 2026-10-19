import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, rand, tw, useSec } from "../lib";
import { LightStage } from "../components/Backdrop";
import { Eyebrow } from "../components/Type";
import { LOGO_WINDOWS } from "../scenes/S10Close";

/* v12 · the effect in three groups — Деньги, Время, Люди (roadmap p. 3, the time per employee,
   765 returns of requests = 1 419 person-hours). Every beat sends its number into the rail on top;
   the summary sorts them into three columns; the «100% objects» grid flies into the mark. */

export const E12 = { in: 112.0, e: [112.2, 115.8, 119.6, 123.4, 127.4, 131.2, 135.0, 138.8], sum: 142.4, converge: 144.9, end: 145.82 };
const E3 = E12;
export const EFF_EXT = E12.end - 138.42;

type G = "Деньги" | "Время" | "Люди";
const RAIL: { v: string; l: string; g: G }[] = [
  { v: "800–960 млн ₽", l: "закупки в год", g: "Деньги" },
  { v: "67,5–90 млн ₽", l: "логистика в год", g: "Деньги" },
  { v: "1 419 чел.-ч", l: "на 765 возвратов заявок", g: "Время" },
  { v: "−20–30%", l: "цикл согласования", g: "Время" },
  { v: "250–300 ч", l: "в год на сотрудника", g: "Время" },
  { v: "2,5–3 ставки", l: "на каждые 10 человек", g: "Люди" },
  { v: "100%", l: "объектов в аналитике", g: "Люди" },
];
const GCOL: Record<G, string> = { Деньги: C.orange, Время: C.blue, Люди: C.green };
const RW = 236;
const RG = 12;
const RX0 = (1920 - (RAIL.length * RW + (RAIL.length - 1) * RG)) / 2;
const slot = (i: number) => ({ x: RX0 + i * (RW + RG) + RW / 2, y: 226 });
// when each rail pill arrives
const RAIL_AT = [119.35, 123.15, 127.15, 131.0, 134.75, 138.55, 142.15];

const num = (v: number, d = 0) => v.toFixed(d).replace(".", ",");

/** A beat's hero number: holds centre stage, then flies into its rail slot. */
const Hero: React.FC<{ i: number; at: number; from: { x: number; y: number }; children: React.ReactNode; size?: number }> = ({ i, at, from, children, size = 120 }) => {
  const s = useSec();
  const dock = RAIL_AT[i] - 0.55;
  const k = tw(s, [at, at + 0.7], [0, 1], EXPO);
  const f = tw(s, [dock, RAIL_AT[i]], [0, 1], INOUT);
  if (k <= 0 || f >= 1) return null;
  const to = slot(i);
  const x = from.x + (to.x - from.x) * f;
  const y = from.y + (to.y - from.y) * f;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String((0.9 + 0.1 * k) * (1 - f * 0.78)), opacity: Math.min(1, k * 1.5) * (1 - tw(f, [0.3, 0.85], [0, 1])), whiteSpace: "nowrap", fontSize: size, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums", textShadow: f > 0 ? `0 0 ${40 * f}px rgba(49,107,253,0.6)` : undefined }}>
      {children}
    </div>
  );
};

const BeatLabel: React.FC<{ at: number; out: number; title: string; sub: string; g?: G }> = ({ at, out, title, sub, g }) => {
  const s = useSec();
  const k = tw(s, [at + 0.05, at + 0.6], [0, 1], EXPO);
  const o = tw(s, [out - 0.35, out], [0, 1], IN);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: g ? 286 : 300, textAlign: "center", opacity: k * (1 - o), translate: `0 ${(1 - k) * 24 - o * 20}px` }}>
      {g && <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.18em", color: GCOL[g], marginBottom: 10 }}>{g.toUpperCase()}</div>}
      <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: "-0.025em", color: C.ink }}>{title}</div>
      <div style={{ fontSize: 26, color: C.muted, fontWeight: 550, marginTop: 10 }}>{sub}</div>
    </div>
  );
};

const Caption: React.FC<{ at: number; out: number; children: React.ReactNode; y?: number }> = ({ at, out, children, y = 930 }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
  const o = tw(s, [out - 0.35, out], [0, 1], IN);
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontSize: 25, color: C.ink2, fontWeight: 600, opacity: k * (1 - o) }}>{children}</div>;
};

const TruckIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={72} height={44} viewBox="0 0 72 44">
    <rect x={2} y={4} width={42} height={26} rx={4} fill={color} />
    <path d="M46 12h12l10 10v8H46z" fill={color} opacity={0.85} />
    <circle cx={14} cy={34} r={6} fill={C.ink} />
    <circle cx={56} cy={34} r={6} fill={C.ink} />
  </svg>
);

const Person: React.FC<{ hot: number }> = ({ hot }) => (
  <svg width={70} height={110} viewBox="0 0 70 110" style={{ filter: hot ? `drop-shadow(0 0 ${14 * hot}px rgba(253,132,49,0.9))` : undefined }}>
    <circle cx={35} cy={22} r={16} fill={hot ? C.orange : "#C9D2EC"} />
    <path d="M8 104c0-30 12-50 27-50s27 20 27 50z" fill={hot ? C.orange : "#C9D2EC"} />
  </svg>
);

export const Effects12: React.FC = () => {
  const s = useSec();
  const [e0, e1, e2, e3, e4, e5, e6, e7] = E3.e;
  const ent = s >= E3.in ? 1 : 0;
  const conv = tw(s, [E3.converge, E3.end], [0, 1], (t) => t * t * (3 - 2 * t));
  const white = tw(s, [E3.converge + 0.3, E3.end], [0, 1]);
  const railOut = tw(s, [E3.converge - 0.4, E3.converge], [0, 1]);

  // total: big in beat 0, docks above the rail, returns for the summary
  const tot = tw(s, [e0 + 0.2, e0 + 2.0], [0, 1], OUT);
  const dockIn = tw(s, [e1 - 0.6, e1], [0, 1], INOUT);
  const back = tw(s, [E3.sum, E3.sum + 0.8], [0, 1], INOUT);
  const totY = 470 + (124 - 470) * dockIn + (380 - 124) * back;
  const totS = 1 - 0.62 * dockIn + 0.62 * back;

  // 100% grid (beat 5) — also the source of the six logo windows
  const GC = 40;
  const GR = 13;
  const cell = 26;
  const gx0 = 960 - (GC * cell) / 2;
  const gy0 = 405;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: ent }}>
      <LightStage glowX={0.5} glowY={0.45} intensity={1 - white} />
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
      {/* the signed document arrives as a point of light; it blooms into the scene */}
      <div style={{ position: "absolute", left: 960, top: 470, width: 300, height: 300, translate: "-50% -50%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(49,107,253,0.5), rgba(49,107,253,0.18) 45%, rgba(49,107,253,0))", scale: String(0.3 + tw(s, [E3.in, E3.in + 1.0], [0, 9], OUT)), opacity: 1 - tw(s, [E3.in + 0.2, E3.in + 1.0], [0, 1]) }} />
      <div style={{ position: "absolute", left: 960, top: 470, width: 60, height: 60, translate: "-50% -50%", borderRadius: "50%", background: C.blue, boxShadow: "0 0 60px rgba(49,107,253,0.6)", scale: String(1 - tw(s, [E3.in, E3.in + 0.3], [0, 1], IN)), opacity: 1 - tw(s, [E3.in + 0.15, E3.in + 0.3], [0, 1]) }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 30, display: "flex", justifyContent: "center", opacity: 1 - railOut }}>
        <Eyebrow n="₽" label="Эффект от внедрения единой системы" at={E3.in + 0.1} />
      </div>

      {/* total */}
      <div style={{ position: "absolute", left: 960, top: totY, translate: "-50% -50%", scale: String(totS * (1 - conv * 0.95)), whiteSpace: "nowrap", textAlign: "center", opacity: tw(s, [e0, e0 + 0.4], [0, 1]) * (1 - tw(s, [E3.converge - 0.1, E3.converge + 0.35], [0, 1])) }}>
        <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color: C.blue, textShadow: "0 0 40px rgba(49,107,253,0.45)" }}>≈</span> {tot >= 0.995 ? "1" : num(tot, 2)} <span style={{ fontSize: 100 }}>млрд ₽</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 650, color: C.muted, marginTop: 12 }}>в год</div>
      </div>

      {/* beat 0: where the billion comes from */}
      {s < e1 + 0.2 && (
        <div style={{ position: "absolute", left: 260, top: 690, width: 1400, opacity: tw(s, [e0 + 0.8, e0 + 1.2], [0, 1]) * (1 - tw(s, [e1 - 0.5, e1 - 0.1], [0, 1])) }}>
          <div style={{ display: "flex", height: 60, borderRadius: 18, overflow: "hidden", background: "#E7E9F1" }}>
            <div style={{ width: `${tw(s, [e0 + 1.0, e0 + 2.2], [0, 91.4], OUT)}%`, background: C.blue, boxShadow: "0 0 40px rgba(49,107,253,0.55)" }} />
            <div style={{ width: `${tw(s, [e0 + 2.0, e0 + 2.6], [0, 8.6], OUT)}%`, background: C.orange, boxShadow: "0 0 30px rgba(253,132,49,0.6)" }} />
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 24, fontWeight: 700 }}>
            <span style={{ color: C.blue }}>Закупки · 800–960 млн ₽</span>
            <span style={{ marginLeft: "auto", color: "#c4520f" }}>Логистика · 67,5–90 млн ₽</span>
          </div>
          <div style={{ textAlign: "center", fontSize: 25, color: C.ink2, fontWeight: 600, marginTop: 40 }}>Экономия каждый год — за счёт единой системы и автоматизации процессов</div>
        </div>
      )}

      {/* beat 1: purchases — a 10–12% slice of 8 bn breaks off */}
      {s > e1 - 0.2 && s < e2 + 0.2 && (
        <>
          <BeatLabel at={e1} out={e2} g="Деньги" title="Закупки материалов" sub="8 млрд ₽ расходов на материалы в год" />
          <div style={{ position: "absolute", left: 260, top: 450, width: 1400, height: 110 }}>
            {Array.from({ length: 100 }, (_, i) => {
              const cut = i >= 89;
              const k = tw(s, [e1 + 0.3 + i * 0.006, e1 + 0.8 + i * 0.006], [0, 1], EXPO);
              const lift = cut ? tw(s, [e1 + 1.3, e1 + 2.0], [0, 1], INOUT) : 0;
              return (
                <div key={i} style={{ position: "absolute", left: i * 14, top: 0, width: 11, height: 110, borderRadius: 4, background: cut ? (lift > 0 ? C.orange : C.blue) : C.blue, opacity: k * (cut ? 1 : 0.85 - lift * 0), translate: `${lift * 60}px ${lift * 150}px`, boxShadow: cut && lift > 0 ? `0 0 ${20 * lift}px rgba(253,132,49,0.8)` : "none", scale: `1 ${k}`, transformOrigin: "bottom" }} />
              );
            })}
            <div style={{ position: "absolute", left: 1246 + 60, top: 270, fontSize: 22, fontWeight: 800, color: "#c4520f", opacity: tw(s, [e1 + 1.9, e1 + 2.3], [0, 1]) }}>10–12%</div>
          </div>
          <Hero i={0} at={e1 + 2.0} from={{ x: 960, y: 790 }}>
            <span style={{ color: C.orange }}>{Math.round(tw(s, [e1 + 2.0, e1 + 2.9], [0, 800], OUT))}–{Math.round(tw(s, [e1 + 2.0, e1 + 2.9], [0, 960], OUT))}</span> <span style={{ fontSize: 60 }}>млн ₽ / год</span>
          </Hero>
          <Caption at={e1 + 2.4} out={e2}>Проверка заявок по проектным объёмам и лимитам, без дублей и повторных закупок</Caption>
        </>
      )}

      {/* beat 2: logistics — some trucks no longer drive */}
      {s > e2 - 0.2 && s < e3 + 0.2 && (
        <>
          <BeatLabel at={e2} out={e3} g="Деньги" title="Доставка и перемещения" sub="450 млн ₽ в год" />
          {Array.from({ length: 20 }, (_, i) => {
            const r = Math.floor(i / 10);
            const c = i % 10;
            const gone = [3, 8, 12, 17].includes(i);
            const k = tw(s, [e2 + 0.3 + i * 0.03, e2 + 0.8 + i * 0.03], [0, 1], EXPO);
            const go = gone ? tw(s, [e2 + 1.4 + (i % 4) * 0.08, e2 + 2.3 + (i % 4) * 0.08], [0, 1], IN) : 0;
            return (
              <div key={i} style={{ position: "absolute", left: 470 + c * 100 + go * 900, top: 450 + r * 90, opacity: k * (1 - go), scale: String(0.8 + 0.2 * k) }}>
                <TruckIcon color={gone && s > e2 + 1.2 ? C.orange : C.blue} />
              </div>
            );
          })}
          {[3, 8, 12, 17].map((i) => (
            <div key={i} style={{ position: "absolute", left: 470 + (i % 10) * 100, top: 450 + Math.floor(i / 10) * 90, width: 72, height: 44, borderRadius: 8, boxShadow: "inset 0 0 0 2px rgba(253,132,49,0.6)", opacity: tw(s, [e2 + 2.0, e2 + 2.4], [0, 0.8]) }} />
          ))}
          <Hero i={1} at={e2 + 2.2} from={{ x: 960, y: 790 }}>
            <span style={{ color: C.orange }}>{num(tw(s, [e2 + 2.2, e2 + 3.0], [0, 67.5], OUT), 1)}–{Math.round(tw(s, [e2 + 2.2, e2 + 3.0], [0, 90], OUT))}</span> <span style={{ fontSize: 60 }}>млн ₽ / год</span>
          </Hero>
          <Caption at={e2 + 2.5} out={e3}>−15–20%: поставка под готовность объекта, без повторных рейсов</Caption>
        </>
      )}

      {/* beat 3 (Время): 765 returns of requests — 1 419 person-hours of rework */}
      {s > e3 - 0.2 && s < e4 + 0.2 && (
        <>
          <BeatLabel at={e3} out={e4} g="Время" title="Возвраты заявок на доработку" sub="каждый возврат — ещё один круг проверки и согласования" />
          {Array.from({ length: 765 }, (_, i) => {
            const c = i % 45;
            const r = Math.floor(i / 45);
            const k = tw(s, [e3 + 0.3 + (c + r) * 0.012, e3 + 0.6 + (c + r) * 0.012], [0, 1], EXPO);
            const back = tw(s, [e3 + 1.0 + rand(i * 2.7) * 0.6, e3 + 1.5 + rand(i * 2.7) * 0.6], [0, 1], INOUT);
            const gather = tw(s, [e3 + 2.0, e3 + 2.7], [0, 1], INOUT);
            const x0 = 960 - 22 * 26 + c * 26, y0 = 430 + r * 18;
            const x = x0 - Math.sin(back * Math.PI) * 18 + (960 - x0) * gather;
            const y = y0 - Math.sin(back * Math.PI) * 10 + (790 - y0) * gather;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 10, borderRadius: 3, background: back > 0.5 ? "#E5484D" : C.blue, opacity: k * (1 - gather * 0.9), boxShadow: back > 0.5 && back < 1 ? "0 0 8px rgba(229,72,77,0.6)" : "none" }} />;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 750, textAlign: "center", fontSize: 26, fontWeight: 800, color: "#D0344B", opacity: tw(s, [e3 + 1.3, e3 + 1.7], [0, 1]) * (1 - tw(s, [e3 + 2.0, e3 + 2.3], [0, 1])) }}>765 возвратов</div>
          <Hero i={2} at={e3 + 2.4} from={{ x: 960, y: 790 }}>
            <span style={{ color: C.blue }}>{Math.round(tw(s, [e3 + 2.4, e3 + 3.2], [0, 1419], OUT)).toLocaleString("ru-RU").replace(/\u00a0|,/g, " ")}</span> <span style={{ fontSize: 60 }}>человеко-часов</span>
          </Hero>
          <Caption at={e3 + 2.7} out={e4} y={870}>765 возвратов на доработку — столько времени уходило на переделку. Проверка по смете и лимитам — до отправки</Caption>
        </>
      )}

      {/* beat 4 (Время): a shorter approval cycle */}
      {s > e4 - 0.2 && s < e5 + 0.2 && (
        <>
          <BeatLabel at={e4} out={e5} g="Время" title="Цикл согласования" sub="автопроверка заявок и ИИ-сверка документов" />
          <div style={{ position: "absolute", left: 360, top: 470, width: 1200, opacity: tw(s, [e4 + 0.2, e4 + 0.7], [0, 1]) * (1 - tw(s, [e5 - 0.6, e5 - 0.2], [0, 1])) }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 750 }}><span>Заявка: от подачи до согласования</span><span style={{ marginLeft: "auto", color: C.muted, fontWeight: 600 }}>было → стало</span></div>
            <div style={{ marginTop: 18, height: 72, borderRadius: 18, background: "#E7E9F1", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${tw(s, [e4 + 0.4, e4 + 1.0], [0, 100], OUT) - tw(s, [e4 + 1.4, e4 + 2.3], [0, 25], INOUT)}%`, borderRadius: 18, background: C.blue, boxShadow: "0 0 30px rgba(49,107,253,0.5)" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${tw(s, [e4 + 1.4, e4 + 2.3], [0, 25], INOUT)}%`, borderRadius: 18, boxShadow: "inset 0 0 0 2px rgba(253,132,49,0.7)" }} />
            </div>
          </div>
          <Hero i={3} at={e4 + 2.1} from={{ x: 960, y: 700 }}>
            <span style={{ color: C.orange }}>−20–30%</span> <span style={{ fontSize: 60 }}>времени на согласование</span>
          </Hero>
        </>
      )}

      {/* beat 3: an employee's day — 1–1.5 h of routine set free */}
      {s > e5 - 0.2 && s < e6 + 0.2 && (
        <>
          <BeatLabel at={e5} out={e6} g="Время" title="Время каждого сотрудника" sub="ИИ и единая система берут на себя ввод, сверку и поиск" />
          <div style={{ position: "absolute", left: 360, top: 450, width: 1200 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: 16 }, (_, i) => {
                const free = i >= 13;
                const k = tw(s, [e5 + 0.3 + i * 0.04, e5 + 0.8 + i * 0.04], [0, 1], EXPO);
                const lift = free ? tw(s, [e5 + 1.4, e5 + 2.0], [0, 1], INOUT) : 0;
                return (
                  <div key={i} style={{ flex: 1, height: 90, borderRadius: 10, background: free ? (lift > 0 ? C.orange : "#C9D2EC") : C.blue, opacity: k, translate: `0 ${-lift * 40}px`, boxShadow: free && lift > 0 ? `0 0 ${26 * lift}px rgba(253,132,49,0.8)` : "none" }} />
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 19, color: C.muted, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {["9:00", "11:00", "13:00", "15:00", "17:00"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            <div style={{ position: "absolute", right: 0, width: 230, top: 140, textAlign: "center", fontSize: 24, fontWeight: 800, color: "#c4520f", opacity: tw(s, [e5 + 1.8, e5 + 2.2], [0, 1]), translate: `0 ${(1 - tw(s, [e5 + 1.8, e5 + 2.3], [0, 1], EXPO)) * 10}px` }}>≈ 1–1,5 часа в день</div>
          </div>
          <Hero i={4} at={e5 + 2.0} from={{ x: 960, y: 760 }}>
            <span style={{ color: C.orange }}>{Math.round(tw(s, [e5 + 2.0, e5 + 3.0], [0, 250], OUT))}–{Math.round(tw(s, [e5 + 2.0, e5 + 3.0], [0, 300], OUT))}</span> <span style={{ fontSize: 60 }}>часов в год</span>
          </Hero>
          <Caption at={e5 + 2.4} out={e6} y={850}>на одного сотрудника — примерно 1–1,5 часа каждого восьмичасового дня</Caption>
        </>
      )}


      {/* beat 6 (Люди): the same work with fewer hands */}
      {s > e6 - 0.2 && s < e7 + 0.2 && (
        <>
          <BeatLabel at={e6} out={e7} g="Люди" title="Трудозатраты на охваченные операции" sub="рутину — ввод, сверку, поиск — делает система" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", gap: 18, opacity: tw(s, [e6 + 0.2, e6 + 0.7], [0, 1]) * (1 - tw(s, [e7 - 0.6, e7 - 0.2], [0, 1])) }}>
            {Array.from({ length: 10 }, (_, i) => {
              const hot = i >= 7 ? tw(s, [e6 + 1.2 + (i - 7) * 0.25, e6 + 1.6 + (i - 7) * 0.25], [0, 1]) * (i === 7 ? 0.6 : 1) : 0;
              return <div key={i} style={{ scale: "1.35", transformOrigin: "bottom" }}><Person hot={hot} /></div>;
            })}
          </div>
          <Hero i={5} at={e6 + 2.0} from={{ x: 960, y: 790 }}>
            <span style={{ color: C.green }}>2,5–3 ставки</span> <span style={{ fontSize: 60 }}>на каждые 10 человек</span>
          </Hero>
          <Caption at={e6 + 2.3} out={e7} y={880}>−25–30% трудозатрат: люди заняты решениями, а не перепечатыванием</Caption>
        </>
      )}

      {/* beat 5: all objects, always current — a grid of lit windows */}
      {s > e7 - 0.2 && (
        <>
          <BeatLabel at={e7} out={E3.sum + 0.2} title="Актуальная аналитика для руководства" sub="единые данные по плану-факту, материалам и остаткам" />
          {Array.from({ length: GC * GR }, (_, i) => {
            const c = i % GC;
            const r = Math.floor(i / GC);
            const wave = (c + r * 1.4) / (GC + GR * 1.4);
            const on = tw(s, [e7 + 0.4 + wave * 1.6, e7 + 0.7 + wave * 1.6], [0, 1]);
            const flies = rand(i * 5.9) < 0.2;
            const tgt = LOGO_WINDOWS[Math.floor(rand(i * 3.3) * 6)];
            const dist = Math.hypot(gx0 + c * cell - tgt.x, gy0 + r * cell - tgt.y) / 900;
            const cv = flies ? tw(conv, [Math.min(0.45, dist * 0.35), Math.min(1, 0.55 + dist * 0.4)], [0, 1], INOUT) : 0;
            const fade = flies ? 0 : tw(conv, [0, 0.35], [0, 1]);
            const x = gx0 + c * cell;
            const y = gy0 + r * cell;
            const dimmed = 1 - tw(s, [E3.sum, E3.sum + 0.6], [0, 0.94]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x + (tgt.x - 8 - x) * cv,
                  top: y + (tgt.y - 16 - y) * cv,
                  width: 9 + 7 * cv,
                  height: 18 + 14 * cv,
                  borderRadius: 3,
                  background: rand(i * 9.1) > 0.82 ? C.orange : C.blue,
                  opacity: (0.15 + 0.85 * on) * Math.max(dimmed, cv) * (1 - fade) * (1 - tw(conv, [0.9, 1], [0, 1])),
                  boxShadow: on > 0.5 ? "0 0 10px rgba(49,107,253,0.5)" : "none",
                }}
              />
            );
          })}
          <Hero i={6} at={e7 + 1.9} from={{ x: 960, y: 862 }} size={92}>
            <span style={{ color: C.blue }}>100%</span> <span style={{ fontSize: 56 }}>объектов · обновление ежедневно</span>
          </Hero>
        </>
      )}

      {/* summary column heads */}
      {(["Деньги", "Время", "Люди"] as G[]).map((g, c) => {
        const k = tw(s, [E3.sum + 0.5 + c * 0.08, E3.sum + 1.1 + c * 0.08], [0, 1], EXPO) * (1 - railOut);
        return <div key={g} style={{ position: "absolute", left: 960 + (c - 1) * 470, top: 530, translate: `-50% ${(1 - k) * 14}px`, opacity: k, fontSize: 20, fontWeight: 800, letterSpacing: "0.18em", color: GCOL[g] }}>{g.toUpperCase()}</div>;
      })}
      {/* the rail */}
      {RAIL.map((r, i) => {
        const p = pop(s, RAIL_AT[i], 0.5);
        if (s < RAIL_AT[i]) return null;
        const sumK = tw(s, [E3.sum + i * 0.04, E3.sum + 0.9 + i * 0.04], [0, 1], INOUT);
        const base = slot(i);
        // summary: three columns — Деньги, Время, Люди
        const col = r.g === "Деньги" ? 0 : r.g === "Время" ? 1 : 2;
        const row = RAIL.filter((q, j) => q.g === r.g && j < i).length;
        const gx = 960 + (col - 1) * (440 + 30);
        const gy = 620 + row * (118 + 16);
        const x = base.x + (gx - base.x) * sumK;
        const y = base.y + (gy - base.y) * sumK;
        const w = RW + (440 - RW) * sumK;
        const h = 92 + (118 - 92) * sumK;
        return (
          <div key={r.v} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", width: w, height: h, borderRadius: 20 + 6 * sumK, background: "#fff", boxShadow: `0 ${20 + 16 * sumK}px ${40 + 30 * sumK}px -24px rgba(0,2,48,0.35), 0 0 ${30 * Math.max(0, 1 - (s - RAIL_AT[i]) / 1.2)}px rgba(49,107,253,0.6)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", scale: String(Math.max(0, p)), opacity: 1 - railOut }}>
            <div style={{ fontSize: 28 + 14 * sumK, fontWeight: 800, letterSpacing: "-0.03em", color: GCOL[r.g] }}>{r.v}</div>
            <div style={{ fontSize: 16 + 3 * sumK, color: C.muted, fontWeight: 600, marginTop: 2 + 4 * sumK }}>{r.l}</div>
          </div>
        );
      })}

    </AbsoluteFill>
  );
};
