import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, tw, useSec } from "../lib";
import { LightStage } from "../components/Backdrop";
import { Eyebrow } from "../components/Type";
import { LOGO_WINDOWS } from "../scenes/S10Close";

/* Economic effect — roadmap, page 3: «Эффект от внедрения единой системы и автоматизации
   текущих процессов составляет порядка 1,05 млрд ₽ в год». Cards follow the order of the
   five problems shown at the start, so the film closes its own loop. */

export const EF = { in: 96.0, total: 96.45, dock: 98.7, cards: 99.0, hold: 104.2, converge: 107.55, end: 108.45 };

const num = (v: number, d = 0) => v.toFixed(d).replace(".", ",");

const CARDS = [
  { was: "разные цифры", big: (k: number) => `${Math.round(100 * k)}%`, unit: "объектов", title: "Актуальная аналитика для руководства", why: "обновление не реже раза в сутки" },
  { was: "пересоздание заявок", big: (k: number) => `${Math.round(800 * k)}–${Math.round(960 * k)}`, unit: "млн ₽ в год", title: "Меньше избыточных и повторных закупок", why: "10–12% расходов на материалы", money: true },
  { was: "лишние перевозки", big: (k: number) => `${num(67.5 * k, 1)}–${Math.round(90 * k)}`, unit: "млн ₽ в год", title: "Ниже логистические расходы", why: "15–20% расходов на доставку", money: true },
  { was: "заявки по кругу", big: (k: number) => `−${Math.round(20 * k)}–${Math.round(30 * k)}%`, unit: "длительности цикла", title: "Быстрее согласование заявок", why: "автопроверка комплектности и объёмов" },
  { was: "повторный ввод", big: (k: number) => `−${Math.round(25 * k)}–${Math.round(30 * k)}%`, unit: "трудозатрат", title: "2,5–3 ставки на каждые 10 сотрудников", why: "ИИ-сверка УПД, ТТН и М-15" },
];

const CW = 318;
const GAP = 22;
const X0 = 960 - (5 * CW + 4 * GAP) / 2;
const CARD_Y = 430;
const CARD_H = 470;

export const Effects: React.FC = () => {
  const s = useSec();
  const ent = tw(s, [EF.in, EF.in + 0.5], [0, 1]);
  const dock = tw(s, [EF.dock, EF.dock + 0.8], [0, 1], INOUT);
  const total = tw(s, [EF.total, EF.total + 1.8], [0, 1.05], OUT);
  const conv = tw(s, [EF.converge, EF.end], [0, 1], (t) => t * t * (3 - 2 * t));
  const white = tw(s, [EF.converge + 0.2, EF.end], [0, 1]);

  // total moves into the top window of the mark on converge
  const T0 = { x: 960, y: 300 + (190 - 300) * dock };
  const tgt0 = LOGO_WINDOWS[0];
  const tx = T0.x + (tgt0.x - T0.x) * conv;
  const ty = T0.y + (tgt0.y - T0.y) * conv;
  const tScale = (1 - 0.48 * dock) * (1 - conv * 0.97);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: ent }}>
      <LightStage glowX={0.5} glowY={0.4} intensity={1 - white} />
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 96 + dock * -30, display: "flex", justifyContent: "center", opacity: (1 - dock * 0.0) * (1 - tw(s, [EF.converge - 0.4, EF.converge], [0, 1])) }}>
        <Eyebrow n="₽" label="Эффект от внедрения единой системы" at={EF.in + 0.1} />
      </div>
      {/* the total */}
      <div style={{ position: "absolute", left: tx, top: ty, translate: "-50% -50%", scale: String(tScale), textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 210, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: conv > 0.5 ? C.orangeLogo : C.ink, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color: C.blue }}>≈</span> {num(total, 2)} <span style={{ fontSize: 120 }}>млрд ₽</span>
        </div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.muted, marginTop: 14 * (1 - dock), opacity: 1 - dock, height: (1 - dock) * 58, overflow: "hidden" }}>в год — экономия от единой системы и автоматизации</div>
        <div style={{ fontSize: 40, fontWeight: 650, color: C.muted, marginTop: 6, opacity: dock * (1 - conv), height: dock * 50 }}>в год</div>
      </div>

      {CARDS.map((c, i) => {
        const at = EF.cards + i * 0.14;
        const k = tw(s, [at, at + 0.8], [0, 1], EXPO);
        const cnt = tw(s, [at + 0.2, at + 1.6], [0, 1], OUT);
        const strike = tw(s, [at + 0.9, at + 1.3], [0, 1], INOUT);
        const cx = X0 + i * (CW + GAP) + CW / 2;
        const cy = CARD_Y + CARD_H / 2;
        const tg = LOGO_WINDOWS[i + 1];
        const delay = i * 0.05;
        const cv = tw(s, [EF.converge + delay, EF.end], [0, 1], (t) => t * t * (3 - 2 * t));
        const x = cx + (tg.x - cx) * cv;
        const y = cy + (tg.y - cy) * cv;
        const sc = (0.9 + 0.1 * k) * (1 - cv * 0.95);
        const hl = c.money ? tw(s, [EF.hold, EF.hold + 0.4, EF.hold + 1.8, EF.hold + 2.3], [0, 1, 1, 0]) : 0;
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: x - CW / 2,
              top: y - CARD_H / 2 + (1 - k) * 90,
              width: CW,
              height: CARD_H,
              scale: String(sc),
              opacity: Math.min(1, k * 1.5),
              borderRadius: 26 + cv * 20,
              background: cv > 0.35 ? C.orangeLogo : c.money ? C.blue : "#fff",
              color: c.money ? "#fff" : C.ink,
              padding: 28,
              boxSizing: "border-box",
              boxShadow: `0 40px 70px -36px rgba(0,2,48,0.45)${hl ? `, 0 0 0 ${4 * hl}px rgba(253,132,49,0.9), 0 0 ${60 * hl}px rgba(253,132,49,0.45)` : ""}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ opacity: 1 - tw(cv, [0, 0.3], [0, 1]), display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: c.money ? "rgba(255,255,255,0.75)" : C.muted }}>
                <span style={{ color: C.orange, fontVariantNumeric: "tabular-nums" }}>0{i + 1}</span>
                <span style={{ position: "relative", whiteSpace: "nowrap" }}>
                  Было: {c.was}
                  <span style={{ position: "absolute", left: 0, top: "52%", height: 2.5, width: `${strike * 100}%`, background: C.orange, borderRadius: 2 }} />
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: c.big(1).length > 5 ? 56 : 80, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{c.big(cnt)}</div>
              <div style={{ fontSize: 20, fontWeight: 650, marginTop: 8, opacity: 0.75 }}>{c.unit}</div>
              <div style={{ height: 1, background: c.money ? "rgba(255,255,255,0.2)" : C.lineSoft, margin: "22px 0 18px" }} />
              <div style={{ fontSize: 23, fontWeight: 750, lineHeight: 1.2 }}>{c.title}</div>
              <div style={{ fontSize: 16.5, marginTop: 8, opacity: 0.72, lineHeight: 1.3 }}>{c.why}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontSize: 19, color: C.faint, opacity: tw(s, [100.5, 101.2], [0, 1]) * (1 - tw(s, [EF.converge - 0.4, EF.converge], [0, 1])) }}>
        Оценка по дорожной карте: 8 млрд ₽ расходов на материалы и 450 млн ₽ на доставку в год
      </div>
    </AbsoluteFill>
  );
};
