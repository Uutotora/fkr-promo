import P from "./pace.json";
import { applyHolds, type Hold } from "../lib";

/** Pace map built by scripts/pace.py: story clock (s12) of every film frame. */
export const PACE = P as unknown as { fps: number; end: number; duration: number; inserts: [number, number][]; holdsFilm: [number, number][]; s: number[] };
export const FRAMES = PACE.s.length;

/** Story time (s12) of a film frame (frame 0 = first frame after the logo card). */
export const storyAt = (frame: number) => PACE.s[Math.max(0, Math.min(FRAMES - 1, Math.round(frame)))];

/** Legacy v9 scenes run on the v5 clock: new material inserted at v5 moments pauses them. */
export const INSERT_HOLDS: Hold[] = PACE.inserts.map(([x, d]) => ({ at: x, film: d, adv: 0 }));
export const to5 = (s12: number) => applyHolds(s12, INSERT_HOLDS);
export const s12of5 = (t5: number) => t5 + PACE.inserts.reduce((a, [x, d]) => a + (t5 > x + 1e-9 ? d : 0), 0);
export const legacyMap = (frame: number) => to5(storyAt(frame));
export const storyMap = (frame: number) => storyAt(frame);
