import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import "../fonts";
import { FPS, TL, TimeShift, tw } from "../lib";
import { NightWorld } from "./NightWorld";
import { Hook } from "./Hook";
import { Now } from "./Now";
import { Dawn } from "./Dawn";
import { Ai } from "./Ai";
import { Market } from "./Market";
import { Effects } from "./Effects";
import { HudV2 } from "./HudV2";
import { S4Dashboard } from "../scenes/S4Dashboard";
import { S5Objects } from "../scenes/S5Objects";
import { S6Object } from "../scenes/S6Object";
import { S7Tmc } from "../scenes/S7Tmc";
import { S8Sign } from "../scenes/S8Sign";
import { S10Close } from "../scenes/S10Close";
import { Grain } from "../components/Backdrop";

const V = TL.v2;

type Item = { at: [number, number]; shift?: number; C: React.FC; fadeIn?: number };

const ITEMS: Item[] = [
  { at: [0, 30.45], C: NightWorld },
  { at: V.hook as [number, number], C: Hook },
  { at: V.now as [number, number], C: Now },
  { at: V.dashboard.at as [number, number], shift: V.dashboard.shift, C: S4Dashboard, fadeIn: 0.45 },
  { at: V.dawn as [number, number], C: Dawn },
  { at: V.objects.at as [number, number], shift: V.objects.shift, C: S5Objects },
  { at: V.object.at as [number, number], shift: V.object.shift, C: S6Object },
  { at: V.tmc.at as [number, number], shift: V.tmc.shift, C: S7Tmc },
  { at: V.ai as [number, number], C: Ai },
  { at: V.market as [number, number], C: Market },
  { at: V.sign.at as [number, number], shift: V.sign.shift, C: S8Sign },
  { at: V.effects as [number, number], C: Effects },
  { at: V.close.at as [number, number], shift: V.close.shift, C: S10Close },
];

export const Film: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const s = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#020328" }}>
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
      <HudV2 />
      <Grain opacity={0.04} />
      {withAudio ? <Audio src={staticFile("audio/v2/soundtrack.wav")} /> : null}
    </AbsoluteFill>
  );
};
