import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import "../../fonts";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, easeOut, ramp } from "../geom";
import { project } from "../MoscowMap";
import { AsIs } from "./AsIs";
import { LiveInsert, PinMorph, Track } from "./Insert";
import { Caption, Super, ToPin } from "./Kit";
import { Lockup } from "./Logo13";
import { camAt, Comet, MapStage, Objects, Pin } from "./MapStage";
import { PLACES, ROUTES } from "./places";
import { DURATION, f, T } from "./T";
import { Scenes2 } from "./Scenes2";
import P4 from "../data/tracks/P4_office.json";

export { DURATION };
const FR = (k: keyof typeof T) => [f(T[k][0]), f(T[k][1])] as const;
const pinXY = (id: keyof typeof PLACES, sec: number): [number, number] => {
  const c = camAt(sec);
  return project(c, PLACES[id].lng, PLACES[id].lat);
};

/** Is the map visible at this film frame? (it is skipped under full-frame shots) */
const MAP_SPANS: [number, number][] = [[11.4, 84.8]]; // later map moments live in Scenes2

const Plate: React.FC<{ src: string; rate?: number }> = ({ src, rate = 1 }) => (
  <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{ position: "absolute", width: 1920, height: 1080 }} />
);

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 30% 35%, rgba(0,0,0,0) 55%, rgba(0,4,24,0.42) 100%)" }} />
);

/** Logistics today: trucks circle the city along real roads, again and again. */
const TRIPS = Object.keys(ROUTES).filter((k) => k.includes(">"));
const Logistics: React.FC<{ sec: number; cam: any }> = ({ sec, cam }) => {
  const [a, b] = T.logistics;
  const o = clamp01((sec - a) / 1) * (1 - clamp01((sec - (b + 2)) / 1.2));
  if (o <= 0) return null;
  const items: React.ReactNode[] = [];
  TRIPS.forEach((key, i) => {
    const line = ROUTES[key];
    const back = [...line].reverse();
    // three runs per trip (×3), each there and back, staggered per route
    for (let run = 0; run < 3; run++) {
      const t0 = a + 0.4 + (i % 6) * 0.35 + run * 3.6;
      const u = (sec - t0) / 1.7;
      items.push(<Comet key={`${key}${run}`} cam={cam} line={u < 1 ? line : back} u={u < 1 ? u : u - 1.1} tail={170} width={5} o={o} />);
    }
  });
  // trucks lapping the rings
  for (let i = 0; i < 4; i++) {
    const u = ((sec - a - i * 2.1) / 5.5) % 1;
    if (sec - a - i * 2.1 > 0) items.push(<Comet key={`mkad${i}`} cam={cam} line={ROUTES.mkad} u={u} tail={230} width={5} o={o} />);
    const v = ((sec - a - 1 - i * 1.7) / 3.6) % 1;
    if (sec - a - 1 - i * 1.7 > 0) items.push(<Comet key={`ttk${i}`} cam={cam} line={ROUTES.ttk} u={v} tail={170} width={4.5} o={o} />);
  }
  return <g>{items}</g>;
};

/** Three spreadsheets, three dates for one delivery: each grows out of the house
    pin to its place beside it, and they fold back into the pin before the call. */
const TABLES: [string, string][] = [
  ["Таблица УРО", "18.10"],
  ["Таблица подрядчика", "20.10"],
  ["Таблица поставщика", "22.10"],
];
const ThreeTables: React.FC<{ sec: number }> = ({ sec }) => {
  if (sec < 26.2 || sec > 34.2) return null;
  const [x, y] = pinXY("house", sec);
  return (
    <>
      {TABLES.map(([n, d], i) => {
        const k = ramp(sec, 26.2 + i * 0.35, 26.9 + i * 0.35) * (1 - ramp(sec, 33.3 + (2 - i) * 0.12, 33.9 + (2 - i) * 0.12));
        if (k <= 0) return null;
        return (
          <PinMorph key={i} k={k} pin={[x, y]} to={{ x: x + 40, y: y - 150 + i * 70, w: 360, h: 56, r: 10, sh: 0.25 }} w={360} h={56}>
            <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", fontFamily: FONT }}>
              <span style={{ fontSize: 21, fontWeight: 600, color: C.muted }}>{n}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: i === 1 ? C.ink : C.red }}>{d}</span>
            </div>
          </PinMorph>
        );
      })}
    </>
  );
};

/** The turn: «Единая система» grows out of the Fund's pin, then folds back into it
    as the camera dives into the Fund. */
const CARD = { x: 510, y: 380, w: 900, h: 320, r: 28, sh: 0.16 };
const TurnCard: React.FC<{ sec: number }> = ({ sec }) => {
  const k = ramp(sec, 78.9, 79.8) * (1 - ramp(sec, 82.4, 83.3));
  if (k <= 0 || sec < 78.9) return null;
  return (
    <PinMorph k={k} pin={pinXY("fund", sec)} to={CARD} w={CARD.w} h={CARD.h}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Lockup size={120} draw={clamp01((sec - 79.4) / 1.1)} lit={clamp01((sec - 80.1) / 1.0)} word={clamp01((sec - 80.3) / 0.7)} />
        <div style={{ marginTop: 26, fontSize: 40, fontWeight: 750, letterSpacing: -0.8, color: C.ink, opacity: clamp01((sec - 80.8) / 0.6) }}>Единая система капитального ремонта</div>
      </div>
    </PinMorph>
  );
};

export const Film13: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / 60;
  const mapOn = MAP_SPANS.some(([a, b]) => sec >= a && sec <= b);

  return (
    <AbsoluteFill style={{ background: sec > 76 && sec < 256 ? "#F3F3F3" : "#090C26", fontFamily: FONT }}>
      {mapOn && (
        <MapStage dim={sec > 40 && sec < 73 ? 0.45 * clamp01((sec - 40) / 0.8) * (1 - clamp01((sec - 72) / 1)) : 0}>
          {(cam, day, s) => (
            <>
              <Objects cam={cam} grow={clamp01((s - 14.2) / 4.2)} day={day} o={1 - 0.72 * clamp01((s - 21.6) / 1.2) - 0.28 * clamp01((s - 38) / 2)} />
              <Logistics sec={s} cam={cam} />
              <Pin cam={cam} id="house" show={clamp01((s - 11.6) / 0.8)} day={day} label={s > 13.5 && s < 23} active={s > 26 && s < 34 ? 0.6 + 0.4 * Math.sin(s * 4) : 0} />
              {(["fund", "tu", "uro", "econ", "store"] as const).map((id, i) => (
                <Pin key={id} cam={cam} id={id} show={clamp01((s - 78.4 - i * 0.25) / 0.6)} day={day} label={s < 82.2} />
              ))}
            </>
          )}
        </MapStage>
      )}

      {/* ОТКРЫТИЕ */}
      {/* plates are pre-slowed to 0.9 with motion interpolation (no repeated frames) */}
      {/* dawn → roof: one forward move — the wide shot accelerates in, the roof shot
          carries the same push through the dissolve and settles */}
      <Sequence from={f(T.p1[0])} durationInFrames={f(T.p1[1] - T.p1[0])}>
        <AbsoluteFill style={{ transform: `scale(${1 + 0.12 * Math.pow(ramp(sec, 5.2, 6.6), 2)})`, opacity: easeInOut(ramp(sec, 0, 0.7)) }}>
          <Plate src="v13/live/P1_dawn_s90.mp4" />
        </AbsoluteFill>
        <Vignette />
      </Sequence>
      <Sequence from={f(T.p2[0])} durationInFrames={f(T.p2[1] - T.p2[0])} style={{ opacity: easeInOut(clamp01((sec - T.p2[0]) / 0.4)) }}>
        <ToPin a={f(11.4)} b={f(12.8)} pin={(t) => pinXY("house", t)} start={f(T.p2[0])}>
          <AbsoluteFill style={{ transform: `scale(${1 + 0.045 * easeOut(ramp(sec, 6.2, 8.4))})` }}>
            <Plate src="v13/live/P2_roof_s90.mp4" />
          </AbsoluteFill>
          <Vignette />
        </ToPin>
      </Sequence>
      <Super a={f(1.0)} b={f(6.2)} cap="Капитальный ремонт в Москве" />
      <Super a={f(7.0)} b={f(11.2)} n="12 000" cap="инженерных систем в работе" />
      <Super a={f(15.0)} b={f(19.8)} n="1 800" cap="объектов капитального ремонта" />
      <Super a={f(20.0)} b={f(22.6)} cap="Как это работает сейчас" />
      <Super a={f(23.6)} b={f(28.8)} cap="Поставки — в разных таблицах" />
      <Super a={f(29.0)} b={f(34.0)} n="×3" cap="поставки на каждый объект: лишние рейсы" />

      {/* phone call from the house */}
      <Sequence from={f(T.phone[0])} durationInFrames={f(T.phone[1] - T.phone[0])}>
        <LiveInsert src="v13/live/L3_phone_s78.mp4" start={f(T.phone[0])} pin={(t) => pinXY("house", t)} open={[f(34), f(35.1)]} close={[f(39.3), f(40.4)]} />
        <Caption a={f(1.0)} b={f(5.2)}>Факт поставки — обзвоном подрядчиков</Caption>
      </Sequence>

      {/* as-is windows over the dimmed map */}
      <ThreeTables sec={sec} />
      {sec >= 40.4 && sec < 73.2 && <AsIs />}

      {/* ПОВОРОТ */}
      <TurnCard sec={sec} />

      {/* АКТ II — Фонд: the pin opens into the office, the camera goes into the monitor */}
      <Sequence from={f(T.fundInsert[0])} durationInFrames={f(T.fundInsert[1] - T.fundInsert[0])}>
        <LiveInsert
          src="v13/live/P4_office.mp4"
          start={f(T.fundInsert[0])}
          pin={(t) => pinXY("fund", t)}
          open={[f(83.6), f(84.6)]}
          track={P4 as Track}
          push={[f(86.4), f(88.6)]}
          ui={{ w: 1600, h: 900, node: <Scenes2.DashboardStill /> }}
        />
      </Sequence>

      <Scenes2.All />
    </AbsoluteFill>
  );
};
