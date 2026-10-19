import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useFilmSec, useSec } from "../lib";
import { HOME, WIN_W, WIN_H } from "../components/AppWindow";
import { Eyebrow, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { LogoMark } from "../components/Logo";
import { Cursor } from "../components/Cursor";
import { ICheck, IHouse, IFile, ISign, IBox, ITrend, ITable, IShield, ICalendar } from "../components/Icons";

/* v12 · «Весь цикл — в одной системе»: the whole capital-repair cycle played fast (time-lapse),
   then back to one stage — the material request — where a push «Пора подавать заявку» arrives;
   the push opens into the ТМЦ window (flat at HOME, where Tmc12 starts). Local clock 0 → CYCLE_END. */

const STAGES = [
  { n: "Программа", Icon: IHouse },
  { n: "Обследование и ПСД", Icon: IFile },
  { n: "Договор", Icon: ISign },
  { n: "Заявка на ТМЦ", Icon: IBox },
  { n: "Поставка", Icon: ITable },
  { n: "Работы", Icon: ITrend },
  { n: "Приёмка", Icon: IShield },
  { n: "Оплата и субсидия", Icon: ICalendar },
];
const RUN0 = 1.5;
const DWELL = 0.62;
const reach = (i: number) => RUN0 + i * DWELL;
const BACK = reach(7) + 0.75; // the light returns to «Заявка на ТМЦ»
const PUSH = BACK + 0.95;
const CLICK = PUSH + 1.55;
const OPEN = CLICK + 0.15;
export const CYCLE_END = OPEN + 0.9;

const RAIL = { x0: 230, x1: 1690, y: 830 };
const nodeX = (i: number) => RAIL.x0 + ((RAIL.x1 - RAIL.x0) / 7) * i;
const CARD = { x: 960, y: 470, w: 940, h: 360 };
const WIN = { x: HOME.x, y: HOME.y, w: WIN_W * HOME.s, h: WIN_H * HOME.s };
const PUSH_R = { x: 960, y: 150, w: 640, h: 140 };

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const Chip: React.FC<{ tone?: "blue" | "green" | "orange" | "grey"; children: React.ReactNode }> = ({ tone = "blue", children }) => {
  const m = { blue: [C.blue50, C.blue], green: [C.green50, C.green], orange: [C.orange50, "#C4520F"], grey: ["#EEEFF3", C.muted] }[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 99, background: m[0], color: m[1], fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
};
const Bars: React.FC<{ v: number[]; hi?: number }> = ({ v, hi = v.length - 1 }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
    {v.map((x, i) => <div key={i} style={{ width: 26, height: 120 * x, borderRadius: 9, background: i === hi ? C.orange : C.blue }} />)}
  </div>
);
const Doc: React.FC<{ t: string; ok?: boolean }> = ({ t, ok = true }) => (
  <div style={{ width: 150, height: 120, borderRadius: 16, background: C.surface2, padding: 14, boxSizing: "border-box", position: "relative" }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{t}</div>
    {[0, 1, 2].map((q) => <div key={q} style={{ height: 6, borderRadius: 9, background: C.ink, opacity: 0.07, marginTop: 10, width: `${80 - q * 18}%` }} />)}
    {ok && <div style={{ position: "absolute", right: 10, bottom: 10, width: 28, height: 28, borderRadius: 99, background: C.green, display: "grid", placeItems: "center" }}><ICheck size={16} color="#fff" stroke={3} /></div>}
  </div>
);

/** What each stage looks like inside the system — a glimpse, not a screen to read. */
const Glimpse: React.FC<{ i: number }> = ({ i }) => {
  const head = (sub: string, chip: React.ReactNode) => {
    const S = STAGES[i];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 58, height: 58, borderRadius: 99, background: C.blue50, display: "grid", placeItems: "center" }}><S.Icon size={28} color={C.blue} /></div>
        <div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>{S.n}</div>
          <div style={{ fontSize: 18, color: C.muted, marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>{chip}</div>
      </div>
    );
  };
  const body: React.ReactNode[] = [
    <>
      {head("Программа 2026 · 127 домов", <Chip>12 округов</Chip>)}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 40 }}>
        <Bars v={[0.2, 0.32, 0.45, 0.6, 0.74, 0.9]} />
        <div><div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1 }}>39 <span style={{ fontSize: 30, color: C.muted }}>из 127</span></div><div style={{ fontSize: 19, color: C.muted, marginTop: 8 }}>домов завершено</div></div>
      </div>
    </>,
    <>
      {head("ул. Нагорная, д. 20, корп. 4", <Chip tone="green"><ICheck size={15} color={C.green} stroke={3} /> МГЭ согласовано</Chip>)}
      <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
        {["ПСД v1", "ПСД v2", "ПСД v3"].map((v, j) => (
          <div key={v} style={{ flex: 1, height: 170, borderRadius: 20, background: j === 2 ? C.blue : C.surface2, color: j === 2 ? "#fff" : C.ink2, padding: 20, boxSizing: "border-box" }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{v}</div>
            <div style={{ fontSize: 16, opacity: 0.75, marginTop: 6 }}>{["замечания", "исправлено", "утверждена"][j]}</div>
          </div>
        ))}
      </div>
    </>,
    <>
      {head("ПКРД-002047-25 · подряд", <Chip tone="green">Действует</Chip>)}
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[["Сроки", "01.04 — 30.11.2026"], ["Аванс", "зачтён"], ["Гарантия", "60 мес."], ["Поставка ДМ", "Д015-2025"]].map(([a, b]) => (
          <div key={a} style={{ padding: "16px 20px", borderRadius: 16, background: C.surface2 }}><div style={{ fontSize: 16, color: C.muted }}>{a}</div><div style={{ fontSize: 23, fontWeight: 750, color: C.ink, marginTop: 4 }}>{b}</div></div>
        ))}
      </div>
    </>,
    <>
      {head("Радиатор биметаллический · 10 шт.", <Chip tone="green"><ICheck size={15} color={C.green} stroke={3} /> По смете</Chip>)}
      <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
        {[["Смета", "10 шт."], ["Лимит первой части", "30%"], ["Поставка", "20.10"]].map(([a, b]) => (
          <div key={a} style={{ flex: 1, padding: "20px 22px", borderRadius: 18, background: C.surface2 }}><div style={{ fontSize: 17, color: C.muted }}>{a}</div><div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: C.ink, marginTop: 6 }}>{b}</div></div>
        ))}
      </div>
    </>,
    <>
      {head("АО «САНТЕХПРОМ» · договор Д015-2025", <Chip tone="orange">20.10 · 10:00</Chip>)}
      <div style={{ display: "flex", gap: 18, marginTop: 40 }}><Doc t="УПД" /><Doc t="ТТН" /><Doc t="Разнарядка" /></div>
    </>,
    <>
      {head("Отопление · фасад · кровля", <Chip>Готовность 64%</Chip>)}
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
        {[[0, 0.72, 0.64], [0.15, 0.62, 0.82], [0.4, 0.95, 0.46]].map(([a, b, p], j) => (
          <div key={j} style={{ position: "relative", height: 40, borderRadius: 12, background: C.surface2 }}>
            <div style={{ position: "absolute", left: `${a * 100}%`, width: `${(b - a) * 100}%`, height: 40, borderRadius: 12, background: "#E3E9F8" }} />
            <div style={{ position: "absolute", left: `${a * 100}%`, width: `${(b - a) * p * 100}%`, height: 40, borderRadius: 12, background: C.blue }} />
          </div>
        ))}
      </div>
    </>,
    <>
      {head("Комплект к приёмке", <Chip tone="green">Согласован</Chip>)}
      <div style={{ display: "flex", gap: 18, marginTop: 40 }}><Doc t="КС-2" /><Doc t="КС-3" /><Doc t="М-15" /><Doc t="Ф-5" /></div>
    </>,
    <>
      {head("Статусы из 1С · пакет на субсидию", <Chip tone="green">Оплачено</Chip>)}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 40 }}>
        <Bars v={[0.35, 0.5, 0.66, 0.84]} hi={3} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><Chip tone="green"><ICheck size={15} color={C.green} stroke={3} /> Аванс зачтён</Chip><Chip tone="green"><ICheck size={15} color={C.green} stroke={3} /> Пакет УТН собран</Chip></div>
      </div>
    </>,
  ];
  return <div style={{ position: "absolute", inset: 0, padding: "34px 40px", boxSizing: "border-box", fontFamily: FONT }}>{body[i]}</div>;
};

export const Cycle: React.FC = () => {
  const s = useSec();
  const film = useFilmSec();
  // which stage the card shows
  let cur = 0;
  for (let i = 0; i < 8; i++) if (s >= reach(i) - 0.12) cur = i;
  if (s >= BACK) cur = 3;
  const swapAt = s >= BACK ? BACK : reach(cur) - 0.12;
  const swap = tw(s, [swapAt, swapAt + 0.32], [0, 1], OUT);
  // the object window (Objects12 ends at HOME) becomes the card
  const born = tw(s, [0, 0.9], [0, 1], INOUT);
  const open = tw(s, [OPEN, OPEN + 0.85], [0, 1], INOUT);
  const fadeAll = tw(s, [OPEN, OPEN + 0.5], [0, 1]);
  const card = { x: lerp(WIN.x, CARD.x, born), y: lerp(WIN.y, CARD.y, born), w: lerp(WIN.w, CARD.w, born), h: lerp(WIN.h, CARD.h, born) };
  const railK = tw(s, [0.6, 1.4], [0, 1], INOUT);
  // the light: runs fast along the rail, then comes back to the request
  const runK = tw(s, [RUN0, reach(7)], [0, 7], (x) => x);
  const backK = tw(s, [BACK - 0.6, BACK], [0, 1], INOUT);
  const lightI = s < BACK - 0.6 ? runK : lerp(7, 3, backK);
  const ff = tw(s, [RUN0 - 0.2, RUN0 + 0.2], [0, 1]) * (1 - tw(s, [reach(7) + 0.2, reach(7) + 0.6], [0, 1]));
  const focus4 = tw(s, [BACK - 0.2, BACK + 0.4], [0, 1], EXPO) * (1 - fadeAll);
  // push notification
  const pk = tw(s, [PUSH, PUSH + 0.55], [0, 1], EXPO);
  const hover = tw(s, [CLICK - 0.5, CLICK - 0.25], [0, 1]);
  const press = tw(s, [CLICK - 0.06, CLICK + 0.06, CLICK + 0.25], [0, 1, 0]);
  const pr = { x: lerp(PUSH_R.x, WIN.x, open), y: lerp(PUSH_R.y, WIN.y, open), w: lerp(PUSH_R.w, WIN.w, open), h: lerp(PUSH_R.h, WIN.h, open) };
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage glowX={0.5} glowY={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: 1 - tw(s, [PUSH - 0.35, PUSH + 0.05], [0, 1]), filter: `blur(${tw(s, [PUSH - 0.35, PUSH + 0.05], [0, 6])}px)` }}>
        <Eyebrow n="03" label="Весь цикл ремонта" at={0.35} />
        <Rise text="От программы до оплаты — в одной системе" at={0.45} size={56} weight={780} highlight={["одной", "системе"]} center />
      </div>
      {/* the card: one stage at a time */}
      {s < OPEN + 0.5 && (
        <div style={{ position: "absolute", left: card.x - card.w / 2, top: card.y - card.h / 2, width: card.w, height: card.h, borderRadius: lerp(26, 30, born), background: "#fff", boxShadow: "0 50px 100px -40px rgba(0,2,48,0.35), 0 0 0 1px rgba(0,2,48,0.04)", overflow: "hidden", opacity: 1 - fadeAll, scale: String(1 + focus4 * 0.02) }}>
          <div style={{ position: "absolute", inset: 0, opacity: tw(s, [0.7, 1.1], [0, 1]) }}>
            {cur > 0 && swap < 1 && <div style={{ position: "absolute", inset: 0, opacity: 1 - swap, translate: `${-swap * 40}px 0`, filter: `blur(${swap * 6}px)` }}><Glimpse i={s >= BACK && swap < 1 ? 7 : Math.max(0, cur - 1)} /></div>}
            <div style={{ position: "absolute", inset: 0, opacity: cur === 0 ? 1 : swap, translate: `${(1 - (cur === 0 ? 1 : swap)) * 40}px 0`, filter: swap < 1 && cur > 0 ? `blur(${(1 - swap) * 6}px)` : undefined }}><Glimpse i={cur} /></div>
          </div>
          {/* time-lapse badge */}
          <div style={{ position: "absolute", right: 22, bottom: 20, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 99, background: C.ink, color: "#fff", fontSize: 15, fontWeight: 700, opacity: ff }}>
            <svg width={18} height={14} viewBox="0 0 18 14"><path d="M1 1 L8 7 L1 13 Z M9 1 L16 7 L9 13 Z" fill="#fff" /></svg>
            ускоренно
          </div>
        </div>
      )}
      {/* the rail of the cycle */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - fadeAll }}>
        <line x1={RAIL.x0} y1={RAIL.y} x2={lerp(RAIL.x0, RAIL.x1, railK)} y2={RAIL.y} stroke="#E1E5EF" strokeWidth={6} strokeLinecap="round" />
        <line x1={RAIL.x0} y1={RAIL.y} x2={nodeX(0) + (nodeX(1) - nodeX(0)) * Math.min(7, s < BACK - 0.6 ? runK : 7)} y2={RAIL.y} stroke={C.blue} strokeWidth={6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(49,107,253,0.5))" }} />
      </svg>
      {STAGES.map((st, i) => {
        const k = tw(s, [0.8 + i * 0.06, 1.3 + i * 0.06], [0, 1], EXPO) * (1 - fadeAll);
        const done = s >= reach(i);
        const isReq = i === 3;
        const glowReq = isReq ? focus4 : 0;
        return (
          <div key={st.n} style={{ position: "absolute", left: nodeX(i), top: RAIL.y, opacity: k }}>
            {glowReq > 0 && <div style={{ position: "absolute", left: -70, top: -70, width: 140, height: 140, borderRadius: 99, background: `radial-gradient(closest-side, rgba(49,107,253,${0.4 * glowReq}), rgba(49,107,253,0))`, scale: String(0.9 + 0.15 * Math.sin(film * 4)) }} />}
            <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: 99, background: done ? C.blue : "#fff", boxShadow: done ? "0 10px 24px -10px rgba(49,107,253,0.8)" : "inset 0 0 0 3px #DDE1EC", display: "grid", placeItems: "center", scale: String(done ? 0.85 + 0.15 * Math.max(0.2, pop(s, reach(i), 0.45)) + glowReq * 0.25 : 0.85) }}>
              {done ? <ICheck size={24} color="#fff" stroke={3} /> : <div style={{ width: 12, height: 12, borderRadius: 99, background: "#DDE1EC" }} />}
            </div>
            <div style={{ position: "absolute", left: -110, width: 220, top: 46, textAlign: "center", fontSize: 19, fontWeight: isReq && glowReq > 0.3 ? 800 : 650, color: isReq && glowReq > 0.3 ? C.blue : done ? C.ink : C.muted, whiteSpace: "nowrap" }}>{st.n}</div>
          </div>
        );
      })}
      {/* the light on the rail */}
      {s > RUN0 - 0.1 && s < OPEN && (
        <div style={{ position: "absolute", left: lerp(RAIL.x0, RAIL.x1, lightI / 7), top: RAIL.y, opacity: 1 - fadeAll }}>
          <div style={{ position: "absolute", left: -46, top: -46, width: 92, height: 92, borderRadius: 99, background: "radial-gradient(closest-side, rgba(49,107,253,0.55), rgba(49,107,253,0))" }} />
          <div style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: 99, background: "#fff", boxShadow: `0 0 0 4px ${C.blue}, 0 0 18px rgba(49,107,253,0.9)` }} />
        </div>
      )}
      {/* «Пора подавать заявку» — a push that opens into the request window */}
      {pk > 0 && (
        <div style={{ position: "absolute", left: pr.x - pr.w / 2, top: pr.y - pr.h / 2, width: pr.w, height: pr.h, borderRadius: lerp(26, 26 * HOME.s, open), background: open > 0 ? `rgb(${Math.round(lerp(255, 243, open))},${Math.round(lerp(255, 243, open))},${Math.round(lerp(255, 243, open))})` : "rgba(255,255,255,0.96)",
          boxShadow: `0 30px 70px -20px rgba(0,2,48,${0.35 + 0.15 * hover}), 0 0 0 ${hover * 2}px rgba(49,107,253,${0.25 * hover}), 0 0 ${40 * hover}px rgba(49,107,253,${0.25 * hover})`, opacity: Math.min(1, pk * 1.4), translate: `0 ${(1 - pk) * -90}px`, scale: String(1 - press * 0.03), overflow: "hidden", backdropFilter: "blur(20px)" }}>
          <div style={{ position: "absolute", left: 24, top: 22, right: 24, display: "flex", gap: 16, opacity: 1 - tw(open, [0, 0.35], [0, 1]) }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: "#fff", boxShadow: "0 0 0 1px rgba(0,2,48,0.06)", display: "grid", placeItems: "center", flex: "none" }}><LogoMark size={34} strokeW={4} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", fontSize: 15, color: C.muted, fontWeight: 600 }}><span>ФКР · Учёт ТМЦ</span><span style={{ marginLeft: "auto" }}>сейчас</span></div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginTop: 4 }}>Пора подавать заявку</div>
              <div style={{ fontSize: 17, color: C.ink2, marginTop: 4, lineHeight: 1.3 }}>Радиаторы на Нагорную, 20 к4 — поставка 20.10, подать до 06.10</div>
            </div>
          </div>
        </div>
      )}
      <Cursor keys={[[PUSH + 0.2, 1400, 760], [CLICK - 0.3, PUSH_R.x + 250, PUSH_R.y - 30], [CLICK + 0.6, PUSH_R.x + 270, PUSH_R.y - 20]]} clicks={[CLICK]} show={[PUSH + 0.2, OPEN + 0.3]} />
    </AbsoluteFill>
  );
};

export const _cycleKeys = { PUSH, CLICK, OPEN, BACK, reach: reach(7), IN };
