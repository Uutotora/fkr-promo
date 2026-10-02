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
const PencilCheck: React.FC<{ k: number }> = ({ k }) => (
  <svg width={34} height={34} viewBox="0 0 34 34">
    <rect x={2} y={2} width={30} height={30} rx={9} fill={k > 0.98 ? "rgba(76,123,255,0.25)" : "transparent"} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
    <path d="M9 17.5l5.5 5.5L25.5 11" fill="none" stroke="#9DB6FF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} style={{ filter: k > 0 ? "drop-shadow(0 0 6px rgba(120,160,255,0.9))" : undefined }} />
  </svg>
);

const Requests: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const VERS = [
    { v: "v1", q: "42", was: "" },
    { v: "v2", q: "36", was: "42" },
    { v: "v3", q: "31", was: "36" },
  ];
  const arrive = [t + 0.2, t + 1.35, t + 2.5];
  const checks = ["Сверить с уточнённой потребностью", "Сверить с остатками на объекте", "Сверить с проектными объёмами"];
  const checkAt = [t + 1.0, t + 2.1, t + 3.2];
  const latest = arrive.filter((a) => s >= a).length - 1;
  const panel = appear(s, t + 0.6);
  return (
    <div style={{ position: "absolute", left: -420, top: -310, width: 840 }}>
      <div style={{ position: "relative", height: 250 }}>
        {VERS.map((ver, i) => {
          const k = tw(s, [arrive[i], arrive[i] + 0.65], [0, 1], EXPO);
          if (k <= 0) return null;
          // how many newer versions sit on top of this one
          const depth = arrive.reduce((d, a, j) => d + (j > i ? tw(s, [a, a + 0.6], [0, 1], INOUT) : 0), 0);
          const stamp = i < 2 ? pop(s, arrive[i + 1] + 0.25, 0.45) : 0;
          const roll = tw(s, [arrive[i] + 0.15, arrive[i] + 0.8], [0, 1], OUT);
          return (
            <div
              key={ver.v}
              style={{
                position: "absolute",
                left: 60 - depth * 30,
                top: 30 - depth * 26,
                width: 640,
                ...glass,
                background: "linear-gradient(165deg, #283192, #11154a)",
                padding: 0,
                overflow: "hidden",
                opacity: Math.min(1, k * 1.4) * (1 - depth * 0.32),
                translate: `${(1 - k) * 160}px 0`,
                scale: String(1 - depth * 0.05),
                filter: (1 - k) + depth > 0.01 ? `blur(${(1 - k) * 8 + depth * 1.2}px)` : undefined,
                zIndex: i,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", background: "rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 21, fontWeight: 800, flex: 1 }}>Заявка З-2026-0188 · утеплитель</div>
                <div style={{ padding: "7px 14px", borderRadius: 10, fontSize: 18, fontWeight: 900, background: i === latest ? C.orange : "rgba(255,255,255,0.1)", color: i === latest ? "#1d0b00" : muted, boxShadow: i === latest ? "0 0 24px rgba(253,132,49,0.55)" : "none" }}>{ver.v}</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 28, padding: "20px 24px 24px" }}>
                <div>
                  <div style={{ fontSize: 17, color: muted }}>Количество</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 4 }}>
                    <span style={{ fontSize: 58, fontWeight: 900, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", display: "inline-block", translate: `0 ${(1 - roll) * 30}px`, opacity: roll, color: "#fff", textShadow: i > 0 ? "0 0 26px rgba(253,132,49,0.45)" : undefined }}>
                      {ver.q} м³
                    </span>
                    {ver.was && (
                      <span style={{ position: "relative", fontSize: 26, fontWeight: 800, color: "#ff8a98", opacity: roll }}>
                        было {ver.was}
                        <span style={{ position: "absolute", left: 0, top: "52%", height: 3, borderRadius: 2, width: `${tw(s, [arrive[i] + 0.5, arrive[i] + 0.9], [0, 100], INOUT)}%`, background: "#ff8a98" }} />
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 17, color: muted }}>Основание</div>
                  <div style={{ fontSize: 22, fontWeight: 750, marginTop: 6 }}>предварительный объём</div>
                </div>
              </div>
              {stamp > 0 && (
                <div style={{ position: "absolute", right: 24, top: 70, rotate: "-8deg", scale: String(Math.max(0, stamp)), padding: "8px 16px", borderRadius: 10, boxShadow: "inset 0 0 0 3px #ff5a6e", color: "#ff5a6e", fontSize: 22, fontWeight: 900, letterSpacing: "0.05em", background: "rgba(20,8,24,0.75)" }}>ПЕРЕСОЗДАНА</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ ...glass, marginTop: 34, padding: "16px 24px", opacity: panel, translate: `0 ${(1 - panel) * 30}px` }}>
        {checks.map((c, i) => {
          const k = tw(s, [checkAt[i], checkAt[i] + 0.55], [0, 1], INOUT);
          const writing = k > 0 && k < 1;
          return (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, height: 58, fontSize: 22, fontWeight: 650, color: k > 0.98 ? "#fff" : muted }}>
              <PencilCheck k={k} />
              {c}
              {writing && <IPencil size={24} color={C.orange} style={{ translate: `${Math.sin(s * 34) * 3}px ${Math.cos(s * 27) * 2}px` }} />}
              <span style={{ marginLeft: "auto", fontSize: 17, fontWeight: 800, color: C.orange, opacity: tw(s, [checkAt[i] + 0.5, checkAt[i] + 0.8], [0, 1]) }}>вручную</span>
            </div>
          );
        })}
      </div>
      <Tag at={t + 3.6} style={{ left: 250, top: 560 }}>3 версии одной заявки</Tag>
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
const StatusIcon: React.FC<{ kind: number; color: string }> = ({ kind, color }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    {kind === 0 && <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />}
    {kind === 1 && <path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />}
    {kind === 2 && <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />}
    {kind === 3 && <path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />}
  </svg>
);

const Loop: React.FC<{ t: number }> = ({ t }) => {
  const s = useSec();
  const k = appear(s, t + 0.1);
  const R = 220;
  const NODES = [
    { l: "На проверке", a: -90, c: "#8EA8FF" },
    { l: "Возвращена\nна доработку", a: 0, c: "#FFC56B" },
    { l: "Исправлена", a: 90, c: "#6FE0B0" },
    { l: "Повторная\nпроверка", a: 180, c: "#8EA8FF" },
  ];
  const turn = tw(s, [t + 0.5, t + 3.05], [0, 1.75], INOUT);
  const ang = -90 + turn * 360;
  const fail = tw(s, [t + 3.05, t + 3.4], [0, 1], EXPO);
  const stamp = tw(s, [t + 3.25, t + 3.5], [0, 1], (x) => x * x);
  const shock = tw(s, [t + 3.45, t + 4.3], [0, 1], OUT);
  const day = Math.round(tw(s, [t + 0.5, t + 3.1], [1, 14], (x) => x));
  const lap = Math.min(2, Math.floor(turn) + 1);
  const pos = (deg: number, r = R) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });
  const ringCol = fail > 0 ? `rgba(255,90,110,${0.5 + 0.4 * fail})` : C.orange;
  return (
    <div style={{ position: "absolute", left: 0, top: -10, opacity: k, scale: String(0.94 + 0.06 * k) }}>
      <svg width={700} height={700} viewBox="-350 -350 700 700" style={{ position: "absolute", left: -350, top: -350, overflow: "visible" }}>
        <defs>
          <filter id="cometGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={12} />
        <circle r={R} fill="none" stroke={ringCol} strokeWidth={6} strokeDasharray={`${Math.min(1, turn) * 2 * Math.PI * R} 99999`} transform="rotate(-90)" strokeLinecap="round" opacity={0.35 + 0.4 * fail} />
        {/* comet tail */}
        <g filter="url(#cometGlow)" opacity={1 - fail}>
          {Array.from({ length: 26 }, (_, i) => {
            const p = pos(ang - i * 3.2);
            return <circle key={i} cx={p.x} cy={p.y} r={10 - i * 0.33} fill={i === 0 ? "#fff" : C.orange} opacity={i === 0 ? 1 : (1 - i / 26) * 0.75} />;
          })}
        </g>
        {/* inner day ring */}
        <circle r={128} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle r={128} fill="none" stroke={fail > 0 ? "#ff5a6e" : "#8EA8FF"} strokeWidth={6} strokeDasharray={`${(day / 14) * 2 * Math.PI * 128} 9999`} transform="rotate(-90)" strokeLinecap="round" />
        {shock > 0 && shock < 1 && <circle r={60 + shock * 420} fill="none" stroke={`rgba(255,90,110,${0.7 * (1 - shock)})`} strokeWidth={3} filter="url(#cometGlow)" />}
      </svg>
      {NODES.map((n, i) => {
        const p = pos(n.a);
        let d = (((ang - n.a) % 360) + 360) % 360;
        const near = turn > 0.02 && d < 40 && fail === 0 ? 1 - d / 40 : 0;
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px 11px 12px", borderRadius: 16, background: "linear-gradient(165deg, rgba(40,48,120,0.95), rgba(14,17,56,0.97))", boxShadow: `0 0 0 ${1 + near * 1.5}px ${near > 0 ? n.c : "rgba(255,255,255,0.1)"}, 0 0 ${40 * near}px ${n.c}, 0 20px 40px -20px rgba(0,0,0,0.7)`, scale: String(1 + near * 0.08), color: "#fff", fontFamily: FONT }}>
            <span style={{ width: 34, height: 34, borderRadius: 99, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.08)" }}>
              <StatusIcon kind={i} color={n.c} />
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "pre", lineHeight: 1.15 }}>{n.l}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, translate: "-50% -50%", textAlign: "center", color: "#fff", whiteSpace: "nowrap", opacity: 1 - stamp * 0.85, fontFamily: FONT }}>
        <div style={{ fontSize: 18, color: muted, fontWeight: 650 }}>на согласовании</div>
        <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.02, fontVariantNumeric: "tabular-nums", textShadow: `0 0 40px ${fail > 0 ? "rgba(255,90,110,0.6)" : "rgba(140,170,255,0.55)"}` }}>{day}</div>
        <div style={{ fontSize: 20, color: muted, fontWeight: 650 }}>дней</div>
        <div style={{ marginTop: 10, display: "inline-block", padding: "5px 12px", borderRadius: 99, background: lap > 1 ? "rgba(253,132,49,0.2)" : "rgba(255,255,255,0.08)", color: lap > 1 ? C.orange : muted, fontSize: 16, fontWeight: 800 }}>круг {lap}</div>
      </div>
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, translate: "-50% -50%", rotate: `${-10 + (1 - stamp) * -12}deg`, scale: String(2.3 - 1.3 * stamp), opacity: stamp, padding: "16px 30px", borderRadius: 16, boxShadow: "inset 0 0 0 5px #ff5a6e, 0 0 50px rgba(255,90,110,0.45)", color: "#ff5a6e", fontSize: 46, fontWeight: 900, letterSpacing: "0.04em", background: "rgba(20,8,24,0.92)", fontFamily: FONT }}>
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
