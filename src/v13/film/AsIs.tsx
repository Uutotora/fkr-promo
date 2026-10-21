import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, easeOut, ramp } from "../geom";
import { f as F, T } from "./T";
import { Caption, Super } from "./Kit";

/** Акт I beats after the map: flat windows of the systems people use today,
    over the dimmed night map. One idea per beat, one number where there is one. */

const Win: React.FC<{ x: number; y: number; w: number; h?: number; title: string; k: number; children: React.ReactNode; tone?: string }> = ({ x, y, w, h, title, k, children, tone }) => {
  if (k <= 0) return null;
  const e = easeOut(k);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + (1 - e) * 26,
        width: w,
        height: h,
        opacity: e,
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 22px 50px rgba(0,0,20,0.35)",
        fontFamily: FONT,
      }}
    >
      <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", background: tone ?? "#F2F2F5", fontSize: 22, fontWeight: 700, color: C.ink2 }}>
        <span style={{ flex: 1 }}>{title}</span>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 11, height: 11, borderRadius: 3, background: "#D9DAE1" }} />
        ))}
      </div>
      <div style={{ padding: "20px 26px 24px", fontSize: 26, color: C.ink }}>{children}</div>
    </div>
  );
};

const Row: React.FC<{ k: string; v: React.ReactNode; mark?: number }> = ({ k, v, mark = 0 }) => (
  <div style={{ display: "flex", padding: "11px 0", borderBottom: `1px solid ${C.lineSoft}`, alignItems: "baseline" }}>
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

export const AsIs: React.FC = () => {
  const f = useCurrentFrame();
  const beat = (k: keyof typeof T) => [F(T[k][0]), F(T[k][1])] as const;
  const [t0, t1] = beat("twice");
  const [n0, n1] = beat("names");
  const [b0, b1] = beat("bti");
  const [r0, r1] = beat("remains");
  const [d0, d1] = beat("docs");
  const [p0, p1] = beat("report");
  const inOut = (a: number, b: number, d = 0) => clamp01(ramp(f, a + d, a + d + 30)) * (1 - ramp(f, b - 24, b));

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* 1. one request typed twice */}
      <Win x={170} y={250} w={760} title="ИС РСКР — Заявка на материалы" k={inOut(t0, t1)}>
        <Row k="Объект" v="ул. Нагорная, д. 20, корп. 4" />
        <Row k="Материал" v="Радиатор биметалл. 10 с." mark={ramp(f, t0 + 200, t0 + 230) * (1 - ramp(f, t1 - 40, t1))} />
        <Row k="Количество" v="10 шт." />
        <Row k="Дата поставки" v="20.10.2026" />
      </Win>
      <Win x={990} y={330} w={760} title="1С — Поступление материалов" k={inOut(t0, t1, 40)}>
        <Row k="Номенклатура" v={typed(f, "Радиатор БМ 10 секций", t0 + 80, t0 + 190)} mark={ramp(f, t0 + 200, t0 + 230) * (1 - ramp(f, t1 - 40, t1))} />
        <Row k="Количество" v={typed(f, "10", t0 + 200, t0 + 220)} />
        <Row k="Объект" v={typed(f, "Нагорная 20 к4", t0 + 225, t0 + 290)} />
      </Win>
      <Caption a={t0 + 30} b={t1}>Одну заявку вводят дважды: ИС РСКР → 1С</Caption>

      {/* 2. three names for one radiator */}
      {[
        ["Заявка · ИС РСКР", "Радиатор биметалл. 10 с."],
        ["Учёт · 1С", "Радиатор БМ 10 секций"],
        ["Смета подрядчика", "Радиатор 10-секц."],
      ].map(([sys, name], i) => (
        <Win key={i} x={520} y={230 + i * 170} w={880} title={sys} k={inOut(n0, n1, i * 16)}>
          <div style={{ fontSize: 36, fontWeight: 750, letterSpacing: -0.6 }}>{name}</div>
        </Win>
      ))}
      <Caption a={n0 + 40} b={n1}>У материала — три названия. УПД и ТТН сверяют вручную</Caption>

      {/* 3. house data re-typed from paper */}
      <Win x={170} y={230} w={640} title="Скан · Техпаспорт БТИ.pdf" k={inOut(b0, b1)} tone="#EEECE6">
        <div style={{ background: "#F2F0EA", margin: "-18px -24px -22px", padding: "22px 26px 26px", color: "#55524A" }}>
          <div style={{ fontWeight: 800, letterSpacing: 1, fontSize: 18 }}>ТЕХНИЧЕСКИЙ ПАСПОРТ</div>
          {[0.9, 0.62, 0.8, 0.5, 0.72].map((w, i) => (
            <div key={i} style={{ height: 10, width: `${w * 100}%`, background: "#D6D2C7", borderRadius: 3, margin: "14px 0" }} />
          ))}
          <div style={{ fontSize: 26, fontWeight: 700 }}>Общая площадь: 9 850 м²</div>
        </div>
      </Win>
      <Win x={900} y={330} w={850} title="Программа_2026.xlsx" k={inOut(b0, b1, 40)}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 1fr", fontSize: 20, fontVariantNumeric: "tabular-nums" }}>
          {["Адрес", "Год", "Площадь, м²", "ул. Нагорная, 20 к4", "1967", "", "Варшавское ш., 152 к8", "1972", "12 340"].map((c, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRight: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, color: i < 3 ? C.muted : C.ink, fontWeight: i < 3 ? 600 : 500, background: i === 5 ? "#EEF2FF" : undefined }}>
              {i === 5 ? typed(f, "9 850", b0 + 80, b0 + 140) : c}
            </div>
          ))}
        </div>
      </Win>
      <Caption a={b0 + 30} b={b1}>Данные о домах переносят вручную: БТИ → Excel</Caption>

      {/* 4. remains in three systems */}
      {[
        ["МОС ЭДО", "10 шт."],
        ["Контур.Диадок", "9 шт."],
        ["ИС РСКР", "10 шт."],
      ].map(([sys, v], i) => (
        <Win key={i} x={180 + i * 540} y={330} w={500} title={sys} k={inOut(r0, r1, i * 14)}>
          <div style={{ color: C.muted, fontSize: 19, fontWeight: 600 }}>Остаток · Радиатор, 10 секций</div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, marginTop: 8, color: i === 1 ? C.red : C.ink }}>{v}</div>
        </Win>
      ))}
      <Caption a={r0 + 30} b={r1}>Остатки сверяют в трёх системах</Caption>

      {/* 5. ≈20 documents by hand */}
      {Array.from({ length: 20 }, (_, i) => {
        const k = inOut(d0, d1, i * 4);
        if (k <= 0) return null;
        const names = ["М-15", "КС-2", "КС-3", "Ф-5", "УПД", "ТТН", "Акт", "Протокол", "Счёт", "Справка"];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 330 + (i % 10) * 132,
              top: 300 + Math.floor(i / 10) * 190 + (1 - easeOut(k)) * 30,
              width: 112,
              height: 150,
              background: "#fff",
              borderRadius: 10,
              opacity: easeOut(k),
              boxShadow: "0 14px 30px rgba(0,0,20,0.3)",
              padding: 12,
              fontSize: 17,
              fontWeight: 750,
              color: C.ink,
            }}
          >
            {names[i % names.length]}
            {[0.8, 0.6, 0.7, 0.5].map((w, j) => (
              <div key={j} style={{ height: 6, width: `${w * 100}%`, background: "#E3E4EA", borderRadius: 2, marginTop: 10 }} />
            ))}
          </div>
        );
      })}
      <Super a={d0 + 20} b={d1} n="≈20" cap="документов к приёмке — вручную, после каждого КС-2" x={120} y={110} size={140} />

      {/* 6. report inflates deliveries */}
      <Win x={330} y={210} w={1260} title="Отчёт по давальческим материалам" k={inOut(p0, p1)}>
        {[
          ["Радиатор биметаллический, 10 секций", "Нагорная, 20 к4", 0],
          ["Радиатор биметаллический, 10 секций", "Нагорная, 20 к4", 1],
          ["Труба стальная оцинкованная, 25 мм", "Новаторов, 31", 0],
          ["Труба стальная оцинкованная, 25 мм", "Новаторов, 31", 1],
          ["Кран шаровой латунный, 20 мм", "Кировоградская, 37", 0],
        ].map(([a, b, dup], i) => (
          <div key={i} style={{ display: "flex", padding: "10px 0", borderBottom: `1px solid ${C.lineSoft}`, fontSize: 20, background: dup ? `rgba(208,52,75,${0.12 * ramp(f, p0 + 70, p0 + 100)})` : undefined }}>
            <span style={{ flex: 1, fontWeight: 600 }}>{a}</span>
            <span style={{ width: 280, color: C.muted }}>{b}</span>
            <span style={{ width: 160, color: dup ? C.red : C.muted, fontWeight: 650, opacity: dup ? ramp(f, p0 + 70, p0 + 100) : 0 }}>повтор строки</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 22, fontWeight: 800 }}>
          <span style={{ fontSize: 26, color: C.muted, fontWeight: 650 }}>Итого в отчёте</span>
          <span style={{ fontSize: 56, letterSpacing: -1.6, color: C.red, textDecoration: ramp(f, p0 + 140, p0 + 150) > 0.5 ? "line-through" : "none" }}>7,76 млрд ₽</span>
          <span style={{ fontSize: 56, letterSpacing: -1.6, opacity: ramp(f, p0 + 150, p0 + 180) }}>6,1 млрд ₽ — факт</span>
        </div>
      </Win>
      <Caption a={p0 + 30} b={p1}>Отчёт завышает поставки: повторы строк</Caption>
    </AbsoluteFill>
  );
};

/** The scattered windows collapse to one point at the start of the turn. */
export const collapse = (frame: number) => easeInOut(ramp(frame, F(T.turn[0]), F(T.turn[0]) + 70));
