import React from "react";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, tw, useFilmSec, useSec } from "../lib";
import { ICheck } from "../components/Icons";

/* «ИИ берёт рутинные проверки на себя» as a bento: one hero card and four smaller ones,
   each with a small living picture of what the model does. */

type Rect = { x: number; y: number; w: number; h: number };
export const BENTO: Rect[] = [
  { x: 120, y: 300, w: 640, h: 640 }, // A · автосверка документов (hero)
  { x: 780, y: 300, w: 500, h: 310 }, // B · сопоставление номенклатуры
  { x: 1300, y: 300, w: 500, h: 310 }, // C · автосогласование заявок
  { x: 780, y: 630, w: 500, h: 310 }, // D · поиск аномалий
  { x: 1300, y: 630, w: 500, h: 310 }, // E · прогноз потребности → the marketplace
];
export const BENTO_R = 30;

const Head: React.FC<{ t: string; d: string; dark?: boolean }> = ({ t, d, dark }) => (
  <div style={{ position: "absolute", left: 30, top: 28, right: 30, fontFamily: FONT }}>
    <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.02em", color: dark ? "#fff" : C.ink }}>{t}</div>
    <div style={{ fontSize: 17, marginTop: 6, color: dark ? "rgba(255,255,255,0.78)" : C.muted, lineHeight: 1.3 }}>{d}</div>
  </div>
);

/* A — the document is read line by line; every field checks itself */
const DocCheck: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const scan = tw(s, [at + 0.3, at + 1.6], [0, 1], INOUT);
  const ROWS = ["Наименование", "Количество", "Цена", "Связь с поставкой"];
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 150, bottom: 40 }}>
      <div style={{ position: "absolute", left: 0, top: 10, width: 300, height: 400, borderRadius: 18, background: "#fff", boxShadow: "0 30px 60px -20px rgba(0,2,48,0.45)", rotate: "-3deg", overflow: "hidden", fontFamily: FONT, color: C.ink }}>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "0.06em" }}>УПД № 418</div>
          <div style={{ height: 1.5, background: C.ink, opacity: 0.1, margin: "12px 0 16px" }} />
          {[92, 70, 84, 60, 76, 52, 66].map((w, i) => (
            <div key={i} style={{ height: 9, width: `${w}%`, borderRadius: 9, background: C.ink, opacity: 0.08, marginTop: 15 }} />
          ))}
        </div>
        {/* the scan beam: light, not a line */}
        {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: -20, right: -20, top: `${scan * 100}%`, height: 90, translate: "0 -50%", background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(49,107,253,0.35), rgba(49,107,253,0))" }} />}
      </div>
      <div style={{ position: "absolute", left: 270, top: 70, display: "flex", flexDirection: "column", gap: 14 }}>
        {ROWS.map((r, i) => {
          const k = tw(s, [at + 0.6 + i * 0.28, at + 1.0 + i * 0.28], [0, 1], EXPO);
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 12, height: 56, padding: "0 20px 0 14px", borderRadius: 16, background: "rgba(255,255,255,0.16)", color: "#fff", fontFamily: FONT, fontSize: 20, fontWeight: 700, opacity: k, translate: `${(1 - k) * 30}px 0`, whiteSpace: "nowrap" }}>
              <span style={{ width: 30, height: 30, borderRadius: 99, background: "#fff", display: "grid", placeItems: "center", scale: String(0.6 + 0.4 * k) }}>
                <ICheck size={17} color={C.blue} stroke={3} />
              </span>
              {r}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* B — three spellings slide into one catalogue position */
const Names: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const m = tw(s, [at + 0.9, at + 1.6], [0, 1], INOUT);
  const N = ["Радиатор биметалл. 10 с.", "Радиатор БМ 10 секций", "Радиатор 10-секц."];
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 128, bottom: 26, fontFamily: FONT }}>
      {N.map((n, i) => {
        const k = tw(s, [at + 0.3 + i * 0.12, at + 0.8 + i * 0.12], [0, 1], EXPO);
        return (
          <div key={n} style={{ position: "absolute", left: 0, top: i * 50, width: 230, height: 40, borderRadius: 12, background: C.surface2, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 15, fontWeight: 650, color: C.ink2, whiteSpace: "nowrap", opacity: k * (1 - tw(m, [0.2, 0.9], [0, 1])), translate: `${m * 70}px ${(1 - k) * 12 + m * (50 - i * 50)}px` }}>
            {n}
          </div>
        );
      })}
      <svg width={440} height={160} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M 232 ${20 + i * 50} C 280 ${20 + i * 50}, 280 70, 318 70`} fill="none" stroke={C.blue} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tw(s, [at + 0.7 + i * 0.08, at + 1.2 + i * 0.08], [0, 1], INOUT)} opacity={1 - m} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 318, top: 46, height: 48, padding: "0 16px", borderRadius: 14, background: C.blue, color: "#fff", display: "flex", alignItems: "center", fontSize: 17, fontWeight: 800, boxShadow: "0 14px 30px -12px rgba(49,107,253,0.7)", opacity: tw(s, [at + 1.05, at + 1.35], [0, 1]), scale: String(0.85 + 0.15 * tw(s, [at + 1.05, at + 1.5], [0, 1], EXPO)) }}>
        ТМЦ-000317
      </div>
    </div>
  );
};

/* C — requests pass by themselves; only the deviation goes to a person */
const AutoApprove: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const ROWS = ["З-2026-0201", "З-2026-0198", "З-2026-0194", "З-2026-0190"];
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 126, fontFamily: FONT }}>
      {ROWS.map((r, i) => {
        const k = tw(s, [at + 0.35 + i * 0.16, at + 0.75 + i * 0.16], [0, 1], EXPO);
        const dev = i === 1;
        return (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 12, height: 36, marginBottom: 6, opacity: k, translate: `0 ${(1 - k) * 10}px`, fontSize: 16, fontWeight: 650, color: C.ink2 }}>
            <span style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", background: dev ? C.orange50 : C.green50 }}>
              {dev ? <span style={{ width: 8, height: 8, borderRadius: 9, background: C.orange }} /> : <ICheck size={14} color={C.green} stroke={3} />}
            </span>
            <span style={{ width: 130 }}>{r}</span>
            <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 750, color: dev ? C.orange : C.green }}>{dev ? "отклонение → сотруднику" : "согласовано"}</span>
          </div>
        );
      })}
    </div>
  );
};

/* D — one bar is not like the others */
const Anomaly: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const V = [0.32, 0.4, 0.28, 0.36, 0.44, 0.3, 1, 0.38, 0.34];
  return (
    <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 150, display: "flex", alignItems: "flex-end", gap: 12 }}>
      {V.map((v, i) => {
        const k = tw(s, [at + 0.3 + i * 0.05, at + 0.9 + i * 0.05], [0, 1], OUT);
        const hot = v === 1;
        return (
          <div key={i} style={{ position: "relative", flex: 1, height: `${v * 100 * k}%`, borderRadius: 8, background: hot ? "#E5484D" : C.blue100, boxShadow: hot ? "0 0 30px rgba(229,72,77,0.45)" : undefined }}>
            {hot && <div style={{ position: "absolute", left: "50%", top: -40, translate: "-50% 0", padding: "4px 10px", borderRadius: 8, background: "#E5484D", color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", opacity: tw(s, [at + 1.2, at + 1.5], [0, 1]) }}>повторная заявка</div>}
          </div>
        );
      })}
    </div>
  );
};

/* E — the need, a step ahead: the line continues as a forecast and warns early */
const Forecast: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const draw = tw(s, [at + 0.3, at + 1.2], [0, 1], INOUT);
  const fc = tw(s, [at + 1.1, at + 1.7], [0, 1], INOUT);
  const real = "M 0 120 C 50 110, 90 96, 140 100 S 220 70, 260 74";
  const fore = "M 260 74 C 300 78, 340 40, 420 26";
  return (
    <svg width={440} height={150} style={{ position: "absolute", left: 30, bottom: 26, overflow: "visible" }}>
      <path d={real} fill="none" stroke={C.blue} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <path d={fore} fill="none" stroke={C.orange} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" opacity={fc} />
      <circle cx={420} cy={26} r={8} fill={C.orange} opacity={fc} style={{ filter: "drop-shadow(0 0 10px rgba(253,132,49,0.8))" }} />
      <text x={410} y={64} textAnchor="end" fontFamily={FONT} fontSize={15} fontWeight={800} fill={C.orange} opacity={fc}>
        риск срыва поставки
      </text>
    </svg>
  );
};

export const AiBento: React.FC<{ at: number; away: number; hideE: boolean }> = ({ at, away, hideE }) => {
  const s = useSec();
  const film = useFilmSec();
  const cards: { t: string; d: string; V: React.FC<{ at: number }>; hero?: boolean }[] = [
    { t: "Автосверка документов", d: "УПД, ТТН, счета и М-15 сверяются сами", V: DocCheck, hero: true },
    { t: "Сопоставление номенклатуры", d: "БАРС, 1С, ТЭП и проект — одна позиция", V: Names },
    { t: "Автосогласование заявок", d: "сотрудник смотрит только отклонения", V: AutoApprove },
    { t: "Поиск аномалий", d: "повторные заявки, превышение норм", V: Anomaly },
    { t: "Прогноз потребности", d: "риск срыва поставки — заранее", V: Forecast },
  ];
  return (
    <>
      {cards.map((c, i) => {
        const r = BENTO[i];
        const k = tw(s, [at + 0.25 + i * 0.09, at + 1.05 + i * 0.09], [0, 1], EXPO);
        const out = tw(s, [84.45 + i * 0.03, 84.8 + i * 0.03], [0, 1], IN) * away;
        if (k <= 0 || (i === 4 && hideE)) return null;
        const float = Math.sin(film * 0.8 + i * 1.3) * 3;
        return (
          <div key={c.t} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: BENTO_R, overflow: "hidden", background: c.hero ? `linear-gradient(160deg, #3D78FF, ${C.blue} 55%, #2557E0)` : "#fff", boxShadow: c.hero ? "0 50px 90px -40px rgba(49,107,253,0.75)" : "0 40px 80px -45px rgba(0,2,48,0.4)", opacity: Math.min(1, k * 1.4) * (1 - out), translate: `0 ${(1 - k) * 60 + out * 60 + float}px`, scale: String(0.95 + 0.05 * k) }}>
            <Head t={c.t} d={c.d} dark={c.hero} />
            <c.V at={at + 0.3 + i * 0.09} />
          </div>
        );
      })}
    </>
  );
};
