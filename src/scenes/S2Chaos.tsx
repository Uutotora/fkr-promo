import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, TL, rand, tw, useSec } from "../lib";
import { ITable, IDb, IFile, IMail, IBox, ISign, ITrend, IShield } from "../components/Icons";
import { Rise } from "../components/Type";

const SYSTEMS = [
  { name: "1С:Бухгалтерия", sub: "ресурсный план", icon: IDb, x: 330, y: 250, z: 0.95 },
  { name: "ИС РСКР", sub: "согласования", icon: IShield, x: 1440, y: 215, z: 1.05 },
  { name: "Контур.Диадок", sub: "документооборот", icon: ISign, x: 1600, y: 610, z: 0.9 },
  { name: "Google-таблицы", sub: "параллельный контроль", icon: ITable, x: 420, y: 700, z: 1.1 },
  { name: "1С:Управление торговлей", sub: "складской учёт", icon: IBox, x: 900, y: 150, z: 0.8 },
  { name: "Excel-макросы", sub: "отчёты руководству", icon: ITrend, x: 1080, y: 860, z: 0.85 },
  { name: "Почта и мессенджеры", sub: "запросы подрядчикам", icon: IMail, x: 180, y: 470, z: 0.75 },
  { name: "Бумажные акты", sub: "КС-2 · М-15 · ТОРГ-2", icon: IFile, x: 1720, y: 400, z: 0.7 },
];

const ALERTS = [
  { text: "Ручная сверка", x: 640, y: 330 },
  { text: "Дубли данных", x: 1250, y: 420 },
  { text: "Где остаток?", x: 760, y: 780 },
  { text: "Кто согласует?", x: 1390, y: 760 },
  { text: "Версия от 14.08?", x: 300, y: 590 },
];

const LINKS: [number, number][] = [
  [0, 4],
  [4, 1],
  [1, 2],
  [2, 5],
  [5, 3],
  [3, 6],
  [6, 0],
  [0, 3],
  [1, 7],
  [4, 5],
];

export const S2Chaos: React.FC = () => {
  const s = useSec();
  const { cards, head1, head2, glitches, suck } = TL.chaos;
  const sk = tw(s, [suck, 16.0], [0, 1], (t) => t * t * t);
  const glitch = glitches.reduce((g, t) => Math.max(g, s >= t && s < t + 0.14 ? 1 - (s - t) / 0.14 : 0), 0);
  const enter = tw(s, [7.7, 8.5], [0, 1]);

  const pos = SYSTEMS.map((c, i) => {
    const drift = 1 - sk;
    const dx = Math.sin(s * 0.6 + i * 1.7) * 14 * drift;
    const dy = Math.cos(s * 0.5 + i * 2.3) * 12 * drift;
    const x = c.x + dx + (960 - c.x) * sk;
    const y = c.y + dy + (520 - c.y) * sk;
    return { x, y };
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: FONT, opacity: enter }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 50% 50%, #0b1263 0%, ${C.night} 60%, #00011a 100%)` }} />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${s * 4}px ${s * 2}px`,
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)",
          opacity: 1 - sk,
        }}
      />

      {/* broken links between systems */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {LINKS.map(([a, b], i) => {
          const t0 = cards[Math.max(a, b)] + 0.3;
          const k = tw(s, [t0, t0 + 0.6], [0, 1], EXPO);
          if (k <= 0) return null;
          const p = pos[a];
          const q = pos[b];
          const flick = 0.35 + 0.35 * Math.abs(Math.sin(s * 7 + i * 3.1));
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={p.x + (q.x - p.x) * k}
              y2={p.y + (q.y - p.y) * k}
              stroke={i % 3 === 0 ? C.orange : "rgba(160,170,255,0.7)"}
              strokeWidth={2}
              strokeDasharray="6 10"
              strokeDashoffset={-s * 40}
              opacity={flick * (1 - sk)}
            />
          );
        })}
      </svg>

      {SYSTEMS.map((c, i) => {
        const at = cards[i];
        const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
        if (k <= 0) return null;
        const Icon = c.icon;
        const { x, y } = pos[i];
        const g = glitch * (i % 2 ? 1 : -1) * 10 * rand(i + Math.floor(s * 30));
        return (
          <div
            key={c.name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              translate: `-50% -50%`,
              scale: String(c.z * (0.6 + 0.4 * k) * (1 - sk * 0.92)),
              rotate: `${(1 - k) * (i % 2 ? 8 : -8) + Math.sin(s + i) * 1.5 + sk * (i % 2 ? 140 : -140)}deg`,
              opacity: Math.min(1, k * 1.5) * (1 - tw(sk, [0.8, 1], [0, 1])),
              filter: `blur(${(1 - k) * 10 + (1 - c.z) * 3 + sk * 6}px)`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 26px 20px 20px",
              borderRadius: 22,
              background: "linear-gradient(160deg, rgba(36,44,140,0.78), rgba(10,14,70,0.85))",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
              color: "#fff",
              marginLeft: g,
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.08)", display: "grid", placeItems: "center" }}>
              <Icon size={28} color="#c9d2ff" />
            </div>
            <div>
              <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{c.name}</div>
              <div style={{ fontSize: 19, color: "rgba(255,255,255,0.6)", marginTop: 3, whiteSpace: "nowrap" }}>{c.sub}</div>
            </div>
          </div>
        );
      })}

      {ALERTS.map((a, i) => {
        const at = glitches[i] - 0.05;
        const k = tw(s, [at, at + 0.35], [0, 1], EXPO);
        if (k <= 0) return null;
        return (
          <div
            key={a.text}
            style={{
              position: "absolute",
              left: a.x + (960 - a.x) * sk,
              top: a.y + (520 - a.y) * sk,
              translate: "-50% -50%",
              scale: String((0.5 + 0.5 * k) * (1 - sk)),
              opacity: k * (1 - sk),
              padding: "10px 18px",
              borderRadius: 99,
              background: C.orange,
              color: "#1a0a00",
              fontSize: 21,
              fontWeight: 700,
              boxShadow: "0 0 40px rgba(253,132,49,0.55)",
              whiteSpace: "nowrap",
            }}
          >
            {a.text}
          </div>
        );
      })}

      {/* headline */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - sk, translate: `${glitch * 8}px 0` }}>
        <div style={{ textAlign: "center", padding: "36px 60px", borderRadius: 40, background: "radial-gradient(closest-side, rgba(0,2,48,0.85), rgba(0,2,48,0))" }}>
          <Rise text="Данные живут в разных системах." at={head1} out={head2 - 0.3} size={78} weight={750} color="#fff" style={{ justifyContent: "center" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - sk, translate: `${-glitch * 10}px 0` }}>
        <div style={{ textAlign: "center", padding: "36px 60px", borderRadius: 40, background: "radial-gradient(closest-side, rgba(0,2,48,0.85), rgba(0,2,48,0))" }}>
          <Rise text={"Общей картины нет\nни у кого."} at={head2} size={92} weight={800} color="#fff" highlight={["ни", "у", "кого."]} highlightColor={C.orange} />
        </div>
      </AbsoluteFill>
      {/* RGB split during glitches */}
      {glitch > 0 && <AbsoluteFill style={{ background: "rgba(253,132,49,0.06)", mixBlendMode: "screen" }} />}
      {/* implosion core */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 520,
          width: 40,
          height: 40,
          translate: "-50% -50%",
          borderRadius: 99,
          background: "#fff",
          boxShadow: `0 0 ${60 + sk * 300}px ${20 + sk * 120}px rgba(160,190,255,${0.5 * sk})`,
          scale: String(sk * 2.2),
          opacity: sk,
        }}
      />
    </AbsoluteFill>
  );
};
