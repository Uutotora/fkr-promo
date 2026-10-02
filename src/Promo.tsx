import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import "./fonts";
import { FPS, TL } from "./lib";
import { S1Hook } from "./scenes/S1Hook";
import { S2Chaos } from "./scenes/S2Chaos";
import { S3Turn } from "./scenes/S3Turn";
import { S4Dashboard } from "./scenes/S4Dashboard";
import { S5Objects } from "./scenes/S5Objects";
import { S6Object } from "./scenes/S6Object";
import { S7Tmc } from "./scenes/S7Tmc";
import { S8Sign } from "./scenes/S8Sign";
import { S9Roles } from "./scenes/S9Roles";
import { S10Close } from "./scenes/S10Close";
import { Hud } from "./components/Hud";
import { Grain } from "./components/Backdrop";

type SceneKey = keyof typeof TL.scenes;

const SCENES: { key: SceneKey; C: React.FC; range?: [number, number] }[] = [
  { key: "hook", C: S1Hook },
  { key: "chaos", C: S2Chaos, range: [7.6, 16.05] },
  { key: "turn", C: S3Turn },
  { key: "dashboard", C: S4Dashboard, range: [19.4, 30.05] },
  { key: "objects", C: S5Objects, range: [30.0, 38.05] },
  { key: "object", C: S6Object, range: [38.0, 46.3] },
  { key: "tmc", C: S7Tmc, range: [46.2, 56.3] },
  { key: "sign", C: S8Sign, range: [56.25, 62.3] },
  { key: "roles", C: S9Roles, range: [62.2, 68.45] },
  { key: "close", C: S10Close, range: [68.42, 76] },
];

export const Promo: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  return (
    <>
      <AbsoluteFill style={{ background: "#000230" }}>
        {SCENES.map(({ key, C, range }) => {
          const [a, b] = range ?? TL.scenes[key];
          if (s < a || s >= b) return null;
          return (
            <AbsoluteFill key={key}>
              <C />
            </AbsoluteFill>
          );
        })}
        <Hud />
        <Grain opacity={0.045} />
        {withAudio ? <Audio src={staticFile("audio/soundtrack.wav")} /> : null}
      </AbsoluteFill>

    </>
  );
};
