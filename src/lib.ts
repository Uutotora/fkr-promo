import React, { createContext, useContext } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import TL from "./timeline.json";

export { TL };
export const FPS = TL.fps;
export const f = (sec: number) => Math.round(sec * FPS);

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const SNAP = Easing.bezier(0.83, 0, 0.17, 1);
export const OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);

/** Scenes keep their own authored clock; the film places them by shifting time. */
/** A hold: at authored time `at` the scene slows down — `film` seconds of film advance the
    authored clock by only `adv` seconds — giving the viewer time to read without a freeze. */
export type Hold = { at: number; film: number; adv: number };
const Shift = createContext<{ by: number; holds: Hold[] }>({ by: 0, holds: [] });
export const TimeShift: React.FC<{ by: number; holds?: Hold[]; children: React.ReactNode }> = ({ by, holds = [], children }) =>
  React.createElement(Shift.Provider, { value: { by, holds } }, children);

/** Current time in seconds on the scene's authored clock. */
export const useSec = () => {
  const frame = useCurrentFrame();
  const { by, holds } = useContext(Shift);
  let t = frame / FPS - by;
  for (const h of holds) {
    if (t <= h.at) break;
    if (t < h.at + h.film) return h.at + ((t - h.at) / h.film) * h.adv;
    t = t - h.film + h.adv;
  }
  return t;
};

/** Clamped interpolation over seconds. */
export const tw = (
  s: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = EXPO,
) =>
  interpolate(s, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Spring progress starting at `start` seconds. */
export const useSpr = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (start: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
    spring({
      frame: frame - start * fps,
      fps,
      config: { damping: cfg.damping ?? 14, stiffness: cfg.stiffness ?? 170, mass: cfg.mass ?? 1 },
    });
};

/** Overshooting pop scale from 0 → 1. */
export const pop = (s: number, start: number, dur = 0.45) => {
  if (s < start) return 0;
  const t = Math.min(1, (s - start) / dur);
  // damped oscillation around 1
  return 1 - Math.exp(-6 * t) * Math.cos(9 * t) * (1 - t * 0.15);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Deterministic pseudo random. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Keyframe track: [[t, value], ...] eased between keys. */
export const track = (s: number, keys: [number, number][], easing = INOUT) => {
  if (s <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (s <= t1) return lerp(v0, v1, easing((s - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
};

export const fmt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
