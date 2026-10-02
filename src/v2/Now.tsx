import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";
import { Rise } from "../components/Type";

/* «Как это работает сейчас» — five problems from the roadmap (page 3, column «Сейчас»),
   each told by one small living artefact floating in the night sky. */

export const NOW = { intro: 8.1, p: [9.0, 12.1, 15.2, 18.3, 21.4], end: 24.3 };

const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(46,60,182,0.66), rgba(14,20,92,0.78))",
  borderRadius: 20,
  boxShadow: "0 34px 70px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.07)",
  color: "#fff",
  fontFamily: FONT,
};

const Win: React.FC<{ title: string; w: number; children: React.ReactNode; style?: React.CSSProperties; tone?: string }> = ({ title, w, children, style, tone = "rgba(255,255,255,0.08)" }) => (
  <div style={{ ...glass, width: w, overflow: "hidden", ...style }}>
    <div style={{ height: 40, display: "flex", alignItems: "center", gap: 7, padding: "0 14px", background: tone }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: "rgba(255,255,255,0.28)" }} />
      ))}
      <span style={{ marginLeft: 8, fontSize: 16, fontWeight: 650, color: "rgba(255,255,255,0.85)" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 18px 18px" }}>{children}</div>
  </div>
);

const Tag: React.FC<{ at: number; children: React.ReactNode; tone?: "orange" | "red"; style?: React.CSSProperties }> = ({ at, children, tone = "orange", style }) => {
  const s = useSec();
  const p = pop(s, at, 0.5);
  return (
    <div
      style={{
        position: "absolute",
        padding: "11px 20px",
        borderRadius: 99,
        background: tone === "orange" ? C.orange : "#ff5a6e",
        color: tone === "orange" ? "#1d0b00" : "#fff",
        fontFamily: FONT,
        fontSize: 22,
        fontWeight: 750,
        whiteSpace: "nowrap",
        boxShadow: `0 0 50px ${tone === "orange" ? "rgba(253,132,49,0.6)" : "rgba(255,90,110,0.6)"}`,
        scale: String(Math.max(0, p)),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* 01 — the same object, four systems, four different answers */
const Systems: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const rows = [
    { sys: "1С:Склад", k: "Остаток", v: "96 шт.", x: -330, y: -170 },
    { sys: "ИС РСКР", k: "Поставлено", v: "120 шт.", x: 40, y: -210 },
    { sys: "остатки_v7.xlsx", k: "Остаток", v: "?", x: -280, y: 60, bad: true },
    { sys: "Контур.Диадок", k: "По УПД", v: "110 шт.", x: 90, y: 30 },
  ];
  const focus = Math.floor(tw(s, [t + 1.0, t + 2.6], [0, 3.99], (x) => x));
  return (
    <>
      {rows.map((r, i) => {
        const k = tw(s, [t + 0.1 + i * 0.13, t + 0.8 + i * 0.13], [0, 1], EXPO);
        const on = s > t + 1.0 && focus === i;
        return (
          <div key={r.sys} style={{ position: "absolute", left: r.x, top: r.y, opacity: k, translate: `0 ${(1 - k) * 40}px`, scale: String((0.9 + 0.1 * k) * (on ? 1.05 : 1)) }}>
            <Win title={r.sys} w={330} style={{ boxShadow: on ? `0 0 0 2px ${C.orange}, 0 0 60px rgba(253,132,49,0.35)` : glass.boxShadow }}>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>ул. Нагорная, 20 к4 · Радиатор</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 17, color: "rgba(255,255,255,0.7)" }}>{r.k}</span>
                <span style={{ fontSize: 34, fontWeight: 800, color: r.bad ? "#ff8a98" : "#fff" }}>{r.v}</span>
              </div>
            </Win>
          </div>
        );
      })}
      <Tag at={t + 1.9} style={{ left: -150, top: 230 }}>4 источника — 4 разных ответа</Tag>
    </>
  );
};

/* 02 — the request is recreated and checked by hand */
const Requests: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const vers = [
    { v: "версия 1", q: "42 м³" },
    { v: "версия 2", q: "36 м³" },
    { v: "версия 3", q: "31 м³" },
  ];
  return (
    <>
      {vers.map((r, i) => {
        const at = t + 0.15 + i * 0.55;
        const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
        const dead = i < 2 ? tw(s, [at + 0.45, at + 0.7], [0, 1]) : 0;
        return (
          <div key={r.v} style={{ position: "absolute", left: -280 + i * 36, top: -210 + i * 96, opacity: k * (1 - dead * 0.6), translate: `${(1 - k) * 80}px 0`, filter: `blur(${dead * 1.5}px)` }}>
            <Win title={`Заявка З-2026-0188 · ${r.v}`} w={520}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", fontSize: 15, color: "rgba(255,255,255,0.6)", rowGap: 8 }}>
                <span>Материал</span>
                <span>Заявка</span>
                <span>Потребность</span>
                <span>Остаток</span>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 650 }}>Утеплитель</span>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: dead > 0.5 ? "line-through" : undefined, textDecorationColor: "#ff8a98" }}>{r.q}</span>
                <span style={{ color: "#fff", fontSize: 18 }}>уточняется</span>
                <span style={{ color: "#ff8a98", fontSize: 18, fontWeight: 700 }}>сверить</span>
              </div>
            </Win>
          </div>
        );
      })}
      <Tag at={t + 1.9} style={{ left: -60, top: 210 }}>Пересоздана 3 раза · сверка вручную</Tag>
    </>
  );
};

/* 03 — deliveries not synced with the site: extra trips */
const Trips: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const A = { x: -280, y: 60 };
  const B = { x: 260, y: -60 };
  const k = tw(s, [t + 0.3, t + 2.7], [0, 3], (x) => x);
  const leg = Math.min(2.999, k);
  const seg = Math.floor(leg);
  const u = INOUT(leg - seg);
  const from = seg % 2 === 0 ? A : B;
  const to = seg % 2 === 0 ? B : A;
  const tx = from.x + (to.x - from.x) * u;
  const ty = from.y + (to.y - from.y) * u - Math.sin(u * Math.PI) * 80;
  const trip = Math.min(3, Math.floor(k / 1) + 1);
  const ent = tw(s, [t, t + 0.6], [0, 1], EXPO);
  const Node: React.FC<{ p: { x: number; y: number }; label: string; sub: string; warn?: boolean }> = ({ p, label, sub, warn }) => (
    <div style={{ position: "absolute", left: p.x - 120, top: p.y - 50, width: 240, ...glass, padding: "14px 18px", opacity: ent, boxShadow: warn && s > t + 0.9 ? `0 0 0 2px #ff8a98, ${glass.boxShadow}` : glass.boxShadow }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 15, color: warn ? "#ff9eab" : "rgba(255,255,255,0.6)", marginTop: 3 }}>{sub}</div>
    </div>
  );
  return (
    <>
      <svg width={900} height={600} viewBox="-450 -300 900 600" style={{ position: "absolute", left: -450, top: -300, overflow: "visible" }}>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M ${A.x} ${A.y} Q 0 ${-120 - i * 40} ${B.x} ${B.y}`}
            fill="none"
            stroke={i === 0 ? "rgba(160,180,255,0.7)" : C.orange}
            strokeWidth={3}
            strokeDasharray="8 10"
            strokeDashoffset={-s * 50}
            opacity={tw(k, [i, i + 0.4], [0, i === 0 ? 0.8 : 0.9])}
          />
        ))}
      </svg>
      <Node p={A} label="Склад" sub="Партия готова" />
      <Node p={B} label="Объект" sub="Не готов к приёмке" warn />
      <div style={{ position: "absolute", left: tx - 28, top: ty - 28, width: 56, height: 56, borderRadius: 16, background: C.orange, display: "grid", placeItems: "center", boxShadow: "0 0 40px rgba(253,132,49,0.6)", opacity: ent }}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#1d0b00" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: -90, top: 140, ...glass, padding: "12px 22px", fontSize: 24, fontWeight: 800, opacity: ent }}>
        Рейс <span style={{ color: C.orange, fontVariantNumeric: "tabular-nums" }}>{trip}</span>
      </div>
      <Tag at={t + 2.0} style={{ left: -40, top: 220 }}>+2 лишних рейса</Tag>
    </>
  );
};

/* 04 — the request goes round in circles */
const Loop: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const states = [
    ["На проверке", "rgba(120,150,255,0.25)", "#c8d4ff"],
    ["Возвращена на доработку", "rgba(253,180,60,0.25)", "#ffd27a"],
    ["На проверке", "rgba(120,150,255,0.25)", "#c8d4ff"],
    ["Возвращена на доработку", "rgba(253,180,60,0.25)", "#ffd27a"],
    ["Аннулирована", "rgba(255,90,110,0.28)", "#ff9eab"],
  ];
  const idx = Math.min(4, Math.floor(tw(s, [t + 0.5, t + 2.4], [0, 4.99], (x) => x)));
  const day = Math.round(tw(s, [t + 0.4, t + 2.5], [1, 14], (x) => x));
  const ent = tw(s, [t, t + 0.6], [0, 1], EXPO);
  const flip = tw(s % 1, [0, 0.12], [0, 1]);
  return (
    <>
      <div style={{ position: "absolute", left: -320, top: -160, opacity: ent, translate: `${(1 - ent) * 80}px 0` }}>
        <Win title="Заявка З-2026-0176 · штукатурная смесь" w={640}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 17, color: "rgba(255,255,255,0.6)" }}>Статус</div>
            <div key={idx} style={{ padding: "10px 18px", borderRadius: 12, background: states[idx][1], color: states[idx][2], fontSize: 24, fontWeight: 800, scale: String(0.9 + 0.1 * flip) }}>
              {states[idx][0]}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 22 }}>
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 12, borderRadius: 4, background: i < day ? (i > 10 ? "#ff8a98" : i > 4 ? "#ffd27a" : "#8ea8ff") : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
            На согласовании: <b style={{ color: "#fff", fontSize: 26, fontVariantNumeric: "tabular-nums" }}>{day}</b> дн.
          </div>
        </Win>
      </div>
      <Tag at={t + 2.25} tone="red" style={{ left: -120, top: 150 }}>Заявка аннулирована</Tag>
    </>
  );
};

/* 05 — the same data typed again and again, slightly differently */
const Retype: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const docs = [
    { d: "УПД", name: "Радиатор биметалл. 10 с.", q: "100" },
    { d: "ТТН", name: "Радиатор БМ 10 секций", q: "100" },
    { d: "М-15", name: "Радиатор 10-секц.", q: "98", bad: true },
  ];
  return (
    <>
      {docs.map((doc, i) => {
        const at = t + 0.1 + i * 0.35;
        const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
        const n = Math.round(tw(s, [at + 0.3, at + 1.3], [0, doc.name.length], (x) => x));
        const typed = doc.name.slice(0, n);
        const done = n >= doc.name.length;
        return (
          <div key={doc.d} style={{ position: "absolute", left: -390 + i * 280, top: -150 + (i % 2) * 40, opacity: k, translate: `0 ${(1 - k) * 50}px` }}>
            <Win title={doc.d} w={270}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>Наименование</div>
              <div style={{ fontSize: 18, fontWeight: 650, minHeight: 50, marginTop: 4, textDecoration: done ? "underline wavy" : undefined, textDecorationColor: "#ff8a98", textUnderlineOffset: 5 }}>
                {typed}
                {!done && <span style={{ display: "inline-block", width: 2, height: 20, background: "#fff", marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 4) % 2 }} />}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 8 }}>Количество</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: doc.bad && done ? "#ff8a98" : "#fff" }}>{done ? doc.q : ""}</div>
            </Win>
          </div>
        );
      })}
      <Tag at={t + 2.1} style={{ left: -170, top: 170 }}>Одна позиция — три написания</Tag>
    </>
  );
};

const PROBLEMS = [
  { title: "Несколько систем —\nразные цифры", desc: "Сложно оценить обеспеченность объектов и причины задержек", C: Systems },
  { title: "Заявки пересоздают\nи сверяют вручную", desc: "Материалы заказывают по предварительным объёмам и сверяют с остатками на объектах", C: Requests },
  { title: "Лишние\nперевозки", desc: "Поставки не совпадают с готовностью объектов", C: Trips },
  { title: "Заявки ходят\nпо кругу", desc: "Долгая ручная проверка, возвраты на доработку и аннулирования", C: Loop },
  { title: "Одни данные —\nмного раз", desc: "Ручной ввод и сверка, расхождения в документах и названиях материалов", C: Retype },
];

export const Now: React.FC = () => {
  const s = useSec();
  const intro = tw(s, [NOW.intro, NOW.intro + 0.8], [0, 1], EXPO);
  const dock = tw(s, [NOW.p[0] - 0.3, NOW.p[0] + 0.4], [0, 1], INOUT);
  const out = tw(s, [NOW.end - 0.3, NOW.end + 0.3], [0, 1], IN);
  const cur = NOW.p.reduce((c, t, i) => (s >= t ? i : c), 0);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: 1 - out }}>
      {/* chapter title: centre → top-left */}
      <div
        style={{
          position: "absolute",
          left: 960 + (96 - 960) * dock,
          top: 470 + (78 - 470) * dock,
          translate: `${-50 * (1 - dock)}% 0`,
          fontSize: 92 + (24 - 92) * dock,
          fontWeight: 800 - dock * 150,
          letterSpacing: "-0.03em",
          color: "#fff",
          whiteSpace: "nowrap",
          opacity: intro,
          filter: `blur(${(1 - intro) * 10}px)`,
        }}
      >
        Как это работает <span style={{ color: C.orange }}>сейчас</span>
      </div>
      {/* progress */}
      <div style={{ position: "absolute", left: 96, top: 122, display: "flex", gap: 8, opacity: dock }}>
        {NOW.p.map((t, i) => (
          <div key={i} style={{ width: 54, height: 5, borderRadius: 9, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
            <div style={{ width: `${tw(s, [t, (NOW.p[i + 1] ?? NOW.end) - 0.1], [0, 100], (x) => x)}%`, height: 5, background: C.orange }} />
          </div>
        ))}
      </div>

      {PROBLEMS.map((p, i) => {
        const t = NOW.p[i];
        const tn = NOW.p[i + 1] ?? NOW.end + 0.6;
        if (s < t - 0.4 || s > tn + 0.4) return null;
        const k = tw(s, [t - 0.1, t + 0.6], [0, 1], EXPO);
        const o = tw(s, [tn - 0.35, tn + 0.15], [0, 1], IN);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 96, top: 330, width: 720, opacity: 1 - o, translate: `${-o * 60}px 0` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.orange, opacity: k, fontVariantNumeric: "tabular-nums" }}>0{i + 1}</div>
              <div style={{ height: 14 }} />
              <Rise text={p.title} at={t} size={66} weight={800} color="#fff" />
              <div style={{ marginTop: 26, fontSize: 27, lineHeight: 1.35, color: "rgba(255,255,255,0.68)", fontWeight: 500, opacity: tw(s, [t + 0.35, t + 0.9], [0, 1]), translate: `0 ${(1 - tw(s, [t + 0.35, t + 1], [0, 1], EXPO)) * 18}px` }}>{p.desc}</div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 1290,
                top: 540,
                opacity: Math.min(1, k * 1.4) * (1 - o),
                translate: `${(1 - k) * 260 - o * 260}px 0`,
                scale: String(1.22 * (0.94 + 0.06 * k)),
                filter: `blur(${(1 - k) * 8 + o * 10}px)`,
              }}
            >
              <p.C t={t} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
