import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { C } from "../../theme";
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

/** What a morph starts from / folds into. Default: the map pin as MapStage draws
    it, a white 26 px card (radius 6) with a 12 px orange window. */
export type Look = { size: number; r: number; rim: number; winR: number; color: string };
export const PIN: Look = { size: 26, r: 6, rim: 7, winR: 2.5, color: C.orange };

/** A point in the frame, fixed or following the map camera (film seconds → px). */
export type Where = [number, number] | ((sec: number) => [number, number]);

export type Rect = { x: number; y: number; w: number; h: number; r?: number; sh?: number }; // sh: drop-shadow strength of the target
export const FULL: Rect = { x: 0, y: 0, w: W, h: H, r: 0 };

/** Content of natural size w×h scaled to cover a box of bw×bh (centred, cropped).
    `top`: scale to the box width from the top-left instead, as a window resizes
    (title and first rows stay in place). */
export const Cover: React.FC<{ w: number; h: number; bw: number; bh: number; opacity?: number; top?: boolean; children: React.ReactNode }> = ({ w, h, bw, bh, opacity, top, children }) => {
  const s = top ? bw / w : Math.max(bw / w, bh / h);
  return (
    <div style={{ position: "absolute", left: top ? 0 : (bw - w * s) / 2, top: top ? 0 : (bh - h * s) / 2, width: w, height: h, transformOrigin: "0 0", transform: `scale(${s})`, opacity }}>
      {children}
    </div>
  );
};

/** Pin ↔ rect morph. k = 0 is the pin exactly as the map draws it, k = 1 the rect
    (default: the full frame). The pin's white card grows into the rect; its orange
    window grows inside it and turns into the content; the white rim thins away.
    Size grows geometrically, so the growth reads at an even pace, and the centre
    leaves the pin only as fast as the card grows. Run k backwards to fold. */
export const PinMorph: React.FC<{ k: number; pin: [number, number]; to?: Rect; w?: number; h?: number; look?: Look; children: React.ReactNode }> = ({ k, pin, to = FULL, w = W, h = H, look = PIN, children }) => {
  // cubic in-out: the growth starts at once (the film's quartic camera ease would idle a third of the move)
  const kk = clamp01(k);
  const e = kk < 0.5 ? 4 * kk ** 3 : 1 - Math.pow(-2 * kk + 2, 3) / 2;
  const rT = to.r ?? 0;
  if (e >= 1) {
    return (
      <div style={{ position: "absolute", left: to.x, top: to.y, width: to.w, height: to.h, borderRadius: rT, overflow: "hidden", boxShadow: to.sh ? `0 10px 30px rgba(0,0,20,${to.sh})` : undefined }}>
        <Cover w={w} h={h} bw={to.w} bh={to.h}>
          {children}
        </Cover>
      </div>
    );
  }
  const s0 = look.size;
  const cw = s0 * Math.pow(to.w / s0, e);
  const ch = s0 * Math.pow(to.h / s0, e);
  const g = clamp01(((cw - s0) / (to.w - s0) + (ch - s0) / (to.h - s0)) / 2);
  const cx = pin[0] + (to.x + to.w / 2 - pin[0]) * g;
  const cy = pin[1] + (to.y + to.h / 2 - pin[1]) * g;
  const r = look.r + (rT - look.r) * g + 12 * Math.sin(Math.PI * g);
  const m = look.rim * (1 - g);
  const ri = Math.max(look.winR * (1 - g), r - m * 0.55);
  const orange = 1 - clamp01((e - 0.12) / 0.38);
  const iw = cw - 2 * m;
  const ih = ch - 2 * m;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - cw / 2,
        top: cy - ch / 2,
        width: cw,
        height: ch,
        borderRadius: r,
        background: "#fff",
        overflow: "hidden",
        boxShadow: look.rim > 0 || to.sh ? `0 ${4 + 6 * g}px ${10 + 20 * g}px rgba(0,2,48,${(look.rim > 0 ? 0.25 : 0) * (1 - g) + (to.sh ?? 0) * g})` : undefined,
      }}
    >
      <div style={{ position: "absolute", left: m, top: m, width: iw, height: ih, borderRadius: ri, overflow: "hidden", background: look.color }}>
        {orange < 1 && (
          <Cover w={w} h={h} bw={iw} bh={ih}>
            {children}
          </Cover>
        )}
        {orange > 0 && <div style={{ position: "absolute", inset: 0, background: look.color, opacity: orange }} />}
      </div>
    </div>
  );
};

/** Clip lengths in frames at 60 fps (ffprobe). Past its end a shot holds its last
    frame: asking the decoder for a frame beyond the end can hang the render. */
const CLIP_FRAMES: Record<string, number> = {
  "v13/live/L3_phone_s78.mp4": 384,
  "v13/live/L5_tablet.mp4": 298,
  "v13/live/L6_approver.mp4": 238,
  "v13/live/L7_supplier.mp4": 298,
  "v13/live/L8_truck.mp4": 298,
  "v13/live/L9_sign.mp4": 238,
  "v13/live/L10_resident.mp4": 298,
  "v13/live/P4_office.mp4": 298,
};

export const LiveInsert: React.FC<{
  src: string;
  start: number; // film frame where the clip's first frame shows
  rate?: number;
  pin?: Where; // the pin it grows out of (may follow the moving map camera)
  open?: [number, number]; // film frames: pin → full frame
  close?: [number, number]; // film frames: full frame → pin
  closePin?: Where;
  track?: Track;
  push?: [number, number]; // film frames: into the screen
  ep?: number; // explicit push amount 0…1 (overrides `push`), for pull-outs
  ui?: { w: number; h: number; node: React.ReactNode };
}> = ({ src, start, rate = 1, pin, open, close, closePin, track, push, ep: epOverride, ui }) => {
  const now = useCurrentFrame();
  const hold = Math.floor(((CLIP_FRAMES[src] ?? Infinity) - 1) / rate);
  const local = Math.min(now, hold);
  const f = now + start;
  // the shot grows out of its map pin and folds back into one
  let k = 1;
  let where = pin;
  if (open && pin && f < open[1]) k = ramp(f, open[0], open[1]);
  if (close && (closePin ?? pin) && f > close[0]) {
    k = 1 - ramp(f, close[0], close[1]);
    where = closePin ?? pin;
  }
  const at = where ? (typeof where === "function" ? where(f / 60) : where) : undefined;
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
          <Freeze frame={hold} active={now > hold}>
            <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{ width: W, height: H, filter: "brightness(1.17) saturate(0.55)" }} />
          </Freeze>
        </AbsoluteFill>
      </>
    );
  }

  const shot = (
    <AbsoluteFill style={{ transform: `scale(${settle})` }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: cam }}>
        <Freeze frame={hold} active={now > hold}>
          <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{ width: W, height: H }} />
        </Freeze>
        {uiLayer}
      </AbsoluteFill>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      {k < 1 && at ? (
        <PinMorph k={k} pin={at}>
          {shot}
        </PinMorph>
      ) : (
        shot
      )}
    </AbsoluteFill>
  );
};
