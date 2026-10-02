import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";
import { Rise } from "../components/Type";
import { ICheck, IPencil } from "../components/Icons";

/* «Как это работает сейчас» — the five «Сейчас» problems from the roadmap (p. 3),
   each a small, legible story with time to read it. */

export const NOW3 = { intro: 8.1, p: [9.0, 13.8, 18.6, 23.4, 28.2], end: 33.0 };

const glass: React.CSSProperties = {
  background: "linear-gradient(165deg, rgba(40,48,120,0.72), rgba(12,15,52,0.86))",
  borderRadius: 22,
  boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.06)",
  color: "#fff",
  fontFamily: FONT,
};
const muted = "rgba(255,255,255,0.62)";

const Tag: React.FC<{ at: number; children: React.ReactNode; tone?: "orange" | "red"; style?: React.CSSProperties }> = ({ at, children, tone = "orange", style }) => {
  const s = useSec();
  const p = pop(s, at, 0.5);
  return (
    <div style={{ position: "absolute", padding: "13px 24px", borderRadius: 99, background: tone === "orange" ? C.orange : "#ff5a6e", color: tone === "orange" ? "#1d0b00" : "#fff", fontFamily: FONT, fontSize: 24, fontWeight: 800, whiteSpace: "nowrap", boxShadow: `0 0 50px ${tone === "orange" ? "rgba(253,132,49,0.55)" : "rgba(255,90,110,0.55)"}`, scale: String(Math.max(0, p)), ...style }}>
      {children}
    </div>
  );
};

const appear = (s: number, at: number, d = 0.6) => tw(s, [at, at + d], [0, 1], EXPO);

/* ---------- 01 · four systems, four answers ---------- */
const Systems: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const SYS = [
    { badge: "1С", bg: "#F6C744", fg: "#3a2a00", name: "1С:Склад", k: "Остаток", v: 96 },
    { badge: "РС", bg: "#4C7BFF", fg: "#fff", name: "ИС РСКР", k: "Поставлено", v: 120 },
    { badge: "XLS", bg: "#2E9E5B", fg: "#fff", name: "остатки_v7.xlsx", k: "Остаток", v: -1 },
    { badge: "Д", bg: "#14B3A6", fg: "#fff", name: "Контур.Диадок", k: "По УПД", v: 110 },
  ];
  const q = appear(s, t + 0.15);
  return (
    <div style={{ position: "absolute", left: -410, top: -300, width: 820 }}>
      <div style={{ ...glass, padding: "20px 26px", opacity: q, translate: `0 ${(1 - q) * 30}px`, fontSize: 28, fontWeight: 700 }}>
        Сколько радиаторов на ул. Нагорной, 20 к4?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 26, position: "relative" }}>
        {SYS.map((x, i) => {
          const k = appear(s, t + 0.55 + i * 0.14);
          const cnt = Math.round(tw(s, [t + 1.2 + i * 0.1, t + 1.9 + i * 0.1], [0, Math.max(0, x.v)], OUT));
          return (
            <div key={x.name} style={{ ...glass, padding: 22, opacity: k, translate: `0 ${(1 - k) * 40}px`, scale: String(0.94 + 0.06 * k) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: x.bg, color: x.fg, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 900 }}>{x.badge}</div>
                <div style={{ fontSize: 21, fontWeight: 700 }}>{x.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 18 }}>
                <span style={{ fontSize: 20, color: muted }}>{x.k}</span>
                <span style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.03em", color: x.v < 0 ? "#ff8a98" : "#fff", fontVariantNumeric: "tabular-nums" }}>{x.v < 0 ? (s > t + 1.4 ? "?" : "") : cnt}</span>
                {x.v >= 0 && <span style={{ fontSize: 20, color: muted }}>шт.</span>}
              </div>
            </div>
          );
        })}
        {/* ≠ between neighbours */}
        {[
          [400, 92],
          [400, 300],
          [190, 196],
          [610, 196],
        ].map(([x, y], i) => (
          <div key={i} style={{ position: "absolute", left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 99, background: C.orange, color: "#1d0b00", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 900, scale: String(Math.max(0, pop(s, t + 2.3 + i * 0.12, 0.45))), boxShadow: "0 0 30px rgba(253,132,49,0.6)" }}>
            ≠
          </div>
        ))}
      </div>
      <Tag at={t + 3.0} style={{ left: 170, top: 600 }}>4 источника — 4 разных ответа</Tag>
    </div>
  );
};

/* ---------- 02 · one request, three versions, checked by hand ---------- */
const Requests: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const k = appear(s, t + 0.15);
  const ver = Math.min(2, Math.floor(tw(s, [t + 0.9, t + 2.5], [0, 2.99], (x) => x)));
  const qty = ["42", "36", "31"][ver];
  const checks = ["Сверить с уточнённой потребностью", "Сверить с остатками на объекте", "Сверить с проектными объёмами"];
  return (
    <div style={{ position: "absolute", left: -420, top: -280, width: 840, opacity: k, translate: `0 ${(1 - k) * 40}px` }}>
      <div style={{ ...glass, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", background: "rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, flex: 1 }}>Заявка З-2026-0188 · утеплитель</div>
          {["v1", "v2", "v3"].map((v, i) => (
            <div key={v} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 18, fontWeight: 800, background: i === ver ? C.orange : "rgba(255,255,255,0.08)", color: i === ver ? "#1d0b00" : i < ver ? "rgba(255,255,255,0.35)" : muted, textDecoration: i < ver ? "line-through" : undefined }}>
              {v}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 36, padding: "26px 28px" }}>
          {[
            ["Количество", <span key="q" style={{ fontVariantNumeric: "tabular-nums" }}>{qty} м³</span>],
            ["Потребность", "уточняется"],
            ["Основание", "предварительный объём"],
          ].map(([l, v], i) => (
            <div key={l as string}>
              <div style={{ fontSize: 17, color: muted }}>{l}</div>
              <div style={{ fontSize: i === 0 ? 46 : 24, fontWeight: 800, marginTop: 6, color: i === 0 ? "#fff" : "rgba(255,255,255,0.85)" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...glass, marginTop: 22, padding: "18px 24px" }}>
        {checks.map((c, i) => {
          const at = t + 1.3 + i * 0.75;
          const done = s > at + 0.5;
          const pk = tw(s, [at, at + 0.5], [0, 1]);
          return (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 14, height: 54, fontSize: 22, fontWeight: 600, color: done ? "#fff" : muted }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4)", background: done ? "#4C7BFF" : "transparent", display: "grid", placeItems: "center" }}>{done && <ICheck size={18} color="#fff" stroke={3} />}</div>
              {c}
              {pk > 0 && pk < 1 && <IPencil size={22} color={C.orange} style={{ marginLeft: 8, translate: `${Math.sin(s * 30) * 3}px 0` }} />}
              {done && <span style={{ marginLeft: "auto", fontSize: 17, color: C.orange, fontWeight: 700 }}>вручную</span>}
            </div>
          );
        })}
      </div>
      <Tag at={t + 3.4} style={{ left: 220, top: 520 }}>3 версии одной заявки</Tag>
    </div>
  );
};

/* ---------- 03 · a night street: the truck arrives, the site is not ready, back it goes ---------- */
const Truck: React.FC<{ flip: boolean; wheel: number; lights: number }> = ({ flip, wheel, lights }) => (
  <svg width={210} height={110} viewBox="0 0 210 110" style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}>
    {/* headlight beam */}
    <path d="M196 70 L330 52 L330 100 Z" fill="url(#beam)" opacity={lights} />
    <defs>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="rgba(255,236,190,0.75)" />
        <stop offset="1" stopColor="rgba(255,236,190,0)" />
      </linearGradient>
    </defs>
    <ellipse cx={104} cy={104} rx={96} ry={6} fill="rgba(0,0,0,0.45)" />
    <rect x={4} y={16} width={128} height={66} rx={8} fill="#EEF1F8" />
    <rect x={4} y={16} width={128} height={12} rx={6} fill="#D6DCEB" />
    <rect x={16} y={42} width={104} height={8} rx={4} fill={C.orange} />
    <path d="M134 34h38c4 0 7 2 9 5l17 22c1 2 2 4 2 6v15h-66z" fill="#3A63F0" />
    <path d="M142 40h26l14 18h-40z" fill="#BFD6FF" opacity={0.9} />
    <circle cx={196} cy={70} r={4} fill="#FFF3C8" style={{ filter: "drop-shadow(0 0 6px #FFE7A0)" }} />
    {[42, 166].map((cx) => (
      <g key={cx} transform={`rotate(${wheel} ${cx} 88)`}>
        <circle cx={cx} cy={88} r={15} fill="#0F1230" />
        <circle cx={cx} cy={88} r={6} fill="#9AA6C8" />
        <rect x={cx - 1.5} y={74} width={3} height={9} fill="#9AA6C8" />
      </g>
    ))}
  </svg>
);

const Lamp: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <>
    <div style={{ position: "absolute", left: x - 70, top: 152, width: 140, height: 250, background: "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,214,150,0.30), rgba(255,214,150,0) 70%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)" }} />
    <div style={{ position: "absolute", left: x - 2, top: 150, width: 4, height: 252, background: "#2A3166" }} />
    <div style={{ position: "absolute", left: x - 16, top: 146, width: 32, height: 8, borderRadius: 4, background: "#FFE2A8", boxShadow: `0 0 ${18 + Math.sin(s * 3 + x) * 2}px 6px rgba(255,210,140,0.6)` }} />
  </>
);

const Trips: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const k = appear(s, t + 0.1);
  const W = 900;
  const A = 175;
  const B = 650;
  const legs: [number, number, number, number][] = [
    [t + 0.5, t + 1.6, A, B],
    [t + 2.2, t + 3.1, B, A],
    [t + 3.4, t + 4.3, A, B],
  ];
  let x = A;
  let flip = false;
  let moving = false;
  legs.forEach(([a, b, from, to]) => {
    if (s >= a) {
      const u = tw(s, [a, b], [0, 1], INOUT);
      x = from + (to - from) * u;
      flip = to < from;
      moving = s < b;
    }
  });
  const trip = s >= legs[2][0] ? 3 : s >= legs[1][0] ? 2 : 1;
  const wheel = x * 2.2 * (flip ? -1 : 1);
  const notReady = pop(s, t + 1.65, 0.5) * (1 - tw(s, [t + 4.35, t + 4.6], [0, 1]));
  const bump = moving ? Math.sin(s * 40) * 1.2 : 0;
  const blink = 0.3 + 0.7 * Math.max(0, Math.sin(s * 4));
  return (
    <div style={{ position: "absolute", left: -W / 2, top: -280, width: W, opacity: k, translate: `0 ${(1 - k) * 40}px` }}>
      <div style={{ ...glass, height: 500, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(18,22,70,0.92), rgba(8,10,36,0.95))" }}>
        {/* moon glow */}
        <div style={{ position: "absolute", left: 360, top: -140, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(150,170,255,0.25), rgba(150,170,255,0))" }} />
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i * 157) % W, top: 20 + ((i * 53) % 120), width: 2, height: 2, borderRadius: 2, background: "#cfd8ff", opacity: 0.3 + 0.3 * Math.abs(Math.sin(s + i)) }} />
        ))}
        {/* ground */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 386, height: 14, background: "#262c5c" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, height: 100, background: "#141838" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 446, height: 4, backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.45) 50%, transparent 50%)", backgroundSize: "46px 4px", backgroundPositionX: `${-x * 0.5}px` }} />
        <Lamp x={330} s={s} />
        <Lamp x={500} s={s} />
        {/* warehouse */}
        <svg width={280} height={240} viewBox="0 0 280 240" style={{ position: "absolute", left: 12, top: 150 }}>
          <path d="M14 80 L140 26 L266 80 V236 H14 Z" fill="#232A6B" />
          <path d="M14 80 L140 26 L266 80" stroke="#5967D9" strokeWidth={4} fill="none" />
          <rect x={84} y={120} width={112} height={116} fill="#FFB25E" opacity={0.22} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={84} y={122 + i * 16} width={112} height={4} fill="#3A438F" />
          ))}
          <rect x={70} y={54} width={140} height={34} rx={8} fill="#11163F" />
        </svg>
        <div style={{ position: "absolute", left: 82, top: 207, width: 140, textAlign: "center", fontSize: 18, fontWeight: 900, letterSpacing: "0.08em", color: C.orange, textShadow: "0 0 14px rgba(253,132,49,0.9)" }}>СКЛАД ФКР</div>
        {/* construction site */}
        <svg width={280} height={330} viewBox="0 0 280 330" style={{ position: "absolute", left: 600, top: 60 }}>
          <rect x={36} y={150} width={160} height={180} fill="#232A6B" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={52 + c * 36} y={166 + r * 40} width={18} height={24} fill={(r * 3 + c) % 5 === 0 ? "#FFB25E" : "#141838"} opacity={(r * 3 + c) % 5 === 0 ? 0.9 : 1} />),
          )}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={26 + i * 42} y={140} width={4} height={190} fill={C.orange} opacity={0.8} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={26} y={160 + i * 44} width={172} height={4} fill={C.orange} opacity={0.8} />
          ))}
          <rect x={226} y={20} width={8} height={310} fill="#F6C744" />
          <rect x={110} y={20} width={160} height={8} fill="#F6C744" />
          <line x1={150} y1={28} x2={150} y2={90} stroke="#c9d2ff" strokeWidth={2} />
          <circle cx={268} cy={16} r={5} fill="#ff3b4d" opacity={blink} style={{ filter: "drop-shadow(0 0 8px #ff3b4d)" }} />
        </svg>
        {/* street sign with the address */}
        <div style={{ position: "absolute", left: 586, top: 326, width: 3, height: 60, background: "#9AA6C8" }} />
        <div style={{ position: "absolute", left: 520, top: 300, padding: "6px 12px", borderRadius: 6, background: "#2F5BE8", fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 0 0 2px #fff inset" }}>ул. Нагорная, 20 к4</div>
        {/* the truck */}
        <div style={{ position: "absolute", left: x - 105, top: 340 + bump }}>
          <Truck flip={flip} wheel={wheel} lights={moving ? 1 : 0.4} />
        </div>
        {/* status bubble above the building */}
        <div style={{ position: "absolute", left: 540, top: 112, translate: "0 -100%", scale: String(Math.max(0, notReady)), transformOrigin: "60% 100%" }}>
          <div style={{ padding: "11px 18px", borderRadius: 14, background: "#ff5a6e", fontSize: 19, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 0 40px rgba(255,90,110,0.55)" }}>Объект не готов к приёмке</div>
          <div style={{ marginLeft: 150, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "12px solid #ff5a6e" }} />
        </div>
        {/* trip counter */}
        <div style={{ position: "absolute", left: 30, top: 26, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22, color: muted, fontWeight: 650 }}>Рейс</span>
          <span style={{ fontSize: 52, fontWeight: 900, color: trip > 1 ? C.orange : "#fff", fontVariantNumeric: "tabular-nums", textShadow: trip > 1 ? "0 0 24px rgba(253,132,49,0.6)" : undefined }}>{trip}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map((n) => (
              <span key={n} style={{ width: 12, height: 12, borderRadius: 9, background: n <= trip ? (n > 1 ? C.orange : "#fff") : "rgba(255,255,255,0.18)", boxShadow: n <= trip && n > 1 ? "0 0 10px rgba(253,132,49,0.8)" : undefined }} />
            ))}
          </div>
        </div>
      </div>
      <Tag at={t + 3.6} style={{ left: 300, top: 530 }}>+2 лишних рейса</Tag>
    </div>
  );
};

/* ---------- 04 · statuses go round in a circle ---------- */
const Loop: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const k = appear(s, t + 0.1);
  const R = 210;
  const nodes = [
    { l: "На проверке", a: -90 },
    { l: "Возвращена\nна доработку", a: 0 },
    { l: "Исправлена", a: 90 },
    { l: "Повторная\nпроверка", a: 180 },
  ];
  const turn = tw(s, [t + 0.5, t + 3.0], [0, 1.75], INOUT);
  const ang = -90 + turn * 360;
  const exit = tw(s, [t + 3.05, t + 3.4], [0, 1], IN);
  const dx = Math.cos((ang * Math.PI) / 180) * R * (1 + exit * 0.0);
  const dy = Math.sin((ang * Math.PI) / 180) * R;
  const day = Math.round(tw(s, [t + 0.5, t + 3.1], [1, 14], (x) => x));
  const stamp = tw(s, [t + 3.2, t + 3.45], [0, 1], (x) => x * x);
  const active = Math.floor((((ang + 90 + 45) % 360) + 360) % 360 / 90);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: k, scale: String(0.94 + 0.06 * k) }}>
      <svg width={600} height={600} viewBox="-300 -300 600 600" style={{ position: "absolute", left: -300, top: -300, overflow: "visible" }}>
        <circle r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={10} />
        <circle r={R} fill="none" stroke={C.orange} strokeWidth={10} strokeDasharray={`${turn * 2 * Math.PI * R} 99999`} transform="rotate(-90)" strokeLinecap="round" opacity={0.85} />
        <circle cx={dx} cy={dy} r={14} fill="#fff" style={{ filter: "drop-shadow(0 0 14px rgba(255,255,255,0.9))" }} opacity={1 - stamp} />
      </svg>
      {nodes.map((n, i) => {
        const x = Math.cos((n.a * Math.PI) / 180) * (R + 0);
        const y = Math.sin((n.a * Math.PI) / 180) * (R + 0);
        const on = s > t + 0.5 && active === i && stamp === 0;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", ...glass, padding: "12px 18px", fontSize: 19, fontWeight: 750, whiteSpace: "pre", textAlign: "center", lineHeight: 1.2, boxShadow: on ? `0 0 0 2px ${C.orange}, 0 0 40px rgba(253,132,49,0.45)` : glass.boxShadow }}>
            {n.l}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, translate: "-50% -50%", textAlign: "center", color: "#fff", opacity: 1 - stamp * 0.7, whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 20, color: muted, fontWeight: 600 }}>на согласовании</div>
        <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", color: "#fff", textShadow: "0 0 40px rgba(253,132,49,0.55)" }}>{day}</div>
        <div style={{ fontSize: 22, color: muted, fontWeight: 600 }}>дней</div>
      </div>
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, translate: "-50% -50%", rotate: `${-10 + (1 - stamp) * -10}deg`, scale: String(2.2 - 1.2 * stamp), opacity: stamp, padding: "16px 30px", borderRadius: 16, boxShadow: "inset 0 0 0 5px #ff5a6e", color: "#ff5a6e", fontSize: 46, fontWeight: 900, letterSpacing: "0.04em", background: "rgba(20,8,20,0.85)" }}>
          АННУЛИРОВАНА
        </div>
      )}
    </div>
  );
};

/* ---------- 05 · three documents, three spellings ---------- */
const Retype: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const docs = [
    { d: "УПД № 418", name: "Радиатор биметалл. 10 с.", q: "100" },
    { d: "ТТН № 77", name: "Радиатор БМ 10 секций", q: "100" },
    { d: "М-15 № 12", name: "Радиатор 10-секц.", q: "98", bad: true },
  ];
  const ask = pop(s, t + 3.0, 0.5);
  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      {docs.map((doc, i) => {
        const at = t + 0.15 + i * 0.3;
        const k = appear(s, at);
        const n = Math.round(tw(s, [at + 0.35, at + 1.4], [0, doc.name.length], (x) => x));
        const typed = doc.name.slice(0, n);
        const done = n >= doc.name.length;
        const x = -420 + i * 290;
        return (
          <div key={doc.d} style={{ position: "absolute", left: x, top: -300 + (i === 1 ? -20 : 10), width: 260, opacity: k, translate: `0 ${(1 - k) * 50}px`, rotate: `${(i - 1) * 3}deg` }}>
            <div style={{ background: "#F6F4EE", color: "#1c1f33", borderRadius: 10, padding: 20, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)", fontFamily: FONT, height: 330, boxSizing: "border-box" }}>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.04em" }}>{doc.d}</div>
              <div style={{ height: 2, background: "#1c1f33", opacity: 0.15, margin: "10px 0 14px" }} />
              <div style={{ fontSize: 13, color: "#6b6d85" }}>Наименование</div>
              <div style={{ fontSize: 19, fontWeight: 700, minHeight: 52, marginTop: 4, color: done ? "#c42a40" : "#1c1f33" }}>
                {typed}
                {!done && <span style={{ display: "inline-block", width: 2, height: 20, background: "#1c1f33", marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 4) % 2 }} />}
              </div>
              <div style={{ fontSize: 13, color: "#6b6d85", marginTop: 10 }}>Количество</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: doc.bad && done ? "#c42a40" : "#1c1f33" }}>{done ? doc.q : ""}</div>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ height: 7, borderRadius: 9, background: "#1c1f33", opacity: 0.08, marginTop: 12, width: `${80 - j * 20}%` }} />
              ))}
            </div>
          </div>
        );
      })}
      {/* lines converge to the question */}
      <svg width={1000} height={600} viewBox="-500 -300 1000 600" style={{ position: "absolute", left: -500, top: -300, overflow: "visible" }}>
        {[-290, 0, 290].map((x, i) => (
          <path key={i} d={`M ${x} 60 Q ${x * 0.5} 150 0 190`} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="7 9" pathLength={1} strokeDashoffset={0} opacity={tw(s, [t + 2.6 + i * 0.1, t + 3.0], [0, 0.9])} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, top: 220, translate: "-50% -50%", scale: String(Math.max(0, ask)) }}>
        <div style={{ padding: "16px 28px", borderRadius: 99, background: C.orange, color: "#1d0b00", fontSize: 28, fontWeight: 900, whiteSpace: "nowrap", boxShadow: "0 0 50px rgba(253,132,49,0.6)" }}>Это одна позиция?</div>
      </div>
    </div>
  );
};

const PROBLEMS = [
  { title: "Несколько систем —\nразные цифры", desc: "Сложно оценить обеспеченность объектов и причины задержек", C: Systems },
  { title: "Заявки пересоздают\nи сверяют вручную", desc: "Материалы заказывают по предварительным объёмам, а потом сверяют с уточнённой потребностью и остатками", C: Requests },
  { title: "Лишние\nперевозки", desc: "Поставки не совпадают с готовностью объектов", C: Trips },
  { title: "Заявки ходят\nпо кругу", desc: "Долгая ручная проверка, возвраты на доработку и аннулирования", C: Loop },
  { title: "Одни данные —\nмного раз", desc: "Ручной ввод и сверка, расхождения в документах и названиях материалов", C: Retype },
];

export const Now3: React.FC = () => {
  const s = useSec();
  const intro = tw(s, [NOW3.intro, NOW3.intro + 0.8], [0, 1], EXPO);
  const dock = tw(s, [NOW3.p[0] - 0.3, NOW3.p[0] + 0.4], [0, 1], INOUT);
  const out = tw(s, [NOW3.end - 0.3, NOW3.end + 0.3], [0, 1], IN);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 960 + (96 - 960) * dock, top: 470 + (74 - 470) * dock, translate: `${-50 * (1 - dock)}% 0`, fontSize: 92 + (24 - 92) * dock, fontWeight: 800 - dock * 150, letterSpacing: "-0.03em", color: "#fff", whiteSpace: "nowrap", opacity: intro, filter: intro < 1 ? `blur(${(1 - intro) * 10}px)` : undefined }}>
        Как это работает <span style={{ color: C.orange }}>сейчас</span>
      </div>
      <div style={{ position: "absolute", left: 96, top: 118, display: "flex", gap: 8, opacity: dock }}>
        {NOW3.p.map((t, i) => (
          <div key={i} style={{ width: 58, height: 5, borderRadius: 9, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
            <div style={{ width: `${tw(s, [t, (NOW3.p[i + 1] ?? NOW3.end) - 0.1], [0, 100], (x) => x)}%`, height: 5, background: C.orange }} />
          </div>
        ))}
      </div>
      {PROBLEMS.map((p, i) => {
        const t = NOW3.p[i];
        const tn = NOW3.p[i + 1] ?? NOW3.end + 0.6;
        if (s < t - 0.4 || s > tn + 0.4) return null;
        const k = tw(s, [t - 0.1, t + 0.6], [0, 1], EXPO);
        const o = tw(s, [tn - 0.35, tn + 0.15], [0, 1], IN);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 96, top: 330, width: 700, opacity: 1 - o, translate: `${-o * 60}px 0` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.orange, opacity: k, fontVariantNumeric: "tabular-nums" }}>0{i + 1} / 05</div>
              <div style={{ height: 14 }} />
              <Rise text={p.title} at={t} size={66} weight={800} color="#fff" />
              <div style={{ marginTop: 26, fontSize: 27, lineHeight: 1.38, color: "rgba(255,255,255,0.7)", fontWeight: 500, opacity: tw(s, [t + 0.35, t + 0.9], [0, 1]), translate: `0 ${(1 - tw(s, [t + 0.35, t + 1], [0, 1], EXPO)) * 18}px` }}>{p.desc}</div>
            </div>
            <div style={{ position: "absolute", left: 1335, top: 560, opacity: Math.min(1, k * 1.4) * (1 - o), translate: `${(1 - k) * 240 - o * 240}px 0`, filter: k < 1 || o > 0 ? `blur(${(1 - k) * 8 + o * 10}px)` : undefined }}>
              <p.C t={t} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
