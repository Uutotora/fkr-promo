import React from "react";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, tw, useFilmSec, useSec } from "../lib";
import { ICheck } from "../components/Icons";
import { BENTO, BENTO_R } from "../v3/AiBento";

/* v12 · all the ways AI works in the system, as two bento pages (same grid as v9):
   page 1 — checks (documents, nomenclature, auto-approval, anomalies, site photos);
   page 2 — people (citizens' requests, calls to contractors, meeting minutes, knowledge base, forecast). */

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

/* E1 — a site photo from technical supervision: the model checks the declared progress */
const Photo: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const scan = tw(s, [at + 0.3, at + 1.2], [0, 1], INOUT);
  const box = tw(s, [at + 0.9, at + 1.3], [0, 1], EXPO);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 116, bottom: 24, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 250, height: 160, borderRadius: 14, overflow: "hidden", background: "linear-gradient(180deg, #CFD9EE, #E9EEF8)" }}>
        {/* a facade, drawn: windows on a grid, scaffold on the left part */}
        {Array.from({ length: 24 }, (_, i) => <div key={i} style={{ position: "absolute", left: 18 + (i % 6) * 38, top: 16 + Math.floor(i / 6) * 34, width: 22, height: 20, borderRadius: 3, background: i % 6 < 4 ? "#9DB0D6" : "#C3CEE6" }} />)}
        <div style={{ position: "absolute", left: 10, top: 6, width: 150, height: 148, borderRadius: 4, background: "repeating-linear-gradient(90deg, rgba(253,132,49,0.45) 0 3px, transparent 3px 26px), repeating-linear-gradient(0deg, rgba(253,132,49,0.35) 0 3px, transparent 3px 34px)" }} />
        {scan > 0 && scan < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 70, translate: "-50% 0", background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(49,107,253,0.45), rgba(49,107,253,0))" }} />}
        <div style={{ position: "absolute", left: 8, top: 4, width: 156, height: 152, borderRadius: 6, boxShadow: `0 0 0 3px rgba(49,107,253,${box})`, opacity: box }} />
      </div>
      <div style={{ position: "absolute", left: 270, top: 6, display: "flex", flexDirection: "column", gap: 10, opacity: tw(s, [at + 1.1, at + 1.5], [0, 1]) }}>
        <div style={{ fontSize: 14, color: C.muted, fontWeight: 650 }}>заявлено подрядчиком</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, lineHeight: 1 }}>80%</div>
        <div style={{ fontSize: 14, color: C.muted, fontWeight: 650, marginTop: 4 }}>по фото</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.orange, lineHeight: 1 }}>64%</div>
      </div>
    </div>
  );
};

/* A2 — a citizen's request finds its house, system and contractor; the answer is drafted */
const Citizen: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const k = (d: number) => tw(s, [at + d, at + d + 0.45], [0, 1], EXPO);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 150, bottom: 40, fontFamily: FONT }}>
      <div style={{ padding: "18px 20px", borderRadius: 20, background: "rgba(255,255,255,0.95)", color: C.ink, fontSize: 18, lineHeight: 1.35, opacity: k(0.3), translate: `0 ${(1 - k(0.3)) * 20}px` }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.muted, letterSpacing: "0.04em" }}>ОБРАЩЕНИЕ · ЭЛЕКТРОННАЯ ПРИЁМНАЯ</div>
        <div style={{ marginTop: 8, fontWeight: 600 }}>«После ремонта отопления во 2-м подъезде холодные батареи. Нагорная, 20 к4»</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
        {["Дом · УНОМ 18542", "Отопление", "Подрядчик по договору", "Гарантийный случай"].map((c, i) => (
          <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 99, background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 17, fontWeight: 700, opacity: k(0.8 + i * 0.18), scale: String(0.85 + 0.15 * k(0.8 + i * 0.18)) }}>
            <ICheck size={15} color="#fff" stroke={3} /> {c}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12, color: "#fff", fontSize: 19, fontWeight: 700, opacity: k(1.7) }}>
        <span style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center" }}>✦</span>
        Проект ответа готов · срок — до 24.10
      </div>
    </div>
  );
};

/* B2 — the system calls the contractor and writes the answer into the task */
const Calls: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const film = useFilmSec();
  const k = tw(s, [at + 0.3, at + 0.8], [0, 1], EXPO);
  const t = tw(s, [at + 0.9, at + 1.4], [0, 1], EXPO);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 122, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3, height: 50, opacity: k }}>
        {Array.from({ length: 34 }, (_, i) => <div key={i} style={{ width: 6, borderRadius: 4, background: C.blue, opacity: 0.35 + 0.65 * Math.abs(Math.sin(i * 0.7)), height: 8 + 36 * Math.abs(Math.sin(i * 1.3 + film * 5)) * k }} />)}
      </div>
      <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: C.surface2, fontSize: 16, color: C.ink2, lineHeight: 1.35, opacity: t, translate: `0 ${(1 - t) * 10}px` }}>
        «Бригада будет на объекте 21.10 в 9:00»
        <div style={{ marginTop: 6, fontSize: 14, fontWeight: 750, color: C.green }}>записано в задачу · срок назначен</div>
      </div>
    </div>
  );
};

/* C2 — a meeting becomes minutes: decisions, assignments, deadlines */
const Minutes: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const rows = [["Решение", "поставка радиаторов 20.10"], ["Поручение", "ТУ ГАУ — проверить заявку"], ["Срок", "до 08.10"]];
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 124, fontFamily: FONT, display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(([a, b], i) => {
        const k = tw(s, [at + 0.4 + i * 0.22, at + 0.85 + i * 0.22], [0, 1], EXPO);
        return (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: 12, height: 40, padding: "0 14px", borderRadius: 12, background: C.surface2, opacity: k, translate: `${(1 - k) * 24}px 0`, fontSize: 16 }}>
            <span style={{ width: 96, fontWeight: 800, color: C.blue }}>{a}</span>
            <span style={{ color: C.ink2, fontWeight: 600, whiteSpace: "nowrap" }}>{b}</span>
          </div>
        );
      })}
    </div>
  );
};

/* D2 — answers from the Fund's own documents, with the source */
const Knowledge: React.FC<{ at: number }> = ({ at }) => {
  const s = useSec();
  const q = "Срок подачи заявки на поставку?";
  const n = Math.round(tw(s, [at + 0.3, at + 1.0], [0, q.length], (x) => x));
  const a = tw(s, [at + 1.1, at + 1.5], [0, 1], EXPO);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 124, fontFamily: FONT }}>
      <div style={{ height: 44, borderRadius: 14, background: C.surface2, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 16, fontWeight: 600, color: C.ink }}>{q.slice(0, n)}</div>
      <div style={{ marginTop: 12, fontSize: 16, color: C.ink2, lineHeight: 1.35, opacity: a, translate: `0 ${(1 - a) * 10}px` }}>
        Не позднее 10 рабочих дней до поставки
        <div style={{ display: "inline-flex", marginTop: 8, padding: "5px 10px", borderRadius: 9, background: C.blue50, color: C.blue, fontSize: 13.5, fontWeight: 750 }}>источник: Порядок ФКР · п. 4.2</div>
      </div>
    </div>
  );
};

type Card = { t: string; d: string; V: React.FC<{ at: number }>; hero?: boolean };
export const PAGE1: Card[] = [
  { t: "Автосверка документов", d: "УПД, ТТН, счета и М-15 сверяются сами", V: DocCheck, hero: true },
  { t: "Сопоставление номенклатуры", d: "БАРС, 1С, ТЭП и проект — одна позиция", V: Names },
  { t: "Автосогласование заявок", d: "сотрудник смотрит только отклонения", V: AutoApprove },
  { t: "Поиск аномалий", d: "повторные заявки, превышение норм", V: Anomaly },
  { t: "Фото технадзора", d: "процент выполнения — по снимкам", V: Photo },
];
export const PAGE2: Card[] = [
  { t: "Обращения граждан", d: "дом, система и исполнитель — сразу; ответ готов", V: Citizen, hero: true },
  { t: "ИИ-звонки подрядчикам", d: "ответ сохраняется в задаче", V: Calls },
  { t: "Протоколы встреч", d: "запись → решения, поручения, сроки", V: Minutes },
  { t: "База знаний", d: "ответы по документам Фонда — со ссылкой", V: Knowledge },
  { t: "Прогноз потребности", d: "риск срыва поставки — заранее", V: Forecast },
];

/** One bento page. `out` (0→1) sends the cards away; `hide` skips one card (it is morphing elsewhere). */
export const Bento12: React.FC<{ cards: Card[]; at: number; out: number; hide?: number; lift?: number }> = ({ cards, at, out, hide = -1, lift = -1 }) => {
  const s = useSec();
  const film = useFilmSec();
  return (
    <>
      {cards.map((c, i) => {
        const r = BENTO[i];
        const k = tw(s, [at + 0.25 + i * 0.09, at + 1.05 + i * 0.09], [0, 1], EXPO);
        const o = tw(out, [i * 0.06, 0.7 + i * 0.06], [0, 1], IN);
        if (k <= 0 || i === hide || o >= 1) return null;
        const float = Math.sin(film * 0.8 + i * 1.3) * 3;
        const hl = i === lift ? 1 : 0;
        return (
          <div key={c.t} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: BENTO_R, overflow: "hidden", background: c.hero ? `linear-gradient(160deg, #3D78FF, ${C.blue} 55%, #2557E0)` : "#fff", boxShadow: c.hero ? "0 50px 90px -40px rgba(49,107,253,0.75)" : hl ? "0 40px 80px -35px rgba(49,107,253,0.55), 0 0 0 2px rgba(49,107,253,0.35), 0 0 50px rgba(49,107,253,0.25)" : "0 40px 80px -45px rgba(0,2,48,0.4)", opacity: Math.min(1, k * 1.4) * (1 - o), translate: `0 ${(1 - k) * 60 - o * 50 + float}px`, scale: String((0.95 + 0.05 * k) * (1 - 0.04 * o) * (1 + 0.02 * hl)), filter: o > 0 ? `blur(${o * 6}px)` : undefined }}>
            <Head t={c.t} d={c.d} dark={c.hero} />
            <c.V at={at + 0.3 + i * 0.09} />
          </div>
        );
      })}
    </>
  );
};
