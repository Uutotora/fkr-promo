import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, FONT } from "../theme";
import { FPS, IN, INOUT, OUT, tw } from "../lib";
import { LogoMark, Wordmark } from "../components/Logo";
import { Film3, FILM3_DURATION } from "./Film3";

/** Seconds of the ФКР card before the film starts (the film's first frame is near-black night). */
export const INTRO = 1.2;
export const FILM_FINAL_DURATION = FILM3_DURATION + INTRO;

const MARK_H = 330;
const K = MARK_H / 56;
const MX = 536; // mark + wordmark, optically centred
const MY = 540 - MARK_H / 2;
// the lit window the camera flies into, then out of it — into the night city
const WIN = { x: MX + (16 + 1.5) * K, y: MY + (32 + 3) * K };

/** Opening card: the ФКР mark on light paper from frame 0 (the thumbnail), then the camera
 *  flies into a lit window and its warm glow opens onto the night film. */
export const Intro: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  if (s > 1.7) return null;
  const push = 1 + tw(s, [0, 0.8], [0, 0.025], OUT);
  const z = tw(s, [0.78, 1.3], [0, 1], IN);
  const S = push * Math.exp(z * Math.log(110));
  const m = tw(s, [0.78, 1.2], [0, 1], INOUT);
  const blur = tw(s, [1.0, 1.28], [0, 10]);
  const warmIn = tw(s, [1.02, 1.26], [0, 1], IN);
  const warmOut = tw(s, [1.28, 1.7], [0, 1], OUT);
  const paper = s < 1.27 ? 1 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {paper > 0 && (
        <AbsoluteFill style={{ background: "#fff", fontFamily: FONT }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(49,107,253,0.10), transparent 70%)" }} />
          <AbsoluteFill
            style={{
              transformOrigin: `${WIN.x}px ${WIN.y}px`,
              transform: `translate(${(960 - WIN.x) * m}px, ${(540 - WIN.y) * m}px) scale(${S})`,
              filter: blur > 0.05 ? `blur(${blur / Math.sqrt(S)}px)` : undefined,
            }}
          >
            {/* soft warm glow behind the windows */}
            <div style={{ position: "absolute", left: WIN.x - 170, top: WIN.y - 200, width: 340, height: 400, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,133,12,0.16), transparent)" }} />
            <div style={{ position: "absolute", left: MX, top: MY }}>
              <LogoMark size={MARK_H} strokeW={3.2} />
            </div>
            <div style={{ position: "absolute", left: MX + MARK_H * (44 / 56) + 55, top: MY + 77 }}>
              <Wordmark size={123} color={C.logoInk} />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {/* the window's light fills the frame, then thins out to the night */}
      <AbsoluteFill
        style={{
          opacity: warmIn * (1 - warmOut),
          background: `radial-gradient(ellipse ${70 + warmOut * 60}% ${70 + warmOut * 60}% at 50% 50%, #FFB25C 0%, ${C.orangeLogo} 30%, rgba(160,60,20,0.85) 65%, rgba(0,2,48,0.9) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** The final film: ФКР card, then Film3. */
export const FilmFinal: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: "#010210" }}>
    <Sequence from={Math.round(INTRO * FPS)}>
      <Film3 withAudio={false} />
    </Sequence>
    <Intro />
    {withAudio && <Audio src={staticFile("audio/final/soundtrack.wav")} />}
  </AbsoluteFill>
);
