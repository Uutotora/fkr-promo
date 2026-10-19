import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, INOUT, TL, tw, useSec } from "../lib";
import { AppWindow, Flashlight, HOME, SIDEBAR, Stage3D, TABBAR, focus, poseAt, type Pose, type Tab } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { Dashboard } from "../screens/Dashboard";
import { ObjectsList, ObjectCard } from "../screens/Objects";
import { Eyebrow, Fade, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { CURSOR_A, NAV_Y } from "../scenes/S4Dashboard";

import { Caption, CX, CY, ROW1, SEARCH, objectsTabs } from "../scenes/S5Objects";

/** Passport block and the «Общая площадь» field in window coordinates (measured on stills). */
const PASS = { x: 1000, y: 470 };
const AREA = { x: 1400, y: 548 };
const CURSOR_B: [number, number, number][] = [
  ...CURSOR_A.slice(-2),
  [31.6, 620, 560],
  [32.5, SEARCH.x, SEARCH.y],
  [34.4, SEARCH.x + 10, SEARCH.y + 6],
  [35.25, ROW1.x, ROW1.y],
  [36.4, 820, 470],
];

/** v12 · 02 Объекты: the registry, the card — and where every value comes from, who changed it.
 *  Local clock = v9 (30 → 38) + the provenance beat (37.1 → 43.3). */
export const OBJ12_END = 43.3;
export const PROV12 = { cap: 37.35, prov: 38.0, hover: 39.35, hist: 39.7, back: 42.45 };
export const Objects12: React.FC = () => {
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
    [38.1, focus(PASS.x, PASS.y, 1.2)],
    [42.3, focus(PASS.x + 30, PASS.y + 6, 1.25)],
    [43.3, { ...HOME }],
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
          {s >= o.open && <ObjectCard at={o.open} provAt={PROV12.prov} hover={[PROV12.hover, PROV12.back]} histAt={PROV12.hist} />}
        </AppWindow>
        {(() => {
          // the light follows the search: the field, then the house it found
          const m = tw(s, [34.5, 35.15], [0, 1], INOUT);
          return <Flashlight x={SEARCH.x + (ROW1.x + 300 - SEARCH.x) * m} y={SEARCH.y + 40 + (ROW1.y - SEARCH.y - 40) * m} rx={520 + 260 * m} ry={170 + 30 * m} k={tw(s, [32.55, 33.1], [0, 1], INOUT) * (1 - tw(s, [35.45, 35.95], [0, 1], INOUT))} />;
        })()}
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor keys={[...CURSOR_B, [37.6, 900, 520], [PROV12.hover, AREA.x, AREA.y], [PROV12.back, AREA.x + 8, AREA.y + 4], [43.2, AREA.x + 120, AREA.y + 160]]} clicks={[o.clickNav, o.clickSearch, o.clickRow]} scale={1 / pose.s} show={[29, 42.9]} />
        </div>
      </Stage3D>
      <Caption at={32.9} out={35.2}>Поиск по адресу, УНОМ, подрядчику или договору</Caption>
      <Caption at={36.0} out={PROV12.cap}>
        Каждый дом — <span style={{ color: C.blue }}>одна карточка</span>
      </Caption>
      <Caption at={PROV12.cap + 0.45} out={PROV12.back}>
        Видно, <span style={{ color: C.blue }}>откуда данные</span> и кто их изменил
      </Caption>
    </AbsoluteFill>
  );
};


