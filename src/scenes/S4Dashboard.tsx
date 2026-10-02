import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { INOUT, TL, tw, useSec } from "../lib";
import { AppWindow, HOME, Stage3D, focus, poseAt, type Pose } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { Dashboard } from "../screens/Dashboard";
import { Eyebrow, Fade, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";

export const NAV_Y = { dashboard: 193, objects: 241, contracts: 289, tmc: 337, approvals: 385 };

/** Pointer path shared by the dashboard and objects scenes so the hand-off is seamless. */
export const CURSOR_A: [number, number, number][] = [
  [21.6, 1000, 760],
  [22.4, 470, 300],
  [23.3, 1300, 340],
  [24.2, 1320, 334],
  [25.4, 980, 640],
  [27.5, 720, 840],
  [28.0, 712, 834],
  [29.2, 700, 830],
  [30.45, 140, NAV_Y.objects],
];

export const S4Dashboard: React.FC = () => {
  const s = useSec();
  const d = TL.dashboard;
  const keys: [number, Pose][] = [
    [19.45, { x: 960, y: 640, s: 0.28, rx: 38, ry: 0, o: 0, blur: 24 }],
    [20.35, { ...HOME }],
    [24.4, { ...HOME, s: 0.68, x: 1228, ry: -8 }],
    [25.3, focus(900, 720, 1.1)],
    [28.3, focus(860, 740, 1.16)],
    [29.5, { ...HOME }],
  ];
  const pose = poseAt(s, keys, INOUT);
  // entrance uses a stronger ease for the "drop"
  const ent = tw(s, [19.45, 20.35], [0, 1], (t) => 1 - Math.pow(1 - t, 4));
  const p0: Pose = ent < 1 ? { x: 960 + (HOME.x - 960) * ent, y: 640 + (HOME.y - 640) * ent, s: 0.28 + (HOME.s - 0.28) * ent, rx: 38 + (HOME.rx - 38) * ent, ry: HOME.ry * ent, o: Math.min(1, ent * 2), blur: 24 * (1 - ent) } : pose;

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage />
      <div style={{ position: "absolute", left: 96, top: 330, width: 560 }}>
        <Eyebrow n="01" label="Программа" at={d.head} out={24.3} />
        <div style={{ height: 26 }} />
        <Rise text={"Вся программа —\nна одном экране"} at={d.head + 0.1} out={24.25} size={66} weight={780} highlight={["одном", "экране"]} />
        <div style={{ height: 26 }} />
        <Fade at={d.head + 0.6} out={24.2}>
          <div style={{ fontSize: 26, color: C.muted, lineHeight: 1.35, fontWeight: 500 }}>Сроки, отклонения и прогноз по каждому дому и округу</div>
        </Fade>
      </div>
      <Stage3D pose={ent < 1 ? p0 : pose}>
        <AppWindow nav="dashboard" tabs={[{ id: "d", label: "Дашборд", icon: "dashboard", active: true }]}>
          <Dashboard cards={d.cards} map={d.mapPush - 0.2} clusters={d.clusters} clickCluster={d.clickCluster} highlightRow={d.clickYears} />
        </AppWindow>
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor keys={CURSOR_A} clicks={[d.clickYears, d.clickCluster]} scale={1 / (ent < 1 ? p0.s : pose.s)} show={[21.6, 31]} />
        </div>
      </Stage3D>
    </AbsoluteFill>
  );
};
