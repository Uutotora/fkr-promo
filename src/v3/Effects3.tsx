import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, rand, tw, useSec } from "../lib";
import { LightStage } from "../components/Backdrop";
import { Eyebrow } from "../components/Type";
import { LOGO_WINDOWS } from "../scenes/S10Close";

/* Economic effect (roadmap p. 3 + the time saving per employee), told as a chain of
   animated infographics. Every beat sends its key number into the summary rail on top;
   at the end the «100% objects» grid flies into the six windows of the mark. */

export const E3 = { in: 112.0, e: [112.2, 115.8, 119.6, 123.4, 127.4, 131.4], sum: 135.0, converge: 137.5, end: 138.42 };

const RAIL = [
  { v: "800–960 млн ₽", l: "закупки в год" },
  { v: "67,5–90 млн ₽", l: "логистика в год" },
  { v: "250–300 ч", l: "в год на сотрудника" },
  { v: "−20–30%", l: "цикл согласования" },
  { v: "2,5–3 ставки", l: "на каждые 10 человек" },
  { v: "100%", l: "объектов в аналитике" },
];
const RW = 262;
const RG = 12;
const RX0 = (1920 - (RAIL.length * RW + (RAIL.length - 1) * RG)) / 2;
const slot = (i: number) => ({ x: RX0 + i * (RW + RG) + RW / 2, y: 226 });
// when each rail pill arrives
const RAIL_AT = [119.35, 123.15, 127.15, 131.0, 131.1, 134.75];

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
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String((0.9 + 0.1 * k) * (1 - f * 0.78)), opacity: Math.min(1, k * 1.5) * (1 - tw(f, [0.7, 1], [0, 1])), whiteSpace: "nowrap", fontSize: size, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums", textShadow: f > 0 ? `0 0 ${40 * f}px rgba(49,107,253,0.6)` : undefined }}>
      {children}
    </div>
  );
};

const BeatLabel: React.FC<{ at: number; out: number; title: string; sub: string }> = ({ at, out, title, sub }) => {
  const s = useSec();
  const k = tw(s, [at + 0.05, at + 0.6], [0, 1], EXPO);
  const o = tw(s, [out - 0.35, out], [0, 1], IN);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: k * (1 - o), translate: `0 ${(1 - k) * 24 - o * 20}px` }}>
      <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>{title}</div>
      <div style={{ fontSize: 24, color: C.muted, fontWeight: 550, marginTop: 8 }}>{sub}</div>
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

export const Effects3: React.FC = () => {
  const s = useSec();
  const [e0, e1, e2, e3, e4, e5] = E3.e;
  const ent = tw(s, [E3.in, E3.in + 0.5], [0, 1]);
  const conv = tw(s, [E3.converge, E3.end], [0, 1], (t) => t * t * (3 - 2 * t));
  const white = tw(s, [E3.converge + 0.3, E3.end], [0, 1]);
  const railOut = tw(s, [E3.converge - 0.4, E3.converge], [0, 1]);

  // total: big in beat 0, docks above the rail, returns for the summary
  const tot = tw(s, [e0 + 0.2, e0 + 2.0], [0, 1.05], OUT);
  const dock = tw(s, [e1 - 0.6, e1], [0, 1], INOUT) * (1 - tw(s, [E3.sum, E3.sum + 0.8], [0, 1], INOUT));
  const totY = 470 + (124 - 470) * dock;
  const totS = 1 - 0.62 * dock;

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
      {/* stamp shock → this scene: an expanding ring of light */}
      <div style={{ position: "absolute", left: 960, top: 540, width: 40, height: 40, translate: "-50% -50%", borderRadius: 999, boxShadow: `0 0 0 4px rgba(49,107,253,${0.5 * (1 - tw(s, [E3.in, E3.in + 0.9], [0, 1]))}), 0 0 80px rgba(49,107,253,${0.4 * (1 - tw(s, [E3.in, E3.in + 0.9], [0, 1]))})`, scale: String(1 + tw(s, [E3.in, E3.in + 0.9], [0, 60], OUT)) }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 30, display: "flex", justifyContent: "center", opacity: 1 - railOut }}>
        <Eyebrow n="₽" label="Эффект от внедрения единой системы" at={E3.in + 0.1} />
      </div>

      {/* total */}
      <div style={{ position: "absolute", left: 960, top: totY, translate: "-50% -50%", scale: String(totS * (1 - conv * 0.95)), whiteSpace: "nowrap", textAlign: "center", opacity: tw(s, [e0, e0 + 0.4], [0, 1]) * (1 - tw(s, [E3.converge - 0.1, E3.converge + 0.35], [0, 1])) }}>
        <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color: C.blue, textShadow: "0 0 40px rgba(49,107,253,0.45)" }}>≈</span> {num(tot, 2)} <span style={{ fontSize: 100 }}>млрд ₽</span>
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
          <BeatLabel at={e1} out={e2} title="Закупки материалов" sub="8 млрд ₽ расходов на материалы в год" />
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
          <BeatLabel at={e2} out={e3} title="Доставка и перемещения" sub="450 млн ₽ в год" />
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

      {/* beat 3: an employee's day — 1–1.5 h of routine set free */}
      {s > e3 - 0.2 && s < e4 + 0.2 && (
        <>
          <BeatLabel at={e3} out={e4} title="Время сотрудника" sub="ИИ и единая система берут на себя ввод, сверку и поиск" />
          <div style={{ position: "absolute", left: 360, top: 450, width: 1200 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: 16 }, (_, i) => {
                const free = i >= 13;
                const k = tw(s, [e3 + 0.3 + i * 0.04, e3 + 0.8 + i * 0.04], [0, 1], EXPO);
                const lift = free ? tw(s, [e3 + 1.4, e3 + 2.0], [0, 1], INOUT) : 0;
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
            <div style={{ position: "absolute", right: 0, width: 230, top: 140, textAlign: "center", fontSize: 24, fontWeight: 800, color: "#c4520f", opacity: tw(s, [e3 + 1.8, e3 + 2.2], [0, 1]), translate: `0 ${(1 - tw(s, [e3 + 1.8, e3 + 2.3], [0, 1], EXPO)) * 10}px` }}>≈ 1–1,5 часа в день</div>
          </div>
          <Hero i={2} at={e3 + 2.0} from={{ x: 960, y: 760 }}>
            <span style={{ color: C.orange }}>{Math.round(tw(s, [e3 + 2.0, e3 + 3.0], [0, 250], OUT))}–{Math.round(tw(s, [e3 + 2.0, e3 + 3.0], [0, 300], OUT))}</span> <span style={{ fontSize: 60 }}>часов в год</span>
          </Hero>
          <Caption at={e3 + 2.4} out={e4} y={850}>на одного сотрудника — примерно 1–1,5 часа каждого восьмичасового дня</Caption>
        </>
      )}

      {/* beat 4: shorter approval cycle and freed capacity */}
      {s > e4 - 0.2 && s < e5 + 0.2 && (
        <>
          <BeatLabel at={e4} out={e5} title="Согласование и ручная работа" sub="автопроверка заявок и ИИ-сверка документов" />
          <div style={{ position: "absolute", left: 160, top: 450, width: 760, opacity: tw(s, [e4 + 0.2, e4 + 0.7], [0, 1]) * (1 - tw(s, [e5 - 0.6, e5 - 0.2], [0, 1])) }}>
            <div style={{ fontSize: 24, fontWeight: 750 }}>Цикл согласования заявки</div>
            <div style={{ marginTop: 18, height: 64, borderRadius: 16, background: "#E7E9F1", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${tw(s, [e4 + 0.4, e4 + 1.0], [0, 100], OUT) - tw(s, [e4 + 1.4, e4 + 2.3], [0, 25], INOUT)}%`, borderRadius: 16, background: C.blue, boxShadow: "0 0 30px rgba(49,107,253,0.5)" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${tw(s, [e4 + 1.4, e4 + 2.3], [0, 25], INOUT)}%`, borderRadius: 16, boxShadow: "inset 0 0 0 2px rgba(253,132,49,0.7)" }} />
            </div>
            <div style={{ marginTop: 16, fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", color: C.orange, opacity: tw(s, [e4 + 1.9, e4 + 2.3], [0, 1]) }}>−20–30%</div>
          </div>
          <div style={{ position: "absolute", left: 1000, top: 450, width: 760, opacity: tw(s, [e4 + 0.3, e4 + 0.8], [0, 1]) * (1 - tw(s, [e5 - 0.6, e5 - 0.2], [0, 1])) }}>
            <div style={{ fontSize: 24, fontWeight: 750 }}>Трудозатраты на охваченные операции</div>
            <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
              {Array.from({ length: 10 }, (_, i) => {
                const hot = i >= 7 ? tw(s, [e4 + 1.5 + (i - 7) * 0.2, e4 + 1.9 + (i - 7) * 0.2], [0, 1]) * (i === 7 ? 0.6 : 1) : 0;
                return <Person key={i} hot={hot} />;
              })}
            </div>
            <div style={{ marginTop: 16, fontSize: 27, fontWeight: 800, opacity: tw(s, [e4 + 2.2, e4 + 2.6], [0, 1]) }}>
              <span style={{ color: C.orange }}>2,5–3 ставки</span> на каждые 10 сотрудников · −25–30%
            </div>
          </div>
        </>
      )}

      {/* beat 5: all objects, always current — a grid of lit windows */}
      {s > e5 - 0.2 && (
        <>
          <BeatLabel at={e5} out={E3.sum + 0.2} title="Актуальная аналитика для руководства" sub="единые данные по плану-факту, материалам и остаткам" />
          {Array.from({ length: GC * GR }, (_, i) => {
            const c = i % GC;
            const r = Math.floor(i / GC);
            const wave = (c + r * 1.4) / (GC + GR * 1.4);
            const on = tw(s, [e5 + 0.4 + wave * 1.6, e5 + 0.7 + wave * 1.6], [0, 1]);
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
          <Hero i={5} at={e5 + 1.9} from={{ x: 960, y: 862 }} size={92}>
            <span style={{ color: C.blue }}>100%</span> <span style={{ fontSize: 56 }}>объектов · обновление ежедневно</span>
          </Hero>
        </>
      )}

      {/* the rail */}
      {RAIL.map((r, i) => {
        const p = pop(s, RAIL_AT[i], 0.5);
        if (s < RAIL_AT[i]) return null;
        const sumK = tw(s, [E3.sum, E3.sum + 0.9], [0, 1], INOUT);
        const base = slot(i);
        const y = base.y + (720 - base.y) * sumK;
        return (
          <div key={r.v} style={{ position: "absolute", left: base.x, top: y, translate: "-50% -50%", width: RW, height: 92, borderRadius: 20, background: "#fff", boxShadow: `0 20px 40px -24px rgba(0,2,48,0.35), 0 0 ${30 * Math.max(0, 1 - (s - RAIL_AT[i]) / 1.2)}px rgba(49,107,253,0.6)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", scale: String(Math.max(0, p) * (1 + sumK * 0.08)), opacity: 1 - railOut }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: i === 5 ? C.blue : C.orange }}>{r.v}</div>
            <div style={{ fontSize: 16, color: C.muted, fontWeight: 600, marginTop: 2 }}>{r.l}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", fontSize: 18, color: C.faint, opacity: tw(s, [e0 + 1.5, e0 + 2], [0, 1]) * (1 - railOut) }}>
        Оценка по дорожной карте единой системы ФКР: 8 млрд ₽ на материалы и 450 млн ₽ на доставку в год
      </div>
    </AbsoluteFill>
  );
};
