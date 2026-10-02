import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, TL, tw, useSec } from "../lib";
import { AppWindow, Stage3D, type Pose } from "../components/AppWindow";
import { Dashboard } from "../screens/Dashboard";
import { Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { TmcRegistry } from "./S7Tmc";
import { LOGO_WINDOWS } from "./S10Close";

const ROLES = [
  { who: "Подрядчик", org: "ООО «Городские системы»", x: 420, y: 600, ry: 12, target: 1, sc: 0.29 },
  { who: "ФКР / ГАУ", org: "Фонд капитального ремонта", x: 960, y: 560, ry: 0, target: 3, sc: 0.36 },
  { who: "Поставщик", org: "ООО «Материалы города»", x: 1500, y: 600, ry: -12, target: 5, sc: 0.29 },
];

export const S9Roles: React.FC = () => {
  const s = useSec();
  const r = TL.roles;
  const d = TL.dashboard;
  const conv = tw(s, [67.75, 68.45], [0, 1], (t) => t * t * (3 - 2 * t));
  const labelsOut = tw(s, [67.5, 67.85], [0, 1], IN);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage glowX={0.5} glowY={0.55} intensity={1 - conv} />
      <AbsoluteFill style={{ background: "#fff", opacity: conv }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 86, display: "flex", justifyContent: "center", textAlign: "center", opacity: 1 - labelsOut }}>
        <Rise text={"ФКР, подрядчики и поставщики —\nв одной системе"} at={r.fan + 0.3} size={60} weight={780} highlight={["одной", "системе"]} center />
      </div>

      {/* data links */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - labelsOut }}>
        {[
          [0, 1],
          [1, 2],
          [0, 2],
        ].map(([a, b], i) => {
          const k = tw(s, [r.links[i], r.links[i] + 0.7], [0, 1], EXPO);
          if (k <= 0) return null;
          const A = ROLES[a];
          const B = ROLES[b];
          const midY = i === 2 ? 960 : 860;
          const path = `M${A.x} ${A.y + 150} Q ${(A.x + B.x) / 2} ${midY} ${B.x} ${B.y + 150}`; // under the windows
          return (
            <g key={i}>
              <path d={path} fill="none" stroke={C.blue200} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
              {[0, 1, 2].map((j) => {
                const t = ((s - r.links[i]) * 0.55 + j / 3) % 1;
                const tt = i % 2 ? 1 - t : t;
                const x = (1 - tt) * (1 - tt) * A.x + 2 * (1 - tt) * tt * ((A.x + B.x) / 2) + tt * tt * B.x;
                const y = (1 - tt) * (1 - tt) * (A.y + 150) + 2 * (1 - tt) * tt * midY + tt * tt * (B.y + 150);
                return <circle key={j} cx={x} cy={y} r={7} fill={j === 1 ? C.orange : C.blue} opacity={k} />;
              })}
            </g>
          );
        })}
      </svg>

      {ROLES.map((ro, i) => {
        const at = r.fan + i * 0.18;
        const k = tw(s, [at, at + 0.9], [0, 1], EXPO);
        const T = LOGO_WINDOWS[ro.target];
        const x = ro.x + (T.x - ro.x) * conv;
        const y = ro.y + (T.y - ro.y) * conv;
        const sc = ro.sc * (1 - conv) + 0.008 * conv;
        const pose: Pose = { x, y: y + (1 - k) * 300, s: sc * (0.8 + 0.2 * k), rx: 6 * (1 - conv), ry: ro.ry * (1 - conv), o: Math.min(1, k * 1.4) };
        return (
          <React.Fragment key={ro.who}>
            <Stage3D pose={pose} persp={2000}>
              <AppWindow
                nav={i === 1 ? "dashboard" : "tmc"}
                tmcSub="Заявки и поставки"
                role={ro.who}
                roleSub={ro.org}
                tabs={[{ id: "t", label: i === 1 ? "Дашборд" : i === 0 ? "Мои заявки" : "Поставки", icon: i === 1 ? "dashboard" : "package", active: true }]}
              >
                {i === 1 ? <Dashboard cards={d.cards} map={d.mapPush} clusters={d.clusters} /> : <TmcRegistry title={i === 0 ? "Мои заявки" : "Поставки и уведомления"} />}
              </AppWindow>
              <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: C.orangeLogo, opacity: tw(conv, [0.35, 0.85], [0, 1]) }} />
            </Stage3D>
            <div style={{ position: "absolute", left: ro.x - 200, width: 400, top: ro.y + ro.sc * 520 + 24, textAlign: "center", opacity: k * (1 - labelsOut), translate: `0 ${(1 - k) * 30}px` }}>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{ro.who}</div>
              <div style={{ fontSize: 19, color: C.muted, marginTop: 4 }}>{ro.org}</div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
