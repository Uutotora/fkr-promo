import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/** The film's Moscow map: OpenFreeMap «Positron», the same style as the
    prototype's dashboard map, so the film map and the system map are one map.
    `day` 0 → night palette (как сейчас), 1 → the prototype's own colours.
    The camera is top-down; overlays use `project()` below with the same maths. */

export const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
export const W = 1920;
export const H = 1080;

export type Cam = { lng: number; lat: number; zoom: number };

// Web Mercator in MapLibre's 512 px world.
const world = (z: number) => 512 * Math.pow(2, z);
const mx = (lng: number, z: number) => ((lng + 180) / 360) * world(z);
const my = (lat: number, z: number) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * world(z);
};
/** Screen position of a lng/lat for a camera (pixels in the 1920×1080 frame). */
export const project = (cam: Cam, lng: number, lat: number): [number, number] => [
  mx(lng, cam.zoom) - mx(cam.lng, cam.zoom) + W / 2,
  my(lat, cam.zoom) - my(cam.lat, cam.zoom) + H / 2,
];

// Paint keys we recolour, with night and day values. Day values are Positron's.
type Rgb = [number, number, number, number];
const NIGHT: Record<string, Rgb> = {
  bg: [9, 12, 38, 1],
  park: [12, 17, 46, 1],
  water: [22, 33, 82, 1],
  resid: [11, 15, 42, 1],
  wood: [12, 18, 46, 1],
  building: [16, 21, 56, 1],
  minor: [24, 30, 72, 1],
  majorCasing: [20, 26, 66, 1],
  major: [38, 46, 104, 1],
  motorway: [52, 62, 132, 1],
  rail: [26, 32, 76, 1],
  label: [132, 140, 196, 1],
  halo: [9, 12, 38, 0.8],
};
const DAY: Record<string, Rgb> = {
  bg: [242, 243, 240, 1],
  park: [230, 233, 229, 1],
  water: [194, 200, 202, 1],
  resid: [234, 234, 230, 1],
  wood: [220, 224, 220, 1],
  building: [234, 234, 229, 1],
  minor: [224, 224, 224, 1],
  majorCasing: [213, 213, 213, 1],
  major: [255, 255, 255, 1],
  motorway: [255, 255, 255, 1],
  rail: [221, 221, 221, 1],
  label: [51, 51, 51, 1],
  halo: [255, 255, 255, 1],
};
const LAYERS: [string, string, string][] = [
  ["background", "background-color", "bg"],
  ["park", "fill-color", "park"],
  ["water", "fill-color", "water"],
  ["landuse_residential", "fill-color", "resid"],
  ["landcover_wood", "fill-color", "wood"],
  ["waterway", "line-color", "water"],
  ["building", "fill-color", "building"],
  ["building", "fill-outline-color", "building"],
  ["highway_path", "line-color", "minor"],
  ["highway_minor", "line-color", "minor"],
  ["highway_major_casing", "line-color", "majorCasing"],
  ["highway_major_inner", "line-color", "major"],
  ["highway_major_subtle", "line-color", "major"],
  ["highway_motorway_casing", "line-color", "majorCasing"],
  ["highway_motorway_inner", "line-color", "motorway"],
  ["highway_motorway_subtle", "line-color", "motorway"],
  ["highway_motorway_bridge_casing", "line-color", "majorCasing"],
  ["highway_motorway_bridge_inner", "line-color", "motorway"],
  ["tunnel_motorway_casing", "line-color", "majorCasing"],
  ["tunnel_motorway_inner", "line-color", "motorway"],
  ["railway", "line-color", "rail"],
  ["railway_transit", "line-color", "rail"],
  ["railway_service", "line-color", "rail"],
  ["railway_dashline", "line-color", "rail"],
  ["railway_transit_dashline", "line-color", "rail"],
  ["railway_service_dashline", "line-color", "rail"],
];
const LABELS = ["label_city", "label_city_capital", "label_town", "label_village", "label_other", "label_state", "water_name_point_label", "water_name_line_label"];

const mix = (a: Rgb, b: Rgb, t: number) =>
  `rgba(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)},${(a[3] + (b[3] - a[3]) * t).toFixed(3)})`;

let stylePromise: Promise<maplibregl.StyleSpecification> | null = null;
const loadStyle = () => {
  stylePromise ??= fetch(STYLE_URL)
    .then((r) => r.json())
    .then((s: maplibregl.StyleSpecification) => {
      // Russian names, the film's typeface weight; drop the raster relief.
      for (const l of s.layers as any[]) {
        if (l.type === "symbol" && l.layout?.["text-field"]) l.layout["text-field"] = ["coalesce", ["get", "name:ru"], ["get", "name"]];
        if (l.type === "symbol" && !LABELS.includes(l.id)) l.layout = { ...l.layout, visibility: "none" };
      }
      s.layers = (s.layers as any[]).filter((l) => l.source !== "ne2_shaded");
      // Paint changes must land in the same frame: no style transitions.
      (s as any).transition = { duration: 0, delay: 0 };
      return s;
    });
  return stylePromise;
};

export const MoscowMap: React.FC<{ cam: Cam; day: number; labels?: number }> = ({ cam, day, labels = 1 }) => {
  const frame = useCurrentFrame();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [boot] = useState(() => delayRender("map boot", { timeoutInMilliseconds: 120000 }));

  useEffect(() => {
    let cancelled = false;
    loadStyle().then((style) => {
      if (cancelled || !el.current) return;
      const m = new maplibregl.Map({
        container: el.current,
        style,
        center: [cam.lng, cam.lat],
        zoom: cam.zoom,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        pixelRatio: window.devicePixelRatio,
        canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
      } as any);
      map.current = m;
      m.once("idle", () => {
        setReady(true);
        continueRender(boot);
      });
    });
    return () => {
      cancelled = true;
      map.current?.remove();
    };
  }, []);

  useLayoutEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const h = delayRender(`map frame ${frame}`, { timeoutInMilliseconds: 120000 });
    m.jumpTo({ center: [cam.lng, cam.lat], zoom: cam.zoom });
    for (const [id, prop, key] of LAYERS) if (m.getLayer(id)) m.setPaintProperty(id, prop as any, mix(NIGHT[key], DAY[key], day));
    for (const id of LABELS) {
      if (!m.getLayer(id)) continue;
      m.setPaintProperty(id, "text-color", mix(NIGHT.label, DAY.label, day));
      m.setPaintProperty(id, "text-halo-color", mix(NIGHT.halo, DAY.halo, day));
      m.setPaintProperty(id, "text-opacity", labels);
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(h);
    };
    m.once("idle", finish);
    m.triggerRepaint();
    // If nothing changed the map is already idle and fires no event.
    setTimeout(() => {
      if (m.areTilesLoaded() && !m.isMoving()) requestAnimationFrame(() => requestAnimationFrame(finish));
    }, 50);
  }, [frame, ready, cam.lng, cam.lat, cam.zoom, day, labels]);

  return (
    <>
      <div ref={el} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
    </>
  );
};
