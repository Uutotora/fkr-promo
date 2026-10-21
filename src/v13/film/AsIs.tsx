import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, ramp } from "../geom";
import { project } from "../MoscowMap";
import { Cover, PinMorph, Rect } from "./Insert";
import { Caption, Super } from "./Kit";
import { camAt } from "./MapStage";
import { PLACES } from "./places";
import { f as F, T } from "./T";

/** Акт I beats after the map: flat windows of the systems people use today, over
    the dimmed night map. Nothing pops in: the first window grows out of the house
    pin the phone call folded into, every later window is a morph of one already on
    screen (rect and content), the documents are dealt out of the last windows, they
    gather into the report, and the report folds back into the house pin. */

const housePin = (sec: number): [number, number] => {
  const c = camAt(sec);
  return project(c, PLACES.house.lng, PLACES.house.lat);
};

/* ---------- window panes (natural size; the morph scales them) ---------- */

const Pane: React.FC<{ w: number; h: number; title: string; tone?: string; children: React.ReactNode }> = ({ w, h, title, tone, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: "#fff", fontFamily: FONT }}>
    <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", background: tone ?? "#F2F2F5", fontSize: 22, fontWeight: 700, color: C.ink2 }}>
      <span style={{ flex: 1, whiteSpace: "nowrap" }}>{title}</span>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 11, height: 11, borderRadius: 3, background: "#D9DAE1" }} />
      ))}
    </div>
    <div style={{ padding: "20px 26px 24px", fontSize: 26, color: C.ink }}>{children}</div>
  </div>
);

const Row: React.FC<{ k: string; v: React.ReactNode; mark?: number }> = ({ k, v, mark = 0 }) => (
  <div style={{ display: "flex", padding: "11px 0", borderBottom: `1px solid ${C.lineSoft}`, alignItems: "baseline", whiteSpace: "nowrap" }}>
    <span style={{ width: 210, color: C.muted, fontWeight: 500, fontSize: 22 }}>{k}</span>
    <span style={{ fontWeight: 650, background: `rgba(253,132,49,${0.22 * mark})`, borderRadius: 6, padding: "1px 6px", margin: "-1px -6px" }}>{v}</span>
  </div>
);

/** Type a string over [a, b] film frames, with a caret while typing. */
const typed = (f: number, s: string, a: number, b: number) => {
  const n = Math.round(s.length * clamp01((f - a) / (b - a)));
  return (
    <>
      {s.slice(0, n)}
      {f >= a && f < b + 18 && <span style={{ display: "inline-block", width: 2, height: "1em", background: C.blue, marginLeft: 2, verticalAlign: "-0.15em", opacity: Math.floor(f / 16) % 2 ? 1 : 0.2 }} />}
    </>
  );
};

const DOCS = ["М-15", "КС-2", "КС-3", "Ф-5", "УПД", "ТТН", "Акт", "Протокол", "Счёт", "Справка"];
const Card: React.FC<{ i: number }> = ({ i }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", padding: 12, fontFamily: FONT, fontSize: 17, fontWeight: 750, color: C.ink }}>
    {DOCS[i % DOCS.length]}
    {[0.8, 0.6, 0.7, 0.5].map((w, j) => (
      <div key={j} style={{ height: 6, width: `${w * 100}%`, background: "#E3E4EA", borderRadius: 2, marginTop: 10 }} />
    ))}
  </div>
);

/* ---------- layout ---------- */

const R = (x: number, y: number, w: number, h: number, r = 14): Rect => ({ x, y, w, h, r, sh: 0.3 });
const A = R(170, 250, 760, 316); // ИС РСКР — заявка
const B = R(990, 330, 760, 262); // 1С — поступление
const NM = [0, 1, 2].map((i) => R(520, 230 + i * 170, 880, 143));
const SCAN = R(170, 230, 640, 340);
const XLS = R(900, 330, 850, 235);
const REM = [0, 1, 2].map((i) => R(180 + i * 540, 330, 500, 208));
const CARD = (i: number) => R(330 + (i % 10) * 132, 300 + Math.floor(i / 10) * 190, 112, 150, 10);
const REPORT = R(330, 210, 1260, 414);
const FROM_REM = [1, 4, 8]; // the three remains windows become these cards

type Key = { t: number; r: Rect | "pin"; c: string };
type Track = Key[];

const content = (id: string, f: number): { node: React.ReactNode; w: number; h: number } => {
  const t = (s: number) => F(s);
  const t1 = t(T.twice[1]);
  const mark = ramp(f, t(43.8), t(44.3)) * (1 - ramp(f, t1 - 40, t1));
  switch (id) {
    case "A":
      return {
        w: A.w,
        h: A.h,
        node: (
          <Pane w={A.w} h={A.h} title="ИС РСКР — Заявка на материалы">
            <Row k="Объект" v="ул. Нагорная, д. 20, корп. 4" />
            <Row k="Материал" v="Радиатор биметалл. 10 с." mark={mark} />
            <Row k="Количество" v="10 шт." />
            <Row k="Дата поставки" v="20.10.2026" />
          </Pane>
        ),
      };
    case "B":
      return {
        w: B.w,
        h: B.h,
        node: (
          <Pane w={B.w} h={B.h} title="1С — Поступление материалов">
            <Row k="Номенклатура" v={typed(f, "Радиатор БМ 10 секций", t(41.8), t(43.6))} mark={mark} />
            <Row k="Количество" v={typed(f, "10", t(43.8), t(44.1))} />
            <Row k="Объект" v={typed(f, "Нагорная 20 к4", t(44.2), t(45.3))} />
          </Pane>
        ),
      };
    case "N0":
    case "N1":
    case "N2": {
      const i = +id[1];
      const [sys, name] = [
        ["Заявка · ИС РСКР", "Радиатор биметалл. 10 с."],
        ["Учёт · 1С", "Радиатор БМ 10 секций"],
        ["Смета подрядчика", "Радиатор 10-секц."],
      ][i];
      return {
        w: NM[i].w,
        h: NM[i].h,
        node: (
          <Pane w={NM[i].w} h={NM[i].h} title={sys}>
            <div style={{ fontSize: 36, fontWeight: 750, letterSpacing: -0.6, whiteSpace: "nowrap" }}>{name}</div>
          </Pane>
        ),
      };
    }
    case "S":
      return {
        w: SCAN.w,
        h: SCAN.h,
        node: (
          <Pane w={SCAN.w} h={SCAN.h} title="Скан · Техпаспорт БТИ.pdf" tone="#EEECE6">
            <div style={{ background: "#F2F0EA", margin: "-20px -26px -24px", padding: "22px 26px 26px", height: SCAN.h - 56, boxSizing: "border-box", color: "#55524A" }}>
              <div style={{ fontWeight: 800, letterSpacing: 1, fontSize: 18 }}>ТЕХНИЧЕСКИЙ ПАСПОРТ</div>
              {[0.9, 0.62, 0.8, 0.5, 0.72].map((w, i) => (
                <div key={i} style={{ height: 10, width: `${w * 100}%`, background: "#D6D2C7", borderRadius: 3, margin: "14px 0" }} />
              ))}
              <div style={{ fontSize: 26, fontWeight: 700 }}>Общая площадь: 9 850 м²</div>
            </div>
          </Pane>
        ),
      };
    case "X":
      return {
        w: XLS.w,
        h: XLS.h,
        node: (
          <Pane w={XLS.w} h={XLS.h} title="Программа_2026.xlsx">
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 1fr", fontSize: 20, fontVariantNumeric: "tabular-nums" }}>
              {["Адрес", "Год", "Площадь, м²", "ул. Нагорная, 20 к4", "1967", "", "Варшавское ш., 152 к8", "1972", "12 340"].map((c, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRight: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, color: i < 3 ? C.muted : C.ink, fontWeight: i < 3 ? 600 : 500, background: i === 5 ? "#EEF2FF" : undefined, whiteSpace: "nowrap", height: 24 }}>
                  {i === 5 ? typed(f, "9 850", t(54.33), t(55.33)) : c}
                </div>
              ))}
            </div>
          </Pane>
        ),
      };
    case "R0":
    case "R1":
    case "R2": {
      const i = +id[1];
      const [sys, v] = [
        ["МОС ЭДО", "10 шт."],
        ["Контур.Диадок", "9 шт."],
        ["ИС РСКР", "10 шт."],
      ][i];
      return {
        w: REM[i].w,
        h: REM[i].h,
        node: (
          <Pane w={REM[i].w} h={REM[i].h} title={sys}>
            <div style={{ color: C.muted, fontSize: 19, fontWeight: 600, whiteSpace: "nowrap" }}>Остаток · Радиатор, 10 секций</div>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, marginTop: 8, color: i === 1 ? C.red : C.ink }}>{v}</div>
          </Pane>
        ),
      };
    }
    case "P": {
      const p0 = t(T.report[0]);
      return {
        w: REPORT.w,
        h: REPORT.h,
        node: (
          <Pane w={REPORT.w} h={REPORT.h} title="Отчёт по давальческим материалам">
            {[
              ["Радиатор биметаллический, 10 секций", "Нагорная, 20 к4", 0],
              ["Радиатор биметаллический, 10 секций", "Нагорная, 20 к4", 1],
              ["Труба стальная оцинкованная, 25 мм", "Новаторов, 31", 0],
              ["Труба стальная оцинкованная, 25 мм", "Новаторов, 31", 1],
              ["Кран шаровой латунный, 20 мм", "Кировоградская, 37", 0],
            ].map(([a, b, dup], i) => (
              <div key={i} style={{ display: "flex", padding: "10px 0", borderBottom: `1px solid ${C.lineSoft}`, fontSize: 20, whiteSpace: "nowrap", background: dup ? `rgba(208,52,75,${0.12 * ramp(f, p0 + 70, p0 + 100)})` : undefined }}>
                <span style={{ flex: 1, fontWeight: 600 }}>{a}</span>
                <span style={{ width: 280, color: C.muted }}>{b}</span>
                <span style={{ width: 160, color: dup ? C.red : C.muted, fontWeight: 650, opacity: dup ? ramp(f, p0 + 70, p0 + 100) : 0 }}>повтор строки</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 22, fontWeight: 800, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 26, color: C.muted, fontWeight: 650 }}>Итого в отчёте</span>
              <span style={{ fontSize: 56, letterSpacing: -1.6, color: C.red, textDecoration: ramp(f, p0 + 140, p0 + 150) > 0.5 ? "line-through" : "none" }}>7,76 млрд ₽</span>
              <span style={{ fontSize: 56, letterSpacing: -1.6, opacity: ramp(f, p0 + 150, p0 + 180) }}>6,1 млрд ₽ — факт</span>
            </div>
          </Pane>
        ),
      };
    }
    default: {
      const i = +id.slice(4); // "card7"
      return { w: 112, h: 150, node: <Card i={i} /> };
    }
  }
};

/* ---------- tracks: one persistent window each, keyed in film seconds ---------- */

const card = (i: number) => `card${i}`;
const MAIN: Track = [
  { t: 40.4, r: "pin", c: "A" },
  { t: 41.2, r: A, c: "A" },
  { t: 46.4, r: A, c: "A" },
  { t: 47.0, r: NM[0], c: "N0" },
  { t: 52.4, r: NM[0], c: "N0" },
  { t: 53.0, r: SCAN, c: "S" },
  { t: 57.4, r: SCAN, c: "S" },
  { t: 58.0, r: REM[0], c: "R0" },
  { t: 62.4, r: REM[0], c: "R0" },
  { t: 63.0, r: CARD(FROM_REM[0]), c: card(FROM_REM[0]) },
  { t: 66.8, r: CARD(FROM_REM[0]), c: card(FROM_REM[0]) },
  { t: 67.4, r: REPORT, c: "P" },
  { t: 72.0, r: REPORT, c: "P" },
  { t: 73.0, r: "pin", c: "P" },
];
const SECOND: Track = [
  { t: 41.2, r: A, c: "B" },
  { t: 41.8, r: B, c: "B" },
  { t: 46.4, r: B, c: "B" },
  { t: 47.0, r: NM[1], c: "N1" },
  { t: 52.4, r: NM[1], c: "N1" },
  { t: 53.0, r: XLS, c: "X" },
  { t: 57.4, r: XLS, c: "X" },
  { t: 58.0, r: REM[1], c: "R1" },
  { t: 62.4, r: REM[1], c: "R1" },
  { t: 63.0, r: CARD(FROM_REM[1]), c: card(FROM_REM[1]) },
  { t: 66.8, r: CARD(FROM_REM[1]), c: card(FROM_REM[1]) },
  { t: 67.3, r: R(900, 380, 40, 54, 6), c: card(FROM_REM[1]) },
];
const THIRD: Track[] = [
  [
    { t: 47.0, r: NM[1], c: "N1" },
    { t: 47.6, r: NM[2], c: "N2" },
    { t: 52.4, r: NM[2], c: "N2" },
    { t: 53.0, r: XLS, c: "X" }, // merges back into the spreadsheet window
  ],
  [
    { t: 58.0, r: REM[1], c: "R1" }, // dealt out of the middle window
    { t: 58.6, r: REM[2], c: "R2" },
    { t: 62.4, r: REM[2], c: "R2" },
    { t: 63.0, r: CARD(FROM_REM[2]), c: card(FROM_REM[2]) },
    { t: 66.8, r: CARD(FROM_REM[2]), c: card(FROM_REM[2]) },
    { t: 67.3, r: R(1240, 380, 40, 54, 6), c: card(FROM_REM[2]) },
  ],
];
// the other 17 documents are dealt from the nearest of the three, then gather into the report
const DEALT: Track[] = Array.from({ length: 20 }, (_, i) => i)
  .filter((i) => !FROM_REM.includes(i))
  .map((i, n) => {
    const col = i % 10;
    const src = FROM_REM.reduce((a, b) => (Math.abs(b - col) < Math.abs(a - col) ? b : a));
    const t0 = 63.0 + n * 0.06;
    const c = CARD(i);
    const g = R(REPORT.x + REPORT.w * (0.12 + 0.76 * (col / 9)), REPORT.y + REPORT.h * (0.35 + 0.3 * Math.floor(i / 10)), 40, 54, 6);
    return [
      { t: t0, r: CARD(src), c: card(i) },
      { t: t0 + 0.5, r: c, c: card(i) },
      { t: 66.7 + (n % 5) * 0.03, r: c, c: card(i) },
      { t: 67.3, r: g, c: card(i) },
    ];
  });

const lerpR = (a: Rect, b: Rect, u: number): Rect => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, w: a.w + (b.w - a.w) * u, h: a.h + (b.h - a.h) * u, r: (a.r ?? 14) + ((b.r ?? 14) - (a.r ?? 14)) * u });

const Window: React.FC<{ track: Track; f: number }> = ({ track, f }) => {
  const sec = f / 60;
  if (sec < track[0].t || sec >= track[track.length - 1].t) return null;
  let i = 0;
  while (sec >= track[i + 1].t) i++;
  const a = track[i];
  const b = track[i + 1];
  const u = (sec - a.t) / (b.t - a.t);
  // to or from the house pin: the pin's own card grows into the window / takes it back
  if (a.r === "pin" || b.r === "pin") {
    const to = (a.r === "pin" ? b.r : a.r) as Rect;
    const c = content(a.r === "pin" ? b.c : a.c, f);
    return (
      <PinMorph k={a.r === "pin" ? u : 1 - u} pin={housePin(sec)} to={to} w={c.w} h={c.h}>
        {c.node}
      </PinMorph>
    );
  }
  const e = easeInOut(u);
  const rect = a.r === b.r ? a.r : lerpR(a.r, b.r, e);
  const ca = content(a.c, f);
  const cb = a.c === b.c ? null : content(b.c, f);
  const oa = cb ? 1 - ramp(e, 0.2, 0.6) : 1;
  const ob = cb ? ramp(e, 0.4, 0.8) : 0;
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: rect.r, overflow: "hidden", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,20,0.3)" }}>
      {oa > 0 && (
        <Cover w={ca.w} h={ca.h} bw={rect.w} bh={rect.h} opacity={oa} top>
          {ca.node}
        </Cover>
      )}
      {cb && ob > 0 && (
        <Cover w={cb.w} h={cb.h} bw={rect.w} bh={rect.h} opacity={ob} top>
          {cb.node}
        </Cover>
      )}
    </div>
  );
};

export const AsIs: React.FC = () => {
  const f = useCurrentFrame();
  const beat = (k: keyof typeof T) => [F(T[k][0]), F(T[k][1])] as const;
  const [t0, t1] = beat("twice");
  const [n0, n1] = beat("names");
  const [b0, b1] = beat("bti");
  const [r0, r1] = beat("remains");
  const [d0, d1] = beat("docs");
  const [p0, p1] = beat("report");
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* back to front: documents gather under the report window */}
      {DEALT.map((tr, i) => (
        <Window key={`d${i}`} track={tr} f={f} />
      ))}
      {THIRD.map((tr, i) => (
        <Window key={`t${i}`} track={tr} f={f} />
      ))}
      <Window track={SECOND} f={f} />
      <Window track={MAIN} f={f} />

      <Caption a={t0 + 30} b={t1}>Одну заявку вводят дважды: ИС РСКР → 1С</Caption>
      <Caption a={n0 + 40} b={n1}>У материала — три названия. УПД и ТТН сверяют вручную</Caption>
      <Caption a={b0 + 30} b={b1}>Данные о домах переносят вручную: БТИ → Excel</Caption>
      <Caption a={r0 + 30} b={r1}>Остатки сверяют в трёх системах</Caption>
      <Super a={d0 + 20} b={d1} n="≈20" cap="документов к приёмке — вручную, после каждого КС-2" x={120} y={110} size={140} />
      <Caption a={p0 + 30} b={p1}>Отчёт завышает поставки: повторы строк</Caption>
    </AbsoluteFill>
  );
};
