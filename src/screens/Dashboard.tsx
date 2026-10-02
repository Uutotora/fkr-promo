import React from "react";
import { C, glow } from "../theme";
import { EXPO, OUT, pop, tw, useSec } from "../lib";
import { IDownload, IChevron, IHouse, IClock, ICalendar, IAlert, IPin } from "../components/Icons";

export const IconDisc: React.FC<{ children: React.ReactNode; tone?: "blue" | "orange" }> = ({ children, tone = "blue" }) => (
  <div style={{ width: 44, height: 44, borderRadius: 99, background: tone === "blue" ? C.blue50 : C.orange50, display: "grid", placeItems: "center", color: tone === "blue" ? C.blue : C.orange }}>
    {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; at?: number }> = ({ children, style, at }) => {
  const s = useSec();
  const k = at === undefined ? 1 : tw(s, [at, at + 0.7], [0, 1], EXPO);
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 20,
        padding: 22,
        boxSizing: "border-box",
        boxShadow: "0 1px 2px rgba(0,2,48,0.03)",
        opacity: Math.min(1, k * 1.5),
        translate: `0 ${(1 - k) * 40}px`,
        scale: String(0.94 + 0.06 * k),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Head: React.FC<{ icon: React.ReactNode; title: string; right?: React.ReactNode }> = ({ icon, title, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <IconDisc>{icon}</IconDisc>
    <div style={{ fontSize: 19, fontWeight: 700, flex: 1 }}>{title}</div>
    {right}
  </div>
);

const Bars: React.FC<{ vals: number[]; labels: string[]; at: number; h?: number }> = ({ vals, labels, at, h = 92 }) => {
  const s = useSec();
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-end", height: h + 22 }}>
      {vals.map((v, i) => {
        const k = tw(s, [at + 0.2 + i * 0.07, at + 0.9 + i * 0.07], [0, 1], EXPO);
        const last = i === vals.length - 1;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: h, borderRadius: 99, background: C.surface2, display: "flex", alignItems: "flex-end", boxShadow: `inset 0 0 0 1px ${C.lineSoft}` }}>
              <div style={{ width: 12, height: Math.max(12, h * v * k), borderRadius: 99, background: last ? C.orange : C.blue }} />
            </div>
            <div style={{ fontSize: 11.5, color: last ? C.ink : C.muted, fontWeight: last ? 700 : 500 }}>{labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; tone: "orange" | "red" | "green" | "blue" | "amber" | "gray"; size?: number }> = ({ children, tone, size = 13.5 }) => {
  const map = {
    orange: [C.orange50, "#d9621a"],
    red: [C.red50, C.red],
    green: [C.green50, C.green],
    blue: [C.blue50, C.blue],
    amber: [C.amber50, C.amber],
    gray: ["#F1F1F4", C.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: size * 2, padding: `0 ${size * 0.8}px`, borderRadius: 8, background: bg, color: fg, fontSize: size, fontWeight: 650, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};
export { Chip };

const Count: React.FC<{ to: number; at: number; dur?: number }> = ({ to, at, dur = 1 }) => {
  const s = useSec();
  return <>{Math.round(tw(s, [at, at + dur], [0, to], OUT))}</>;
};
export { Count };

/* ---------- map ---------- */
const CLUSTERS: { name: string; n: number; late: number; x: number; y: number }[] = [
  { name: "ЗелАО", n: 5, late: 1, x: 205, y: 52 },
  { name: "СЗАО", n: 11, late: 3, x: 300, y: 178 },
  { name: "САО", n: 14, late: 3, x: 395, y: 150 },
  { name: "СВАО", n: 20, late: 4, x: 500, y: 128 },
  { name: "ВАО", n: 13, late: 4, x: 615, y: 222 },
  { name: "ЦАО", n: 10, late: 1, x: 465, y: 262 },
  { name: "ЗАО", n: 15, late: 5, x: 322, y: 300 },
  { name: "ЮВАО", n: 15, late: 8, x: 590, y: 340 },
  { name: "ЮЗАО", n: 15, late: 3, x: 400, y: 382 },
  { name: "ЮАО", n: 11, late: 4, x: 505, y: 408 },
  { name: "НАО", n: 5, late: 0, x: 350, y: 470 },
  { name: "ТАО", n: 2, late: 1, x: 225, y: 520 },
];

export const MoscowMap: React.FC<{ at: number; clusterTimes: number[]; clickAt?: number; w: number; h: number }> = ({ at, clusterTimes, clickAt, w, h }) => {
  const s = useSec();
  const draw = tw(s, [at, at + 1.6], [0, 1], EXPO);
  return (
    <div style={{ position: "relative", width: w, height: h, background: "#EEF0F4", borderRadius: 16, overflow: "hidden" }}>
      <svg width={w} height={h} viewBox="0 0 860 560" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
        {/* parks */}
        {[
          [300, 120, 60, 36],
          [610, 160, 50, 40],
          [380, 330, 44, 30],
          [700, 300, 40, 50],
          [250, 250, 34, 44],
        ].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#E3EBE3" opacity={0.9} />
        ))}
        {/* outer highways */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2 + 0.3;
          return <line key={i} x1={460} y1={275} x2={460 + Math.cos(a) * 520} y2={275 + Math.sin(a) * 420} stroke="#fff" strokeWidth={5} />;
        })}
        {/* MKAD, TTK, Garden ring */}
        <path
          d="M460 70 C600 66 700 120 712 250 C724 380 640 470 470 478 C300 486 222 410 214 280 C206 140 320 74 460 70 Z"
          fill="none"
          stroke="#fff"
          strokeWidth={10}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path d="M460 70 C600 66 700 120 712 250 C724 380 640 470 470 478 C300 486 222 410 214 280 C206 140 320 74 460 70 Z" fill="none" stroke="#D6D9E3" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <ellipse cx={462} cy={272} rx={128} ry={112} fill="none" stroke="#fff" strokeWidth={7} />
        <ellipse cx={464} cy={268} rx={62} ry={56} fill="none" stroke="#fff" strokeWidth={5} />
        {/* Moskva river */}
        <path
          d="M140 210 C230 180 280 260 340 250 C400 240 380 330 450 320 C520 310 500 230 560 250 C620 270 600 360 680 380 C740 395 780 430 860 440"
          fill="none"
          stroke="#C9DBFF"
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      {CLUSTERS.map((c, i) => {
        const t0 = clusterTimes[i] ?? at;
        const p = pop(s, t0, 0.6);
        if (p <= 0) return null;
        const x = (c.x / 860) * w;
        const y = (c.y / 560) * h;
        const r = 26 + Math.sqrt(c.n) * 3.2;
        const done = Math.min(1, tw(s, [t0 + 0.1, t0 + 1.2], [0, 1], EXPO));
        const hit = clickAt !== undefined && c.name === "ЮЗАО" ? tw(s, [clickAt, clickAt + 0.25, clickAt + 0.8], [0, 1, 0.6]) : 0;
        const circ = 2 * Math.PI * (r - 4);
        return (
          <div key={c.name} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(p * (1 + hit * 0.18)), display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: r * 2, height: r * 2 }}>
              {hit > 0 && <div style={{ position: "absolute", inset: -14, borderRadius: 99, background: "rgba(49,107,253,0.18)", scale: String(0.8 + hit * 0.4) }} />}
              <svg width={r * 2} height={r * 2} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 6px 10px rgba(0,2,48,0.18))" }}>
                <circle cx={r} cy={r} r={r} fill="#fff" />
                <circle cx={r} cy={r} r={r - 4} fill="none" stroke={C.blue100} strokeWidth={6} />
                <circle cx={r} cy={r} r={r - 4} fill="none" stroke={C.blue} strokeWidth={6} strokeDasharray={`${circ * 0.62 * done} ${circ}`} transform={`rotate(-90 ${r} ${r})`} strokeLinecap="round" />
                <circle cx={r} cy={r} r={r - 4} fill="none" stroke={C.green} strokeWidth={6} strokeDasharray={`${circ * 0.22 * done} ${circ}`} transform={`rotate(${-90 + 360 * 0.64} ${r} ${r})`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: r * 0.62, fontWeight: 800, color: C.ink }}>{c.n}</div>
              {c.late > 0 && (
                <div
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -6,
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    background: C.orange,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    border: "2px solid #fff",
                    scale: String(pop(s, t0 + 0.25, 0.5)),
                  }}
                >
                  {c.late}
                </div>
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 800, color: C.ink, background: "#fff", padding: "2px 8px", borderRadius: 7 }}>{c.name}</div>
          </div>
        );
      })}
    </div>
  );
};

const LATE = [
  ["ул. Косыгина, д. 65", "ЗАО · Отставание СМР от графика", 66],
  ["Октябрьский пр-т, д. 61", "ЮЗАО · Замечания стройконтроля", 62],
  ["Варшавское ш., д. 76", "ЮВАО · Не закрыт акт скрытых работ", 61],
  ["ул. Кировоградская, д. 57", "ЮВАО · Договор расторгнут", 60],
  ["ул. Новаторов, д. 31", "ВАО · Не закрыт акт скрытых работ", 58],
  ["ул. Вешняковская, д. 74", "ВАО · Нехватка рабочих на объекте", 58],
  ["ул. Декабристов, д. 37", "ВАО · Не закрыт акт скрытых работ", 57],
] as const;

/** Content-area dashboard (1352 × 944). `t` holds cue times. */
export const Dashboard: React.FC<{ cards: number[]; map: number; clusters: number[]; clickCluster?: number; highlightRow?: number }> = ({ cards, map, clusters, clickCluster, highlightRow }) => {
  const s = useSec();
  const hl = highlightRow === undefined ? 0 : tw(s, [highlightRow, highlightRow + 0.3], [0, 1], EXPO);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "26px 30px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>Дашборд</div>
        <div style={{ fontSize: 15.5, color: C.muted, flex: 1 }}>Программа 2026 · 136 домов · 3,8 млрд ₽ · 12 округов · 9 подрядчиков</div>
        <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, gap: 2 }}>
          <div style={{ padding: "9px 16px", borderRadius: 9, fontWeight: 700, fontSize: 15, background: glow }}>1 год</div>
          <div style={{ padding: "9px 16px", borderRadius: 9, fontWeight: 500, fontSize: 15, color: C.muted }}>3 года</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.blue, color: "#fff", padding: "11px 18px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
          <IDownload size={17} color="#fff" /> Отчёт <IChevron size={15} color="#fff" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 24 }}>
        <Card at={cards[0]} style={{ height: 228 }}>
          <Head icon={<IHouse size={20} />} title="Завершено домов" />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16 }}>
            <Bars at={cards[0]} vals={[0.05, 0.1, 0.12, 0.35, 0.62, 0.48]} labels={["апр", "май", "июн", "июл", "авг", "сен"]} h={84} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
                <Count to={39} at={cards[0] + 0.2} />
                <span style={{ fontSize: 18, color: C.muted, fontWeight: 500 }}> из 136</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <Chip tone="orange">−4 к плану</Chip>
              </div>
            </div>
          </div>
        </Card>
        <Card at={cards[1]} style={{ height: 228 }}>
          <Head icon={<IClock size={20} />} title="Средний сдвиг" right={<div style={{ fontSize: 30, fontWeight: 800 }}>+7<span style={{ fontSize: 15, color: C.muted, fontWeight: 500 }}> дн.</span></div>} />
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 17 }}>
            {[
              ["Опережают", 22, C.green, 0.3],
              ["В срок", 74, C.blue, 1],
              ["Отстают", 33, C.orange, 0.45],
            ].map(([l, n, col, v], i) => {
              const k = tw(s, [cards[1] + 0.3 + i * 0.1, cards[1] + 1.1 + i * 0.1], [0, 1], EXPO);
              return (
                <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
                  <div style={{ width: 96, color: col as string, fontWeight: 600 }}>{l}</div>
                  <div style={{ flex: 1, height: 9, borderRadius: 99, background: C.lineSoft }}>
                    <div style={{ width: `${(v as number) * k * 100}%`, height: 9, borderRadius: 99, background: col as string }} />
                  </div>
                  <div style={{ width: 30, textAlign: "right", fontWeight: 800, color: col as string }}>
                    <Count to={n as number} at={cards[1] + 0.3} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card at={cards[2]} style={{ height: 228 }}>
          <Head icon={<ICalendar size={20} />} title="Прогноз завершения" />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16 }}>
            <Bars at={cards[2]} vals={[0.4, 0.55, 0.85, 0.22]} labels={["окт", "ноя", "дек", "янв"]} h={84} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
                19 ЯНВ<span style={{ fontSize: 17, color: C.muted, fontWeight: 500 }}> 2027</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <Chip tone="orange">+19 дн. к сроку</Chip>
              </div>
            </div>
          </div>
        </Card>
        <Card at={cards[3]} style={{ height: 228 }}>
          <Head icon={<IAlert size={20} />} title="Отклонения" />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Приостановлены работы", 2],
              ["Расторгнуты договоры", 3],
              ["Задержаны поставки", 6],
            ].map(([l, n], i) => (
              <div
                key={l as string}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 15.5,
                  padding: "9px 10px",
                  margin: "0 -10px",
                  borderRadius: 10,
                  background: i === 2 && hl > 0 ? `rgba(221,230,255,${hl})` : "transparent",
                  fontWeight: i === 2 && hl > 0.5 ? 650 : 500,
                }}
              >
                <div style={{ flex: 1 }}>{l}</div>
                <div style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", background: C.orange50, color: C.orange, fontWeight: 800, fontSize: 14, scale: String(pop(s, cards[3] + 0.3 + i * 0.12)) }}>{n}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card at={cards[3] + 0.25} style={{ marginTop: 18, height: 600, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px" }}>
          <IconDisc>
            <IPin size={20} />
          </IconDisc>
          <div style={{ fontSize: 19, fontWeight: 700, flex: 1 }}>Объекты на карте</div>
          {[
            ["Включены в программу", 10, C.blue200],
            ["Проектирование", 14, "#7EA2FF"],
            ["В работе", 60, C.blue],
            ["Приемка", 13, C.blue700],
            ["Завершены", 39, C.green],
          ].map(([l, n, col]) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: C.ink2 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: col as string }} />
              {l}
              <span style={{ color: C.faint, fontWeight: 500 }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 0, height: 530 }}>
          <div style={{ padding: "0 0 0 16px" }}>
            <MoscowMap at={map} clusterTimes={clusters} clickAt={clickCluster} w={880} h={514} />
          </div>
          <div style={{ flex: 1, padding: "4px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16.5, fontWeight: 700, marginBottom: 6 }}>
              С отставанием <Chip tone="orange">33</Chip>
            </div>
            {LATE.map(([a, b, d], i) => {
              const k = tw(s, [map + 0.5 + i * 0.09, map + 1.1 + i * 0.09], [0, 1], EXPO);
              return (
                <div key={a} style={{ display: "flex", alignItems: "center", padding: "11px 0", opacity: k, translate: `${(1 - k) * 30}px 0` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 650 }}>{a}</div>
                    <div style={{ fontSize: 13, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b}</div>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: C.orange }}>+{d} дн.</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
