import React from "react";
import { C, FONT } from "../theme";

/** «Как сейчас»: the specialist's desktop before the unified system — the same
    radiator request scattered over unrelated windows. Flat, light, legible;
    no brands drawn, only the system names the Fund actually uses. 1920×1080. */

type Win = { x: number; y: number; w: number; h: number; title: string; z: number; children: React.ReactNode };

const Window: React.FC<Win & { lift?: number }> = ({ x, y, w, h, title, z, lift = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y - lift * 6,
      width: w,
      height: h,
      zIndex: z,
      background: C.surface,
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: `0 ${6 + lift * 10}px ${22 + lift * 24}px rgba(0,2,48,${0.07 + lift * 0.05}), 0 0 0 1px rgba(0,2,48,0.06)`,
    }}
  >
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        background: "#F4F4F7",
        fontSize: 16,
        fontWeight: 650,
        color: C.ink2,
        gap: 12,
      }}
    >
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: "#DCDDE3" }} />
      ))}
    </div>
    <div style={{ padding: 22, fontSize: 18, color: C.ink }}>{children}</div>
  </div>
);

const Field: React.FC<{ k: string; v: string; mark?: boolean }> = ({ k, v, mark }) => (
  <div style={{ display: "flex", padding: "11px 0", borderBottom: `1px solid ${C.lineSoft}` }}>
    <span style={{ width: 230, color: C.muted, fontWeight: 500 }}>{k}</span>
    <span style={{ fontWeight: 600, background: mark ? "#FFF1C7" : undefined, padding: mark ? "0 6px" : 0, borderRadius: 4 }}>{v}</span>
  </div>
);

const Grid: React.FC<{ cols: number[]; rows: string[][]; head: string[] }> = ({ cols, rows, head }) => (
  <div style={{ fontSize: 16 }}>
    <div style={{ display: "flex", color: C.muted, fontWeight: 600, paddingBottom: 8, borderBottom: `1px solid ${C.line}` }}>
      {head.map((h, i) => (
        <span key={i} style={{ width: cols[i] }}>{h}</span>
      ))}
    </div>
    {rows.map((r, j) => (
      <div key={j} style={{ display: "flex", padding: "9px 0", borderBottom: `1px solid ${C.lineSoft}`, fontWeight: j === 0 ? 650 : 500 }}>
        {r.map((c, i) => (
          <span key={i} style={{ width: cols[i], whiteSpace: "nowrap" }}>{c}</span>
        ))}
      </div>
    ))}
  </div>
);

const Sheet: React.FC = () => {
  const colW = [44, 210, 120, 70, 110];
  const head = ["", "Объект", "Материал", "Кол.", "Дата"];
  const rows = [
    ["2", "Нагорная, 20 к4", "Радиаторы", "10", "18.10"],
    ["3", "Нагорная, 20 к4", "Трубы", "40", "22.10"],
    ["4", "Кировоградская, 37", "Краны", "24", "—"],
    ["5", "Новаторов, 31", "Радиаторы", "16", "25.10"],
  ];
  return (
    <div style={{ fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
      <div style={{ display: "flex", background: "#F1F2F5", color: C.muted, fontWeight: 600 }}>
        {head.map((h, i) => (
          <span key={i} style={{ width: colW[i], padding: "6px 8px", borderRight: `1px solid ${C.line}` }}>{h || "1"}</span>
        ))}
      </div>
      {rows.map((r, j) => (
        <div key={j} style={{ display: "flex", borderTop: `1px solid ${C.line}` }}>
          {r.map((c, i) => (
            <span
              key={i}
              style={{
                width: colW[i],
                padding: "7px 8px",
                borderRight: `1px solid ${C.line}`,
                color: i === 0 ? C.faint : C.ink,
                background: i === 0 ? "#F7F7F9" : undefined,
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const Mail: React.FC = () => (
  <div style={{ fontSize: 16 }}>
    {[
      ["Подрядчик", "Уточните дату поставки радиаторов"],
      ["Поставщик", "ТТН во вложении, проверьте"],
      ["УРО", "Сверка остатков до пятницы"],
    ].map(([a, b], i) => (
      <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.lineSoft}` }}>
        <div style={{ fontWeight: 650 }}>{a}</div>
        <div style={{ color: C.muted }}>{b}</div>
      </div>
    ))}
  </div>
);

const Scan: React.FC = () => (
  <div style={{ background: "#EEECE6", margin: -22, height: 380, padding: 28 }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#55524A", letterSpacing: 0.5, marginBottom: 14 }}>ТЕХНИЧЕСКИЙ ПАСПОРТ</div>
    {[0.9, 0.7, 0.82, 0.6, 0.76, 0.5, 0.86, 0.64].map((w, i) => (
      <div key={i} style={{ height: 9, width: `${w * 100}%`, background: "#CFCBC0", borderRadius: 2, margin: "12px 0" }} />
    ))}
    <div style={{ marginTop: 18, fontSize: 17, color: "#55524A", fontWeight: 600 }}>Общая площадь: 9 850 м²</div>
  </div>
);

/** The pointer, drawn at desktop scale. `press` 0…1 shrinks it a touch on a click. */
export const Pointer: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg
    width={34}
    height={44}
    viewBox="0 0 17 22"
    style={{ position: "absolute", left: x - 2, top: y - 2, zIndex: 50, transform: `scale(${1 - press * 0.12})`, transformOrigin: "2px 2px" }}
  >
    <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#0B0D2A" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

export const OldDesktop: React.FC<{ lift?: number; cursor?: [number, number]; press?: number }> = ({ lift = 0, cursor, press }) => (
  <div style={{ position: "absolute", inset: 0, width: 1920, height: 1080, background: "#E7E8EC", fontFamily: FONT, overflow: "hidden" }}>
    {cursor && <Pointer x={cursor[0]} y={cursor[1]} press={press} />}
    <Window x={1250} y={150} w={590} h={330} title="Поставки_УРО.xlsx" z={1}>
      <Sheet />
    </Window>
    <Window x={1330} y={540} w={500} h={430} title="Скан_техпаспорт_БТИ.pdf" z={2}>
      <Scan />
    </Window>
    <Window x={190} y={600} w={560} h={340} title="Почта — Входящие (37)" z={2}>
      <Mail />
    </Window>
    <Window x={700} y={430} w={760} h={380} title="1С — Поступление материалов" z={3}>
      <Grid
        cols={[330, 110, 80, 160]}
        head={["Номенклатура", "Кол-во", "Ед.", "Склад"]}
        rows={[
          ["Радиатор БМ 10 секций", "10", "шт.", "Основной"],
          ["Труба стальная оцинк. 25", "40", "м", "Основной"],
          ["Кран шаровой латунный 20", "24", "шт.", "—"],
        ]}
      />
    </Window>
    <Window x={130} y={170} w={720} h={400} title="ИС РСКР — Заявка на материалы" z={4} lift={lift}>
      <Field k="Объект" v="ул. Нагорная, д. 20, корп. 4" />
      <Field k="Материал" v="Радиатор биметалл. 10 с." mark={lift > 0.5} />
      <Field k="Количество" v="10 шт." />
      <Field k="Статус" v="Черновик" />
    </Window>
  </div>
);
