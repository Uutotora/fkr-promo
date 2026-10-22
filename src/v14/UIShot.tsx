import React, { useMemo } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { easeInOut } from "../v13/geom";

/** A live recording of the prototype (4K, 1280×720 CSS px at 3×) with a camera that
    behaves like a screen-recording editor: it starts on the full screen (the frame
    the Seedance push-in landed on), then zooms in and follows the real cursor with a
    critically damped spring, so every click is big and readable. */

export type Track = { w: number; h: number; frames: [number, number, number, number][] };

export type Cam = { z: number; x: number; y: number };

export const planCamera = (track: Track, from: number, n: number, zoom: number, settle: number, out: number): Cam[] => {
  const { w, h, frames } = track;
  const dt = 1 / 60;
  const cams: Cam[] = [];
  let x = w / 2;
  let y = h / 2;
  let vx = 0;
  let vy = 0;
  let z = 1;
  const om = 4.2; // spring stiffness (rad/s): firm but never snappy
  for (let i = 0; i < n; i++) {
    const fr = frames[Math.min(frames.length - 1, from + i)];
    // zoom: hold the full view, then ease in
    const zt = i < settle ? 1 : zoom;
    z += (zt - z) * (1 - Math.exp(-dt / 0.45));
    // focus: the cursor, weighted by how far we are zoomed in
    const k = Math.min(1, Math.max(0, (z - 1) / (zoom - 1)));
    const tx = w / 2 + (Math.min(w, Math.max(0, fr[1])) - w / 2) * k;
    const ty = h / 2 + (Math.min(h, Math.max(0, fr[2])) - h / 2) * k;
    const ax = om * om * (tx - x) - 2 * om * vx;
    const ay = om * om * (ty - y) - 2 * om * vy;
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    // keep the screen covering the frame
    const hw = w / 2 / z;
    const hh = h / 2 / z;
    cams.push({ z, x: Math.min(w - hw, Math.max(hw, x)), y: Math.min(h - hh, Math.max(hh, y)) });
  }
  // the last `out` frames land exactly on the full screen (the next shot starts there)
  for (let i = Math.max(0, n - out); i < n; i++) {
    const u = easeInOut((i - (n - out) + 1) / out);
    const c = cams[i];
    cams[i] = { z: c.z + (1 - c.z) * u, x: c.x + (w / 2 - c.x) * u, y: c.y + (h / 2 - c.y) * u };
  }
  return cams;
};

export const UIShot: React.FC<{
  src: string; // 4K recording in public/
  track: Track;
  from?: number; // first recording frame used
  frames: number; // how many frames this shot shows
  zoom?: number;
  settle?: number; // frames held at full view before the camera moves in
  out?: number; // frames easing back out to the full screen at the end
}> = ({ src, track, from = 0, frames, zoom = 1.7, settle = 36, out = 0 }) => {
  const i = useCurrentFrame();
  const cams = useMemo(() => planCamera(track, from, frames, zoom, settle, out), [track, from, frames, zoom, settle, out]);
  const c = cams[Math.min(cams.length - 1, Math.max(0, i))];
  const S = (1920 / track.w) * c.z; // CSS px → film px
  return (
    <AbsoluteFill style={{ background: "#f3f3f3", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: track.w, height: track.h, transformOrigin: "0 0", transform: `translate(${960 - c.x * S}px, ${540 - c.y * S}px) scale(${S})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={from} muted style={{ width: track.w, height: track.h }} />
      </div>
    </AbsoluteFill>
  );
};
