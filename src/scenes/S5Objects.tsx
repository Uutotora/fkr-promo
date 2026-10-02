import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, INOUT, TL, tw, useSec } from "../lib";
import { AppWindow, HOME, SIDEBAR, Stage3D, TABBAR, focus, poseAt, type Pose, type Tab } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { Dashboard } from "../screens/Dashboard";
import { ObjectsList, ObjectCard } from "../screens/Objects";
import { Eyebrow, Fade, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { CURSOR_A, NAV_Y } from "./S4Dashboard";

export const Caption: React.FC<{ at: number; out: number; children: React.ReactNode; dark?: boolean; top?: number }> = ({ at, out, children, dark, top }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
  const o = tw(s, [out, out + 0.35], [0, 1]);
  if (k <= 0 || o >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...(top !== undefined ? { top } : { bottom: 64 }), display: "flex", justifyContent: "center", opacity: k * (1 - o), translate: `0 ${(1 - k) * 30 + o * 10}px` }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 650,
          letterSpacing: "-0.01em",
          color: dark ? "#fff" : C.ink,
          background: dark ? "rgba(0,2,48,0.75)" : "rgba(255,255,255,0.92)",
          padding: "18px 30px",
          borderRadius: 22,
          boxShadow: "0 24px 50px -20px rgba(0,2,48,0.35)",
          filter: `blur(${(1 - k) * 6}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const CX = SIDEBAR;
export const CY = TABBAR;
export const ROW1 = { x: CX + 170, y: CY + 251 };
export const SEARCH = { x: CX + 860, y: CY + 51 };

export const CURSOR_B: [number, number, number][] = [
  ...CURSOR_A.slice(-2),
  [31.6, 620, 560],
  [32.5, SEARCH.x, SEARCH.y],
  [34.4, SEARCH.x + 10, SEARCH.y + 6],
  [35.25, ROW1.x, ROW1.y],
  [36.4, 820, 470],
];

export const objectsTabs = (s: number): Tab[] => [
  { id: "d", label: "Дашборд", icon: "dashboard", active: s < TL.objects.clickNav },
  { id: "o", label: "Объекты ремонта", icon: "building", from: TL.objects.clickNav, active: s >= TL.objects.clickNav && s < TL.objects.open },
  { id: "n", label: "ул. Нагорная, д. 20, корп. 4", icon: "building", from: TL.objects.open, active: s >= TL.objects.open },
];

export const S5Objects: React.FC = () => {
  const s = useSec();
  const o = TL.objects;
  const d = TL.dashboard;
  const keys: [number, Pose][] = [
    [30.0, { ...HOME }],
    [31.9, { ...HOME, s: 0.68, x: 1230 }],
    [32.6, focus(820, 330, 1.02)],
    [34.6, focus(800, 340, 1.05)],
    [35.7, focus(820, 380, 0.98)],
    [37.1, focus(830, 420, 1.0)],
    [38.0, { ...HOME }],
  ];
  const pose = poseAt(s, keys, INOUT);
  const swap = tw(s, [o.clickNav + 0.05, o.clickNav + 0.3], [0, 1]);
  const listOut = tw(s, [o.open - 0.05, o.open + 0.3], [0, 1]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage />
      <div style={{ position: "absolute", left: 96, top: 340, width: 560 }}>
        <Eyebrow n="02" label="Объекты" at={30.5} out={32.15} />
        <div style={{ height: 26 }} />
        <Rise text={"Реестр всех\nдомов программы"} at={30.6} out={32.1} size={66} weight={780} highlight={["домов"]} />
      </div>
      <Stage3D pose={pose}>
        <AppWindow nav={s < o.clickNav ? "dashboard" : "objects"} tabs={objectsTabs(s)}>
          {swap < 1 && (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
              <Dashboard cards={d.cards} map={d.mapPush - 0.2} clusters={d.clusters} clickCluster={d.clickCluster} highlightRow={d.clickYears} />
            </div>
          )}
          {swap > 0 && listOut < 1 && (
            <div style={{ position: "absolute", inset: 0, opacity: swap * (1 - listOut), translate: `${-listOut * 60}px 0` }}>
              <ObjectsList rows={o.rows} typeTimes={o.type} query="Нагорная" filterAt={o.filter} pressRow={o.clickRow} />
            </div>
          )}
          {s >= o.open && <ObjectCard at={o.open} />}
        </AppWindow>
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor keys={CURSOR_B} clicks={[o.clickNav, o.clickSearch, o.clickRow]} scale={1 / pose.s} show={[29, 37.6]} />
        </div>
      </Stage3D>
      <Caption at={32.9} out={35.2}>Поиск по адресу, УНОМ, подрядчику или договору</Caption>
      <Caption at={36.0} out={38.0}>
        Каждый дом — <span style={{ color: C.blue }}>одна карточка</span>
      </Caption>
    </AbsoluteFill>
  );
};

export { NAV_Y, Fade };
