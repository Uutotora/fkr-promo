import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import "../fonts";
import { FPS, TimeShift, tw, type Hold } from "../lib";
import { Moscow } from "./Moscow12";
import { Hook } from "../v2/Hook";
import { Now7, NOW7 } from "./Now7";
import { Dawn3 } from "../v3/Dawn3";
import { Ai12 } from "./Ai12";
import { Market12, CAL } from "./Market12";
import { Effects12, EFF_EXT } from "./Effects12";
import { Hud12, type Hud12Plan } from "./Hud12";
import { S4Dashboard } from "../scenes/S4Dashboard";
import { Objects12, OBJ12_END } from "./Objects12";
import { Cycle, CYCLE_END } from "./Cycle";
import { Tmc12, PUSHES } from "./Tmc12";
import { S8Sign } from "../scenes/S8Sign";
import { S10Close } from "../scenes/S10Close";
import { Grain } from "../components/Backdrop";
import { Intro, INTRO } from "../v3/Intro";
import { PACE, FRAMES, legacyMap, s12of5, storyAt, storyMap } from "./pace";

export const FILM12_FRAMES = FRAMES;
export const FINAL12_FRAMES = FRAMES + Math.round(INTRO * FPS);

const Dash = () => <S4Dashboard morphIn />;
const Sign = () => <S8Sign fromWindow />;

/** at: story range (s12) — legacy items give it on the v5 clock (`v5: true`) and are converted. */
type Item = { at: [number, number]; v5?: boolean; shift?: number; holds?: Hold[]; C: React.FC; fadeIn?: number; dof?: boolean };

/* v12 product chapters on the story clock (s12). Objects12 keeps the v9 local clock (30 → OBJ12_END),
   Cycle runs 0 → CYCLE_END, Tmc12 keeps the v9 local clock (46.2 → 62.3, pushes added). */
const OBJ_AT = s12of5(49);
const CYC_AT = OBJ_AT + (OBJ12_END - 30);
const TMC_AT = CYC_AT + CYCLE_END;
const TMC_SHIFT = TMC_AT - 46.2;
if (Math.abs(s12of5(65.2) - TMC_AT) > 0.02 || Math.abs(s12of5(75.7) - (TMC_SHIFT + 56.7 + (PUSHES.end - PUSHES.at))) > 0.02)
  console.warn("pace inserts do not match the v12 chapters", s12of5(65.2), TMC_AT, s12of5(75.7), TMC_SHIFT + 56.7 + (PUSHES.end - PUSHES.at));

const AI_SHIFT = s12of5(75.7) - 65.7;
const MK_SHIFT = s12of5(95) - 94.0;
const EF_SHIFT = s12of5(114.5) - 112.0;
const OBJ = (l: number) => OBJ_AT - 30 + l;
const TMC = (l: number) => TMC_SHIFT + l + (l > 47.15 ? 1.0 : 0);
const MKL = (l: number) => MK_SHIFT + l + (l > 95.2 ? 1.5 : 0);
const HUD: Hud12Plan = {
  from: s12of5(39.4),
  to: s12of5(114.0),
  ch: [["Программа", s12of5(39.3)], ["Объекты", OBJ_AT], ["Весь цикл", CYC_AT], ["ТМЦ", TMC_AT], ["ИИ", AI_SHIFT + 66.0], ["Маркетплейс", s12of5(95.0)], ["Подпись", s12of5(108.7)]],
  hide: [[s12of5(43.45), s12of5(48.3)], [OBJ(32.45), OBJ(42.4)], [CYC_AT + 7.1, CYC_AT + CYCLE_END], [TMC(48.5), TMC(51.9)], [AI_SHIFT + 71.8, AI_SHIFT + 73.7], [AI_SHIFT + 74.9, AI_SHIFT + 101.2], [MKL(96.9), MKL(102.9)], [MKL(103.3), MKL(103.4 + CAL.ext + 0.2)]],
};

const ITEMS: Item[] = [
  { at: [0, 39.45], v5: true, C: Moscow, dof: true },
  { at: [0, 8.2], v5: true, C: Hook },
  { at: [8, NOW7.end + 0.9], C: Now7 },
  { at: [38.4, 49.05], v5: true, shift: 19, C: Dash, fadeIn: 0.45 },
  { at: [33, 39.4], v5: true, shift: 9, C: Dawn3 },
  { at: [OBJ_AT, CYC_AT + 0.05], shift: OBJ_AT - 30, C: Objects12 },
  { at: [CYC_AT, TMC_AT + 0.1], shift: CYC_AT, C: Cycle },
  { at: [TMC_AT, TMC_SHIFT + 62.3], shift: TMC_SHIFT, holds: [{ at: 47.15, film: 1.02, adv: 0.02 }], C: Tmc12 },
  { at: [s12of5(75.7), AI_SHIFT + 101.5], shift: AI_SHIFT, C: Ai12 },
  { at: [s12of5(95), MK_SHIFT + 107.9 + CAL.ext], shift: MK_SHIFT, holds: [{ at: 95.2, film: 1.52, adv: 0.02 }], C: Market12 },
  { at: [108.75, 114.8], v5: true, shift: 52.5, C: Sign },
  { at: [s12of5(114.5), EF_SHIFT + 138.5 + EFF_EXT], shift: EF_SHIFT, C: Effects12 },
  { at: [140.92, 148.5], v5: true, shift: 72.5, C: S10Close },
];

/** While the story rests the camera keeps breathing: a slow push-in through each hold, released gently. */
const holdPush = (T: number) => {
  let z = 0;
  for (const [a, len] of PACE.holdsFilm) {
    if (T < a) break;
    const e = (u: number) => u * u * (3 - 2 * u);
    const inK = e(Math.min(1, (T - a) / Math.max(0.8, len)));
    const outK = T > a + len ? e(Math.min(1, (T - a - len) / 1.8)) : 0;
    z = Math.max(z, inK * (1 - outK) * Math.min(1, len / 1.4));
  }
  return 1 + 0.018 * z;
};

/** Shallow depth of field on the city while «как сейчас» is in focus (v5 clock). */
const dof5 = (s5: number) => tw(s5, [8.6, 9.6], [0, 3.5]) * (1 - tw(s5, [32.3, 33.2], [0, 1]));

export const Film12: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const s = storyAt(frame);
  return (
    <AbsoluteFill style={{ background: "#010210" }}>
      <AbsoluteFill style={{ scale: String(holdPush(T)) }}>
        {ITEMS.map(({ at: [a, b], v5, shift = 0, holds, C, fadeIn, dof }, i) => {
          const A = v5 ? s12of5(a) : a, B = v5 ? s12of5(b) : b;
          if (s < A || s >= B) return null;
          const d = dof ? dof5(legacyMap(frame)) : 0;
          return (
            <AbsoluteFill key={i} style={{ opacity: fadeIn ? tw(s, [A, A + fadeIn], [0, 1]) : 1, filter: d > 0.05 ? `blur(${d}px)` : undefined }}>
              <TimeShift by={shift} holds={holds} map={v5 ? legacyMap : storyMap}>
                <C />
              </TimeShift>
            </AbsoluteFill>
          );
        })}
        <TimeShift by={0} map={storyMap}>
          <Hud12 plan={HUD} />
        </TimeShift>
      </AbsoluteFill>
      <Grain opacity={0.035} />
      {withAudio ? <Audio src={staticFile("audio/v8/soundtrack.wav")} /> : null}
    </AbsoluteFill>
  );
};

/** The final v12 film: the ФКР card (untouched), then Film12. */
export const FilmFinal12: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: "#010210" }}>
    <Sequence from={Math.round(INTRO * FPS)}>
      <Film12 />
    </Sequence>
    <Intro />
    {withAudio && <Audio src={staticFile("audio/v8/soundtrack.wav")} />}
  </AbsoluteFill>
);
