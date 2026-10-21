import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { Quad, clamp01, easeInOut, homography, lerpQuad, matrix3d, ramp, rectQuad } from "../geom";

/** Live inserts: a pin on the map opens into the shot (rounded square → full
    frame); in device shots the camera then pushes into the tracked screen until
    the interface on it fills the frame exactly as the next UI scene shows it. */

export type Track = { w: number; h: number; fps: number; corners: number[][][] };

const W = 1920;
const H = 1080;

/** Screen quad (frame coords) for a clip-local film frame. */
export const quadAt = (track: Track, local: number, rate = 1): Quad => {
  const src = (local / 60) * rate * track.fps;
  const c = track.corners;
  const i = Math.max(0, Math.min(c.length - 1, Math.floor(src)));
  const j = Math.min(c.length - 1, i + 1);
  const u = clamp01(src - i);
  const k = W / track.w;
  return c[i].map((p, n) => [(p[0] + (c[j][n][0] - p[0]) * u) * k, (p[1] + (c[j][n][1] - p[1]) * u) * k]) as Quad;
};

/** The rectangle a UI of logical size w×h covers when it fills the frame. */
export const coverRect = (w: number, h: number) => {
  const s = Math.max(W / w, H / h);
  return { s, x: (W - w * s) / 2, y: (H - h * s) / 2 };
};

/** Rounded-rect reveal from a pin. `pin` is the pin centre in frame coords. */
export const reveal = (k: number, pin: [number, number], size = 26) => {
  const e = easeInOut(k);
  const half = size / 2;
  const top = (pin[1] - half) * (1 - e);
  const left = (pin[0] - half) * (1 - e);
  const right = (W - pin[0] - half) * (1 - e);
  const bottom = (H - pin[1] - half) * (1 - e);
  const r = 6 + (0 - 6) * e + 30 * Math.sin(Math.PI * e) * 0.4;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${r}px)`;
};

export const LiveInsert: React.FC<{
  src: string;
  start: number; // film frame where the clip's first frame shows
  rate?: number;
  pin?: [number, number];
  open?: [number, number]; // film frames: pin → full frame
  close?: [number, number]; // film frames: full frame → pin
  closePin?: [number, number];
  track?: Track;
  push?: [number, number]; // film frames: into the screen
  ep?: number; // explicit push amount 0…1 (overrides `push`), for pull-outs
  ui?: { w: number; h: number; node: React.ReactNode };
}> = ({ src, start, rate = 1, pin, open, close, closePin, track, push, ep: epOverride, ui }) => {
  const local = useCurrentFrame();
  const f = local + start;
  let clip: string | undefined;
  if (open && pin && f < open[1]) clip = reveal(ramp(f, open[0], open[1]), pin);
  if (close && (closePin ?? pin) && f > close[0]) clip = reveal(1 - ramp(f, close[0], close[1]), (closePin ?? pin)!);
  const settle = open ? 1.12 - 0.12 * easeInOut(ramp(f, open[0], open[1] + 30)) : 1;

  let cam = "none";
  let uiLayer: React.ReactNode = null;
  if (track && ui) {
    const q = quadAt(track, local, rate);
    const c = coverRect(ui.w, ui.h);
    const full = rectQuad(ui.w * c.s, ui.h * c.s, c.x, c.y);
    const ep = epOverride !== undefined ? easeInOut(epOverride) : push ? easeInOut(ramp(f, push[0], push[1])) : 0;
    const camH = homography(q, lerpQuad(q, full, ep));
    cam = matrix3d(camH);
    const uiH = homography(rectQuad(ui.w, ui.h), q);
    const soft = 1 - ep;
    uiLayer = (
      <>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: ui.w,
            height: ui.h,
            transformOrigin: "0 0",
            transform: matrix3d(uiH),
            filter: soft > 0.01 ? `blur(${0.6 * soft}px) contrast(${1 - 0.05 * soft})` : undefined,
            overflow: "hidden",
          }}
        >
          {ui.node}
        </div>
        {/* the screen's own light falloff over the interface */}
        <AbsoluteFill
          style={{
            clipPath: `polygon(${q.map((p) => `${p[0]}px ${p[1]}px`).join(",")})`,
            mixBlendMode: "multiply",
            opacity: 0.85 * soft,
          }}
        >
          <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{ width: W, height: H, filter: "brightness(1.17) saturate(0.55)" }} />
        </AbsoluteFill>
      </>
    );
  }

  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      <AbsoluteFill style={{ transform: `scale(${settle})` }}>
        <AbsoluteFill style={{ transformOrigin: "0 0", transform: cam }}>
          <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{ width: W, height: H }} />
          {uiLayer}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
