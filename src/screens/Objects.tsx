import React from "react";
import { C, glow } from "../theme";
import { EXPO, IN, OUT, clamp01, tw, useSec } from "../lib";
import { Chip, Card } from "./Dashboard";
import { ISearch, IPlus, IFilter, IDownload, ICheck, IChevron, IPencil, IBox, IArrowR } from "../components/Icons";

const ROWS = [
  { a: "ул. Нагорная, д. 20, корп. 4", m: "ЮЗАО · Котловка · УНОМ 18542", w: "Фасад, кровля, отопление", c: "ООО «Городские системы»", st: ["В работе", "blue"], g: 64, d: "30.11.2026", k: ["Заявка с замечаниями", "red"] },
  { a: "Варшавское ш., д. 152, корп. 8", m: "ЮАО · Чертаново Южное · УНОМ 23876", w: "Фасад, ХВС, ГВС", c: "ООО «Стройпроект»", st: ["В работе", "blue"], g: 82, d: "30.10.2026", k: ["Ожидается поставка", "amber"] },
  { a: "Абрамцевская ул., д. 7, корп. 2", m: "СВАО · Лианозово · УНОМ 30817", w: "Кровля, электроснабжение", c: "ООО «Городские системы»", st: ["В работе", "blue"], g: 35, d: "15.12.2026", k: ["Заявка с замечаниями", "red"] },
  { a: "Ленская ул., д. 32", m: "СВАО · Бабушкинский · УНОМ 19670", w: "Фасад, отопление", c: "ООО «Ремстрой»", st: ["Проектирование", "gray"], g: 18, d: "30.03.2027", k: ["Без отклонений", "green"] },
  { a: "Большая Марфинская ул., д. 9", m: "СВАО · Марфино · УНОМ 17863", w: "Лифты, подъезды", c: "ООО «Стройпроект»", st: ["Приемка", "amber"], g: 100, d: "30.09.2026", k: ["Комплект документов", "blue"] },
  { a: "Туманова пл., д. 2, корп. 2", m: "СВАО · Северное Медведково · УНОМ 28761", w: "Кровля, водоотведение", c: "ООО «Ремстрой»", st: ["Завершен", "green"], g: 100, d: "30.08.2026", k: ["Без отклонений", "green"] },
] as const;

export const ROW_H = 78;
const COLS = [330, 270, 150, 200, 130, 220];

/** Objects registry (content area). */
export const ObjectsList: React.FC<{ rows: number[]; typeTimes: number[]; query: string; filterAt: number; pressRow?: number }> = ({ rows, typeTimes, query, filterAt, pressRow }) => {
  const s = useSec();
  const typed = query.slice(0, typeTimes.filter((t) => s >= t).length);
  const focused = s >= typeTimes[0] - 0.4;
  const fk = tw(s, [filterAt, filterAt + 0.55], [0, 1], EXPO);
  const press = pressRow === undefined ? 0 : tw(s, [pressRow - 0.05, pressRow + 0.1, pressRow + 0.4], [0, 1, 0.6]);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "26px 30px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, height: 50 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>Объекты ремонта</div>
        <div style={{ fontSize: 15.5, color: C.muted, flex: 1 }}>Программа 2026 · средняя готовность 67%</div>
        <div
          style={{
            width: 380,
            height: 46,
            borderRadius: 12,
            background: C.surface,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            boxSizing: "border-box",
            boxShadow: focused ? `0 0 0 2px ${C.blue}, 0 0 0 6px rgba(49,107,253,0.15)` : `inset 0 0 0 1px ${C.line}`,
            fontSize: 16,
          }}
        >
          <ISearch size={18} color={focused ? C.blue : C.muted} />
          {typed ? (
            <span style={{ fontWeight: 600 }}>
              {typed}
              <span style={{ display: "inline-block", width: 2, height: 20, background: C.blue, marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 3) % 2 ? 1 : 0.2 }} />
            </span>
          ) : (
            <span style={{ color: C.faint }}>Адрес, УНОМ, подрядчик или договор</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.blue, color: "#fff", height: 46, padding: "0 18px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
          <IPlus size={17} color="#fff" /> Добавить объект
        </div>
      </div>

      <Card style={{ marginTop: 22, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 18px" }}>
          {[
            ["Все", 6, 1],
            ["В работе", 3, 3],
            ["Проектирование", 1, 0],
            ["Приемка", 1, 0],
            ["Завершены", 1, 0],
          ].map(([l, n, n2], i) => {
            const on = i === 0;
            const num = fk > 0.5 ? n2 : n;
            return (
              <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 9, height: 38, padding: "0 14px", borderRadius: 10, background: on ? glow : "transparent", fontSize: 15, fontWeight: on ? 700 : 500, color: on ? C.ink : C.muted }}>
                {l}
                <span style={{ minWidth: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, background: on ? "#fff" : "transparent", color: on ? C.blue : C.faint }}>{num}</span>
              </div>
            );
          })}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 15 }}>
            <IFilter size={16} /> Фильтры
          </div>
          <div style={{ width: 16 }} />
          <IDownload size={18} color={C.muted} />
        </div>
        <div style={{ display: "flex", padding: "0 20px", height: 44, alignItems: "center", fontSize: 13.5, fontWeight: 600, color: C.muted, background: C.surface2 }}>
          {["Объект / адрес", "Работы / подрядчик", "Статус", "Готовность", "Срок", "Контроль"].map((h, i) => (
            <div key={h} style={{ width: COLS[i] }}>{h}</div>
          ))}
        </div>
        {ROWS.map((r, i) => {
          const k = tw(s, [rows[i], rows[i] + 0.6], [0, 1], EXPO);
          const gone = i === 0 ? 0 : fk;
          const h = ROW_H * (1 - gone);
          const bar = tw(s, [rows[i] + 0.15, rows[i] + 1.1], [0, r.g / 100], OUT);
          const isHit = i === 0 && fk > 0;
          return (
            <div
              key={r.a}
              style={{
                height: h,
                overflow: "hidden",
                opacity: Math.min(1, k * 1.4) * (1 - gone),
                translate: `${(1 - k) * 60}px 0`,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                fontSize: 15,
                background: i === 0 && press > 0 ? `rgba(221,230,255,${press * 0.8})` : "transparent",
              }}
            >
              <div style={{ width: COLS[0] }}>
                <div style={{ fontWeight: 700, color: C.blue, fontSize: 16 }}>
                  {isHit ? (
                    <>
                      ул.{" "}
                      <span style={{ background: `rgba(253,132,49,${0.25 * fk})`, borderRadius: 4, padding: "0 2px", color: C.blue700 }}>Нагорная</span>, д. 20, корп. 4
                    </>
                  ) : (
                    r.a
                  )}
                </div>
                <div style={{ color: C.muted, fontSize: 13.5, marginTop: 3 }}>{r.m}</div>
              </div>
              <div style={{ width: COLS[1] }}>
                <div style={{ fontWeight: 550 }}>{r.w}</div>
                <div style={{ color: C.muted, fontSize: 13.5, marginTop: 3 }}>{r.c}</div>
              </div>
              <div style={{ width: COLS[2] }}>
                <Chip tone={r.st[1] as never}>{r.st[0]}</Chip>
              </div>
              <div style={{ width: COLS[3], display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 100, height: 7, borderRadius: 99, background: C.lineSoft }}>
                  <div style={{ width: `${bar * 100}%`, height: 7, borderRadius: 99, background: r.g === 100 ? C.green : C.blue }} />
                </div>
                <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.round(bar * 100)}%</span>
              </div>
              <div style={{ width: COLS[4], fontWeight: 500 }}>{r.d}</div>
              <div style={{ width: COLS[5] }}>
                <Chip tone={r.k[1] as never}>{r.k[0]}</Chip>
              </div>
            </div>
          );
        })}
        <div style={{ height: 14 }} />
      </Card>
    </div>
  );
};

/* ------------ object card ------------ */

export const OBJ_TABS = [
  ["Паспорт", 98],
  ["Виды работ", 124],
  ["ТЭП и объемы", 146],
  ["Ход работ", 112],
  ["Документы", 124],
  ["КС-2", 76],
  ["Диаграмма Ганта", 170],
] as const;
/** x centre (content coordinates) of each section tab */
export const objTabX = (i: number) => 30 + 8 + OBJ_TABS.slice(0, i).reduce((a, [, w]) => a + w + 4, 0) + OBJ_TABS[i][1] / 2;
export const OBJ_TABS_Y = 26 + 92 + 18 + 28;

const Field: React.FC<{ l: string; v: string; at: number; i: number }> = ({ l, v, at, i }) => {
  const s = useSec();
  const k = tw(s, [at + i * 0.035, at + 0.5 + i * 0.035], [0, 1], EXPO);
  return (
    <div style={{ padding: "13px 0", opacity: k, translate: `0 ${(1 - k) * 14}px` }}>
      <div style={{ fontSize: 13.5, color: C.muted }}>{l}</div>
      <div style={{ fontSize: 16.5, fontWeight: 650, marginTop: 5 }}>{v}</div>
    </div>
  );
};

const GANTT = [
  { n: "Ремонт фасада", d: "01.04.2026 — 30.10.2026", a: 0, b: 6.97, p: 64 },
  { n: "Ремонт кровли", d: "10.05.2026 — 15.10.2026", a: 1.3, b: 6.48, p: 82 },
  { n: "Ремонт системы отопления", d: "01.08.2026 — 15.11.2026", a: 4.0, b: 7.48, p: 46 },
];
const MONTHS = ["Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя"];

export const Gantt: React.FC<{ bars: number[] }> = ({ bars }) => {
  const s = useSec();
  const W = 860;
  const mw = W / 8;
  return (
    <Card style={{ marginTop: 18, padding: "22px 26px 26px" }}>
      <div style={{ fontSize: 20, fontWeight: 750 }}>План-график выполнения работ</div>
      <div style={{ display: "flex", marginTop: 20 }}>
        <div style={{ width: 300 }} />
        <div style={{ display: "flex", width: W }}>
          {MONTHS.map((m) => (
            <div key={m} style={{ width: mw, fontSize: 13.5, color: C.muted, fontWeight: 600 }}>{m}</div>
          ))}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        {GANTT.map((g, i) => {
          const k = tw(s, [bars[i], bars[i] + 0.9], [0, 1], EXPO);
          const f = tw(s, [bars[i] + 0.35, bars[i] + 1.5], [0, g.p / 100], OUT);
          return (
            <div key={g.n} style={{ display: "flex", alignItems: "center", height: 82 }}>
              <div style={{ width: 300, opacity: k, translate: `${(1 - k) * -20}px 0` }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{g.n}</div>
                <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{g.d}</div>
              </div>
              <div style={{ position: "relative", width: W, height: 34 }}>
                <div style={{ position: "absolute", left: g.a * mw, width: (g.b - g.a) * mw * k, height: 34, borderRadius: 10, background: C.blue50 }} />
                <div style={{ position: "absolute", left: g.a * mw, width: (g.b - g.a) * mw * f, height: 34, borderRadius: 10, background: C.blue }} />
                <div style={{ position: "absolute", left: g.a * mw + (g.b - g.a) * mw * k + 10, top: 7, fontSize: 15, fontWeight: 800, opacity: tw(s, [bars[i] + 1.0, bars[i] + 1.4], [0, 1]) }}>{Math.round(f * 100)}%</div>
              </div>
            </div>
          );
        })}
        {/* today */}
        <div style={{ position: "absolute", left: 300 + 6.0 * mw, top: -8, bottom: -8, width: 2, background: C.orange, opacity: tw(s, [bars[2] + 0.6, bars[2] + 1.0], [0, 1]), scale: `1 ${tw(s, [bars[2] + 0.6, bars[2] + 1.2], [0, 1], EXPO)}`, transformOrigin: "top" }} />
        <div style={{ position: "absolute", left: 300 + 6.0 * mw - 34, top: -36, fontSize: 13, fontWeight: 800, color: C.orange, opacity: tw(s, [bars[2] + 0.8, bars[2] + 1.2], [0, 1]) }}>сегодня</div>
      </div>
      <div style={{ fontSize: 13.5, color: C.muted, marginTop: 16 }}>Полоса — плановый период, заливка — фактическая готовность</div>
    </Card>
  );
};

/** Object card. `at` — moment it opens (content staggers in). */
export const ObjectCard: React.FC<{ at: number; view?: "passport" | "gantt"; ganttAt?: number; bars?: number[]; pressTab?: number }> = ({ at, view = "passport", ganttAt = 99, bars = [99, 99, 99], pressTab }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.7], [0, 1], EXPO);
  const gv = tw(s, [ganttAt, ganttAt + 0.35], [0, 1], EXPO);
  const pv = 1 - tw(s, [ganttAt - 0.05, ganttAt + 0.2], [0, 1], IN);
  const activeTab = s >= ganttAt ? 6 : 0;
  const press = pressTab === undefined ? 0 : tw(s, [pressTab - 0.05, pressTab + 0.1, pressTab + 0.35], [0, 1, 0]);
  const ready = tw(s, [at + 0.4, at + 1.6], [0, 0.64], OUT);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "26px 30px", boxSizing: "border-box", opacity: Math.min(1, k * 1.5), translate: `${(1 - k) * 80}px 0` }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>ул. Нагорная, д. 20, корп. 4</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 15, color: C.ink2, fontWeight: 550 }}>
            <Chip tone="blue">В работе</Chip>
            <Chip tone="green">
              <ICheck size={14} color={C.green} stroke={2.6} />
              &nbsp;Комплект согласован
            </Chip>
            <span style={{ marginLeft: 8 }}>УНОМ 18542</span>
            <span style={{ color: C.faint }}>·</span>
            <span>ЮЗАО · Котловка</span>
            <span style={{ color: C.faint }}>·</span>
            <span style={{ color: C.blue, fontWeight: 650 }}>ПКРД-002047-25</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            [<IBox key="b" size={17} />, "ТМЦ объекта"],
            [<IPencil key="p" size={16} />, "Изменить"],
          ].map(([ic, l]) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 16px", borderRadius: 12, background: "#fff", boxShadow: `inset 0 0 0 1px ${C.line}`, fontWeight: 650, fontSize: 15 }}>
              {ic}
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18, height: 56, background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", padding: "0 8px", gap: 4 }}>
        {OBJ_TABS.map(([l, w], i) => (
          <div
            key={l}
            style={{
              width: w,
              height: 42,
              borderRadius: 11,
              display: "grid",
              placeItems: "center",
              fontSize: 15.5,
              fontWeight: i === activeTab ? 700 : 500,
              color: i === activeTab ? C.ink : C.muted,
              background: i === activeTab ? glow : i === 6 && press > 0 ? `rgba(221,230,255,${press})` : "transparent",
              scale: i === 6 ? String(1 - press * 0.05) : undefined,
            }}
          >
            {l}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, padding: "0 14px", height: 40, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
          Все разделы <span style={{ color: C.faint }}>25</span> <IChevron size={15} color={C.faint} />
        </div>
      </div>

      <Card style={{ marginTop: 18, padding: "0 6px", display: "flex" }}>
        {[
          ["Готовность", null],
          ["Контроль", <Chip key="c" tone="red">Заявка с замечаниями</Chip>],
          ["Сроки работ", "01.04.2026 — 30.11.2026"],
          ["Строительный контроль", "Инженер стройконтроля"],
          ["Ответственный", "Технический заказчик ФКР"],
        ].map(([l, v], i) => (
          <div key={l as string} style={{ flex: i === 0 ? 1.3 : 1, padding: "18px 20px", borderLeft: i ? `1px solid ${C.lineSoft}` : undefined }}>
            <div style={{ fontSize: 13.5, color: C.muted }}>{l}</div>
            {i === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                <div style={{ fontSize: 34, fontWeight: 800 }}>{Math.round(ready * 100)}%</div>
                <div style={{ flex: 1, height: 8, borderRadius: 99, background: C.lineSoft }}>
                  <div style={{ width: `${ready * 100}%`, height: 8, borderRadius: 99, background: C.blue }} />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 16, fontWeight: 650, marginTop: 10 }}>{v}</div>
            )}
          </div>
        ))}
      </Card>

      {view === "gantt" || s >= ganttAt ? (
        <div style={{ opacity: gv, translate: `0 ${(1 - gv) * 30}px` }}>
          <Gantt bars={bars} />
        </div>
      ) : null}
      {s < ganttAt + 0.2 ? (
        <div style={{ opacity: pv, position: s >= ganttAt ? "absolute" : "relative", top: s >= ganttAt ? 300 : undefined, left: 30, right: 30 }}>
          <Card style={{ marginTop: 18, padding: "18px 26px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 750, flex: 1 }}>Паспорт объекта</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, fontWeight: 600, padding: "8px 12px", borderRadius: 9, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                <IPencil size={14} /> Изменить
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: 30 }}>
              {[
                ["Адрес", "ул. Нагорная, д. 20, корп. 4"],
                ["УНОМ", "18542"],
                ["Округ / район", "ЮЗАО / Котловка"],
                ["Программа ремонта", "2026"],
                ["Год постройки", "1967"],
                ["Этажность / подъезды", "9 / 4"],
                ["Количество квартир", "144"],
                ["Общая площадь", "9 850 м²"],
                ["Управляющая организация", "ГБУ «Жилищник района»"],
                ["Техническое состояние", "Удовлетворительное"],
                ["Объект культурного наследия", "Нет"],
                ["Формирование фонда", "Региональный оператор"],
              ].map(([l, v], i) => (
                <Field key={l} l={l} v={v} at={at + 0.25} i={i} />
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const LinkArrow = IArrowR;
export const clampK = clamp01;
