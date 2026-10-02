import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, TL, tw, useSec } from "../lib";
import { AppWindow, HOME, Stage3D, focus, poseAt, type Pose } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { ObjectCard, objTabX, OBJ_TABS_Y } from "../screens/Objects";
import { Eyebrow, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { CX, CY, objectsTabs } from "./S5Objects";
import { IHouse, ITable, ILayers, ITrend, IFile, ISign, IBox, ICalendar } from "../components/Icons";

const SHEETS = [
  { t: "Паспорт", sub: "144 квартиры · 9 этажей · 1967", icon: IHouse },
  { t: "Виды работ", sub: "Фасад · Кровля · Отопление", icon: ILayers },
  { t: "Смета", sub: "ЛСР · позиции и цены", icon: ITable },
  { t: "ТЭП и объёмы", sub: "ПСД · МГЭ · ТЭП", icon: IBox },
  { t: "Ход работ", sub: "Готовность 64%", icon: ITrend },
  { t: "График", sub: "Ганта · план и факт", icon: ICalendar },
  { t: "Документы", sub: "ПСД · ТЗК · акты", icon: IFile },
  { t: "КС-2 и договор", sub: "ПКРД-002047-25", icon: ISign },
];

const Sheet: React.FC<{ i: number; t: string; sub: string; Icon: React.FC<{ size?: number; color?: string }>; hero?: boolean }> = ({ i, t, sub, Icon, hero }) => (
  <div
    style={{
      width: 400,
      height: 250,
      borderRadius: 24,
      background: hero ? C.blue : "#fff",
      color: hero ? "#fff" : C.ink,
      boxShadow: "0 40px 60px -30px rgba(0,2,48,0.45), 0 0 0 1px rgba(0,2,48,0.04)",
      padding: 26,
      boxSizing: "border-box",
      fontFamily: FONT,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 50, height: 50, borderRadius: 99, background: hero ? "rgba(255,255,255,0.16)" : C.blue50, display: "grid", placeItems: "center" }}>
        <Icon size={24} color={hero ? "#fff" : C.blue} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 17, fontWeight: 700, opacity: 0.45 }}>{String(i + 1).padStart(2, "0")}</div>
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ fontSize: 31, fontWeight: 800, letterSpacing: "-0.02em" }}>{t}</div>
    <div style={{ fontSize: 18, marginTop: 6, opacity: hero ? 0.8 : 1, color: hero ? "#fff" : C.muted }}>{sub}</div>
  </div>
);

export const S6Object: React.FC = () => {
  const s = useSec();
  const ob = TL.object;
  const gx = CX + objTabX(6);
  const gy = CY + OBJ_TABS_Y;
  const keys: [number, Pose][] = [
    [38.0, { ...HOME }],
    [39.0, { ...HOME, s: 0.69, x: 1226 }],
    [39.9, focus(980, 560, 1.0)],
    [41.8, focus(1000, 580, 1.06)],
    [42.6, { x: 960, y: 560, s: 0.62, rx: 0, ry: 0 }],
  ];
  const pose = poseAt(s, keys, INOUT);
  const fan = tw(s, [ob.fan, ob.fan + 1.3], [0, 1], EXPO);
  const winOut = tw(s, [ob.fan + 0.05, ob.fan + 0.45], [0, 1]);
  const whip = tw(s, [45.75, 46.3], [0, 1], IN);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage />
      <div style={{ position: "absolute", left: 96, top: 340, width: 560 }}>
        <Eyebrow n="03" label="Работы и сроки" at={38.2} out={39.75} />
        <div style={{ height: 26 }} />
        <Rise text={"План-график\nпрямо в карточке"} at={38.3} out={39.7} size={66} weight={780} highlight={["План-график"]} />
      </div>
      {winOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - winOut }}>
          <Stage3D pose={pose}>
            <AppWindow nav="objects" tabs={objectsTabs(s)}>
              <ObjectCard at={0} ganttAt={ob.clickGantt + 0.05} bars={ob.bars} pressTab={ob.clickGantt} />
            </AppWindow>
            <div style={{ position: "absolute", inset: 0 }}>
              <Cursor
                keys={[
                  [37.4, 820, 470],
                  [39.45, gx, gy],
                  [40.6, gx + 40, gy + 300],
                  [42.0, gx + 60, gy + 330],
                ]}
                clicks={[ob.clickGantt]}
                scale={1 / pose.s}
                show={[37, 42.2]}
              />
            </div>
          </Stage3D>
        </div>
      )}

      {/* the card opens into all of its sections */}
      {s >= ob.fan && (
        <AbsoluteFill style={{ translate: `${-whip * 2400}px 0`, filter: whip > 0 ? `blur(${whip * 30}px)` : undefined }}>
          <AbsoluteFill style={{ perspective: 2400 }}>
            <div style={{ position: "absolute", left: 960, top: 620, transformStyle: "preserve-3d", transform: `rotateX(${30 * fan}deg) rotateZ(${-9 * fan}deg) scale(${0.9 + 0.1 * fan})` }}>
              {SHEETS.map((sh, i) => {
                const k = tw(s, [ob.fanCards[i], ob.fanCards[i] + 0.8], [0, 1], EXPO);
                const col = i % 4;
                const row = Math.floor(i / 4);
                const x = (col - 1.5) * 432;
                const y = (row - 0.5) * 282;
                const lift = Math.sin(s * 1.6 + i * 0.9) * 8;
                return (
                  <div
                    key={sh.t}
                    style={{
                      position: "absolute",
                      left: -200,
                      top: -125,
                      transform: `translate3d(${x}px, ${y + (1 - k) * 120}px, ${(1 - k) * -400 + lift + k * 20}px)`,
                      opacity: Math.min(1, k * 1.6),
                    }}
                  >
                    <Sheet i={i} t={sh.t} sub={sh.sub} Icon={sh.icon} hero={i === 5} />
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 128, display: "flex", justifyContent: "center", opacity: 1 - whip }}>
            <Rise text="Все разделы объекта — в одной вкладке" at={ob.fan + 0.5} size={58} weight={780} highlight={["одной", "вкладке"]} center />
          </div>
        </AbsoluteFill>
      )}
      {/* motion streak on the whip */}
      {whip > 0 && <AbsoluteFill style={{ background: `linear-gradient(90deg, transparent, rgba(49,107,253,${0.12 * whip}), transparent)` }} />}
    </AbsoluteFill>
  );
};
