import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, ramp, smoothPath } from "../geom";
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

const EC = PLACES.econ;
const mid = (a: { lng: number; lat: number }, b: { lng: number; lat: number }) => [(a.lng + b.lng) / 2, (a.lat + b.lat) / 2] as const;
const [FHx, FHy] = mid(F, H);
const [HTx, HTy] = mid(H, TU);
const [ESx, ESy] = mid(EC, S);
const [SHx, SHy] = mid(S, H);

/* Each flight is one continuous move: the camera folds out of a screen already
   moving, crosses the map, and is still easing in on a pin while that pin opens
   (the key ~1 s after arrival is that follow-through). Keys under full-frame
   scenes only set where the next flight starts. */
export const CAM_KEYS: Key[] = [
  K(11.4, H.lng, H.lat, 16.4),
  K(13.2, H.lng, H.lat, 14.2),
  K(19.6, 37.615, 55.747, 9.75),
  K(22.2, 37.62, 55.74, 9.95),
  K(33.0, 37.62, 55.735, 10.3),
  K(35.0, H.lng, H.lat, 12.85), // still easing in while the call opens out of the pin
  K(40.4, H.lng + 0.01, H.lat + 0.006, 11.6),
  K(72.0, H.lng + 0.03, H.lat + 0.02, 11.1),
  K(75.0, 37.63, 55.735, 10.45),
  K(78.6, 37.63, 55.735, 10.45, 1),
  K(81.4, 37.63, 55.735, 10.55, 1),
  K(83.6, F.lng, F.lat, 14.6, 1),
  K(84.6, F.lng, F.lat, 14.85, 1),
  // Fund → contractor
  K(118.6, F.lng, F.lat, 12.2, 1),
  K(120.4, FHx, FHy, 11.8, 1),
  K(123.2, H.lng, H.lat, 14.7, 1),
  K(124.2, H.lng, H.lat, 15.0, 1),
  // contractor → ТУ ГАУ
  K(141.0, H.lng, H.lat, 13.4, 1),
  K(142.6, HTx, HTy, 13.0, 1),
  K(144.0, TU.lng, TU.lat, 14.6, 1),
  K(145.0, TU.lng, TU.lat, 14.9, 1),
  // economist → supplier
  K(155.2, TU.lng, TU.lat, 12.4, 1),
  K(156.8, ESx, ESy, 11.1, 1),
  K(158.2, S.lng, S.lat, 13.7, 1),
  K(159.2, S.lng, S.lat, 14.0, 1),
  // the one trip
  K(171.2, S.lng, S.lat, 13.2, 1),
  K(172.6, SHx, SHy, 11.35, 1),
  K(175.0, SHx, SHy, 11.5, 1),
  K(176.2, H.lng, H.lat, 14.4, 1),
  K(177.2, H.lng, H.lat, 14.7, 1),
  // resident → her appeal travels to the Fund → the whole city
  K(215.0, H.lng, H.lat, 13.2, 1),
  K(216.9, H.lng, H.lat, 15.0, 1),
  K(217.9, H.lng, H.lat, 15.2, 1),
  K(219.4, H.lng, H.lat, 15.2, 1),
  K(221.2, FHx, FHy, 12.0, 1),
  K(222.4, FHx, FHy, 12.15, 1),
  K(226.9, FHx, FHy, 12.15, 1),
  // effect
  K(230.0, 37.62, 55.745, 9.9, 1),
  K(256.0, 37.62, 55.745, 10.15, 1),
  // final: dusk, still drifting in while the house pin opens
  K(259.0, 37.62, 55.745, 10.4, 0),
  K(259.9, 37.62, 55.745, 10.5, 0),
];

// Mercator-space interpolation keeps the pan straight on screen.
const toM = (lng: number, lat: number): [number, number] => {
  const s = Math.sin((lat * Math.PI) / 180);
  return [(lng + 180) / 360, 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)];
};
const fromM = (x: number, y: number): [number, number] => [x * 360 - 180, (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI];

// One continuous flight through all keys: centre in Mercator, zoom (already a log
// scale) and palette are separate channels of a C1 path, so a pull-back that
// continues past a key keeps its speed instead of stopping there.
const KT = CAM_KEYS.map((k) => k.t);
const KV = CAM_KEYS.map((k) => [...toM(k.lng, k.lat), k.zoom, k.day]);
export const camAt = (sec: number): Cam & { day: number } => {
  const [x, y, zoom, day] = smoothPath(KT, KV, sec);
  const [lng, lat] = fromM(x, y);
  return { lng, lat, zoom, day };
};

/* ---------- overlays ---------- */

/** Night ↔ day colours blend with the palette instead of flipping at day = 0.5. */
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixHex = (night: string, day: string, t: number) => {
  const a = hex(night);
  const b = hex(day);
  const u = clamp01(t);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(",")})`;
};

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
  // grows out of its own centre with a small settle (back-out), not a fade
  const u = clamp01(show);
  const s = u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2);
  const ink = mixHex("#FFFFFF", C.ink, day);
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
      return <circle key={i} cx={x} cy={y} r={2.6 * (0.6 + 0.4 * k)} fill={mixHex(C.orange, C.blue, day)} opacity={0.85 * k} />;
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
      {dim > 0 && <AbsoluteFill style={{ background: mixHex("#090C26", "#F3F3F3", cam.day), opacity: dim }} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        {children?.(cam, cam.day, sec)}
      </svg>
    </AbsoluteFill>
  );
};

export { ramp, ROUTES };
