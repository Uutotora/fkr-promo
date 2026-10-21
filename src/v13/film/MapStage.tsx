import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, ramp } from "../geom";
import { Cam, MoscowMap, project } from "../MoscowMap";
import { FPS } from "./T";
import { LngLat, OBJECTS, PLACES, ROUTES } from "./places";

/** The film's connective tissue: one Moscow map whose camera, palette and
    overlays are functions of film time. Night = «как сейчас», day = the system. */

type Key = { t: number; lng: number; lat: number; zoom: number; day: number };
const K = (t: number, lng: number, lat: number, zoom: number, day = 0): Key => ({ t, lng, lat, zoom, day });
const H = PLACES.house;
const F = PLACES.fund;
const S = PLACES.store;
const TU = PLACES.tu;

export const CAM_KEYS: Key[] = [
  K(11.4, H.lng, H.lat, 16.4),
  K(13.2, H.lng, H.lat, 14.2),
  K(19.6, 37.615, 55.747, 9.75),
  K(22.2, 37.62, 55.74, 9.95),
  K(33.0, 37.62, 55.735, 10.3),
  K(34.4, H.lng, H.lat, 12.6),
  K(40.4, H.lng + 0.01, H.lat + 0.006, 11.6),
  K(72.0, H.lng + 0.03, H.lat + 0.02, 11.1),
  K(75.0, 37.63, 55.735, 10.45),
  K(78.6, 37.63, 55.735, 10.45, 1),
  K(81.4, 37.63, 55.735, 10.55, 1),
  K(83.6, F.lng, F.lat, 14.6, 1),
  // contractor
  K(118.6, F.lng, F.lat, 12.2, 1),
  K(121.6, (F.lng + H.lng) / 2, (F.lat + H.lat) / 2, 11.9, 1),
  K(123.0, H.lng, H.lat, 14.8, 1),
  // approvals
  K(142.0, H.lng, H.lat, 13.0, 1),
  K(143.2, TU.lng, TU.lat, 13.2, 1),
  K(144.0, TU.lng, TU.lat, 14.8, 1),
  // supplier
  K(156.0, TU.lng, TU.lat, 12.0, 1),
  K(157.6, (TU.lng + S.lng) / 2, (TU.lat + S.lat) / 2, 11.0, 1),
  K(158.0, S.lng, S.lat, 13.8, 1),
  // the one trip
  K(172.0, (S.lng + H.lng) / 2, (S.lat + H.lat) / 2, 11.35, 1),
  K(175.4, (S.lng + H.lng) / 2, (S.lat + H.lat) / 2, 11.45, 1),
  K(176.0, H.lng, H.lat, 14.6, 1),
  // resident
  K(215.0, H.lng, H.lat, 13.0, 1),
  K(216.0, H.lng, H.lat, 15.2, 1),
  // effect
  K(230.0, 37.62, 55.745, 9.9, 1),
  K(256.0, 37.62, 55.745, 10.15, 1),
  // final: dusk
  K(259.0, 37.62, 55.745, 10.4, 0),
];

// Mercator-space interpolation keeps the pan straight on screen.
const toM = (lng: number, lat: number): [number, number] => {
  const s = Math.sin((lat * Math.PI) / 180);
  return [(lng + 180) / 360, 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)];
};
const fromM = (x: number, y: number): [number, number] => [x * 360 - 180, (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI];

export const camAt = (sec: number): Cam & { day: number } => {
  const k = CAM_KEYS;
  if (sec <= k[0].t) return { ...k[0] };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (sec <= b.t) {
      const u = easeInOut((sec - a.t) / (b.t - a.t));
      // Zoom moves in log space already; fly with the centre weighted toward the
      // zoomed-out end so the target stays in view (van Wijk-lite).
      const [ax, ay] = toM(a.lng, a.lat);
      const [bx, by] = toM(b.lng, b.lat);
      const [lng, lat] = fromM(ax + (bx - ax) * u, ay + (by - ay) * u);
      return { lng, lat, zoom: a.zoom + (b.zoom - a.zoom) * u, day: a.day + (b.day - a.day) * u };
    }
  }
  return { ...k[k.length - 1] };
};

/* ---------- overlays ---------- */

const pathLen = (pts: [number, number][]) => {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return acc;
};
const at = (pts: [number, number][], acc: number[], d: number): [number, number] => {
  if (d <= 0) return pts[0];
  const L = acc[acc.length - 1];
  if (d >= L) return pts[pts.length - 1];
  let i = 1;
  while (acc[i] < d) i++;
  const u = (d - acc[i - 1]) / (acc[i] - acc[i - 1]);
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u];
};

/** A light travelling along a road polyline: bright head, fading tail. */
export const Comet: React.FC<{ cam: Cam; line: LngLat[]; u: number; color?: string; tail?: number; width?: number; o?: number }> = ({
  cam,
  line,
  u,
  color = C.orange,
  tail = 120,
  width = 4,
  o = 1,
}) => {
  const pts = line.map(([lng, lat]) => project(cam, lng, lat));
  const acc = pathLen(pts);
  const L = acc[acc.length - 1];
  const head = clamp01(u) * L;
  const seg: string[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = at(pts, acc, head - (tail * (i + 1)) / n);
    const b = at(pts, acc, head - (tail * i) / n);
    seg.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${width * (1 - i / n)}" stroke-linecap="round" opacity="${(1 - i / n) * 0.9}"/>`);
  }
  const [hx, hy] = at(pts, acc, head);
  if (u <= 0 || u >= 1.02) return null;
  return (
    <g opacity={o}>
      <g dangerouslySetInnerHTML={{ __html: seg.join("") }} />
      <circle cx={hx} cy={hy} r={width * 2.6} fill={color} opacity={0.35} filter="url(#glow)" />
      <circle cx={hx} cy={hy} r={width * 0.95} fill="#fff" />
    </g>
  );
};

/** A route drawn as a calm solid line (the one planned trip). */
export const RouteLine: React.FC<{ cam: Cam; line: LngLat[]; draw: number; color?: string; width?: number; o?: number }> = ({
  cam,
  line,
  draw,
  color = C.orange,
  width = 4,
  o = 1,
}) => {
  const pts = line.map(([lng, lat]) => project(cam, lng, lat));
  const n = Math.max(2, Math.round(pts.length * clamp01(draw)));
  const d = pts
    .slice(0, n)
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join("");
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
};

/** Participant pin: the logo's window square, with a quiet label. */
export const Pin: React.FC<{ cam: Cam; id: keyof typeof PLACES; show: number; day: number; active?: number; label?: boolean }> = ({
  cam,
  id,
  show,
  day,
  active = 0,
  label = true,
}) => {
  const p = PLACES[id];
  const [x, y] = project(cam, p.lng, p.lat);
  if (show <= 0) return null;
  const s = 0.6 + 0.4 * easeInOut(show);
  const ink = day > 0.5 ? C.ink : "#fff";
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={clamp01(show * 1.4)}>
      {active > 0 && <circle r={26 + 22 * active} fill={C.orange} opacity={0.18 * (1 - active * 0.6)} filter="url(#glow)" />}
      <rect x={-13} y={-13} width={26} height={26} rx={6} fill="#fff" style={{ filter: "drop-shadow(0 4px 10px rgba(0,2,48,0.25))" }} />
      <rect x={-6} y={-6} width={12} height={12} rx={2.5} fill={C.orange} />
      {label && (
        <text x={22} y={7} fontFamily={FONT} fontWeight={700} fontSize={22} fill={ink} style={{ letterSpacing: -0.3 }}>
          {p.label}
        </text>
      )}
    </g>
  );
};

/** 1 800 programme objects lighting up across the city. */
export const Objects: React.FC<{ cam: Cam; grow: number; day: number; o?: number }> = ({ cam, grow, day, o = 1 }) => (
  <g opacity={o}>
    {OBJECTS.map((p, i) => {
      const k = clamp01((grow - p.t * 0.85) / 0.15);
      if (k <= 0) return null;
      const [x, y] = project(cam, p.lng, p.lat);
      if (x < -20 || x > 1940 || y < -20 || y > 1100) return null;
      return <circle key={i} cx={x} cy={y} r={2.6 * (0.6 + 0.4 * k)} fill={day > 0.5 ? C.blue : C.orange} opacity={0.85 * k} />;
    })}
  </g>
);

export const Defs: React.FC = () => (
  <defs>
    <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
);

/** Map plus a full-frame SVG overlay in the same camera. */
export const MapStage: React.FC<{ children?: (cam: Cam, day: number, sec: number) => React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const cam = camAt(sec);
  return (
    <AbsoluteFill>
      <MoscowMap cam={cam} day={cam.day} labels={0.85} />
      {dim > 0 && <AbsoluteFill style={{ background: cam.day > 0.5 ? "#F3F3F3" : "#090C26", opacity: dim }} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        {children?.(cam, cam.day, sec)}
      </svg>
    </AbsoluteFill>
  );
};

export { ramp, ROUTES };
