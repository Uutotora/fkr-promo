import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import "../../fonts";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, easeOut, ramp } from "../geom";
import { project } from "../MoscowMap";
import { AsIs, collapse } from "./AsIs";
import { LiveInsert, Track } from "./Insert";
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

/** Three spreadsheets, three dates for one delivery, next to the house pin. */
const ThreeTables: React.FC<{ sec: number; cam: any }> = ({ sec, cam }) => {
  const [x, y] = project(cam, PLACES.house.lng, PLACES.house.lat);
  const rows: [string, string][] = [
    ["Таблица УРО", "18.10"],
    ["Таблица подрядчика", "20.10"],
    ["Таблица поставщика", "22.10"],
  ];
  return (
    <g>
      {rows.map(([n, d], i) => {
        const k = easeOut(clamp01((sec - 26.2 - i * 0.35) / 0.6)) * (1 - clamp01((sec - 33.4) / 0.6));
        if (k <= 0) return null;
        const bx = x + 40;
        const by = y - 150 + i * 70;
        return (
          <g key={i} opacity={k} transform={`translate(${(1 - k) * 20},0)`}>
            <rect x={bx} y={by} width={360} height={56} rx={10} fill="#fff" />
            <text x={bx + 18} y={by + 36} fontFamily={FONT} fontSize={21} fontWeight={600} fill={C.muted}>
              {n}
            </text>
            <text x={bx + 342} y={by + 37} textAnchor="end" fontFamily={FONT} fontSize={24} fontWeight={800} fill={i === 1 ? C.ink : C.red}>
              {d}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Film13: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / 60;
  const mapOn = MAP_SPANS.some(([a, b]) => sec >= a && sec <= b);
  const houseNow = pinXY("house", sec);

  return (
    <AbsoluteFill style={{ background: sec > 76 && sec < 256 ? "#F3F3F3" : "#090C26", fontFamily: FONT }}>
      {mapOn && (
        <MapStage dim={sec > 40 && sec < 73 ? 0.45 * clamp01((sec - 40) / 0.8) * (1 - clamp01((sec - 72) / 1)) : 0}>
          {(cam, day, s) => (
            <>
              <Objects cam={cam} grow={clamp01((s - 14.2) / 4.2)} day={day} o={1 - 0.72 * clamp01((s - 21.6) / 1.2) - 0.28 * clamp01((s - 38) / 2)} />
              <Logistics sec={s} cam={cam} />
              <ThreeTables sec={s} cam={cam} />
              <Pin cam={cam} id="house" show={clamp01((s - 11.6) / 0.8)} day={day} label={s > 13.5 && s < 23} active={s > 26 && s < 34 ? 0.6 + 0.4 * Math.sin(s * 4) : 0} />
              {(["fund", "tu", "uro", "econ", "store"] as const).map((id, i) => (
                <Pin key={id} cam={cam} id={id} show={clamp01((s - 78.4 - i * 0.25) / 0.6)} day={day} label={s < 82.2} />
              ))}
            </>
          )}
        </MapStage>
      )}

      {/* ОТКРЫТИЕ */}
      <Sequence from={f(T.p1[0])} durationInFrames={f(T.p1[1] - T.p1[0])}>
        <Plate src="v13/live/P1_dawn.mp4" rate={0.9} />
        <Vignette />
      </Sequence>
      <Sequence from={f(T.p2[0])} durationInFrames={f(T.p2[1] - T.p2[0])}>
        <ToPin a={f(11.4)} b={f(12.8)} pin={pinXY("house", 12.8)} start={f(T.p2[0])}>
          <Plate src="v13/live/P2_roof.mp4" rate={0.9} />
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
        <LiveInsert src="v13/live/L3_phone.mp4" start={f(T.phone[0])} pin={houseNow} open={[f(34), f(35.1)]} close={[f(39.3), f(40.4)]} closePin={pinXY("house", 40.4)} />
        <Caption a={f(1.0)} b={f(5.2)}>Факт поставки — обзвоном подрядчиков</Caption>
      </Sequence>

      {/* as-is windows over the dimmed map */}
      {sec >= T.twice[0] && sec < T.turn[0] + 1.5 && (
        <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `scale(${1 - collapse(frame)})`, opacity: 1 - collapse(frame) }}>
          <AsIs />
        </AbsoluteFill>
      )}

      {/* ПОВОРОТ */}
      {sec >= 78.2 && sec < 84 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - clamp01((sec - 82.4) / 0.8) }}>
          <div style={{ background: "#fff", borderRadius: 28, padding: "40px 56px 44px", boxShadow: "0 30px 80px rgba(0,2,48,0.16)", textAlign: "center", opacity: easeOut(clamp01((sec - 78.2) / 0.6)) }}>
            <Lockup size={120} draw={clamp01((sec - 78.3) / 1.1)} lit={clamp01((sec - 79.0) / 1.0)} word={clamp01((sec - 79.2) / 0.7)} />
            <div style={{ marginTop: 26, fontSize: 40, fontWeight: 750, letterSpacing: -0.8, color: C.ink, opacity: clamp01((sec - 79.8) / 0.6) }}>Единая система капитального ремонта</div>
          </div>
        </AbsoluteFill>
      )}

      {/* АКТ II — Фонд: the pin opens into the office, the camera goes into the monitor */}
      <Sequence from={f(T.fundInsert[0])} durationInFrames={f(T.fundInsert[1] - T.fundInsert[0])}>
        <LiveInsert
          src="v13/live/P4_office.mp4"
          start={f(T.fundInsert[0])}
          pin={pinXY("fund", 83.6)}
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
