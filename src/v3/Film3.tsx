import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import "../fonts";
import { FPS, TimeShift, tw } from "../lib";
import { Moscow } from "./Moscow";
import { Hook } from "../v2/Hook";
import { Now3, NOW3 } from "./Now3";
import { Dawn } from "../v2/Dawn";
import { Ai3 } from "./Ai3";
import { Market4 } from "./Market4";
import { Effects3 } from "./Effects3";
import { Hud3 } from "./Hud3";
import { Sweeps } from "./Sweep";
import { S4Dashboard } from "../scenes/S4Dashboard";
import { S5Objects } from "../scenes/S5Objects";
import { S6Object } from "../scenes/S6Object";
import { S7Tmc } from "../scenes/S7Tmc";
import { S8Sign } from "../scenes/S8Sign";
import { S10Close } from "../scenes/S10Close";
import { Grain } from "../components/Backdrop";

export const FILM3_DURATION = 146;

type Item = { at: [number, number]; shift?: number; C: React.FC; fadeIn?: number };

const ITEMS: Item[] = [
  { at: [0, 39.45], C: Moscow },
  { at: [0, 8.2], C: Hook },
  { at: [8, 33.6], C: Now3 },
  { at: [38.4, 49.05], shift: 19, C: S4Dashboard, fadeIn: 0.45 },
  { at: [33, 39.4], shift: 9, C: Dawn },
  { at: [49, 57.05], shift: 19, C: S5Objects },
  { at: [57, 65.3], shift: 19, C: S6Object },
  { at: [65.2, 75.3], shift: 19, C: S7Tmc },
  { at: [74.7, 94.5], shift: 9, C: Ai3 },
  { at: [94, 106.4], C: Market4 },
  { at: [106.25, 112.3], shift: 50, C: S8Sign },
  { at: [112, 138.5], C: Effects3 },
  { at: [138.42, 146], shift: 70, C: S10Close },
];

const SWEEPS = [
  ...NOW3.p.slice(1).map((t) => ({ t: t - 0.15, dark: true })),
  { t: 64.75 },
  { t: 93.95 },
  { t: 106.0, dir: -1 as const },
];

export const Film3: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#010210" }}>
      {ITEMS.map(({ at: [a, b], shift = 0, C, fadeIn }, i) => {
        if (s < a || s >= b) return null;
        return (
          <AbsoluteFill key={i} style={{ opacity: fadeIn ? tw(s, [a, a + fadeIn], [0, 1]) : 1 }}>
            <TimeShift by={shift}>
              <C />
            </TimeShift>
          </AbsoluteFill>
        );
      })}
      <Sweeps at={SWEEPS} />
      <Hud3 />
      <Grain opacity={0.035} />
      {withAudio ? <Audio src={staticFile("audio/v3/soundtrack.wav")} /> : null}
    </AbsoluteFill>
  );
};
