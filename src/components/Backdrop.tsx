import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { useSec } from "../lib";

/** Light stage: warm-grey paper with slow drifting blue light and a faint dot grid. */
export const LightStage: React.FC<{ glowX?: number; glowY?: number; intensity?: number }> = ({ glowX = 0.7, glowY = 0.45, intensity = 1 }) => {
  const s = useSec();
  const dx = Math.sin(s * 0.35) * 80;
  const dy = Math.cos(s * 0.27) * 50;
  return (
    <AbsoluteFill style={{ background: "#F4F5F8", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(0,2,48,0.075) 1.3px, transparent 1.3px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 85%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1920 * glowX - 900 + dx,
          top: 1080 * glowY - 700 + dy,
          width: 1800,
          height: 1400,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(49,107,253,0.22), rgba(49,107,253,0.08) 55%, transparent)",
          opacity: intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -300 - dx,
          top: 600 - dy,
          width: 1100,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(253,132,49,0.10), transparent)",
          opacity: intensity,
        }}
      />
    </AbsoluteFill>
  );
};

export const NightStage: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 50% 40%, #0a0f5a 0%, ${C.night} 60%, #00011a 100%)` }} />
);

/** Fine film grain to keep large flat areas alive. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const s = useSec();
  const seed = 3; // a still grain: animated noise reads as shaking on UI
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Soft vignette. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.25 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 80% 75% at 50% 50%, transparent 55%, rgba(0,2,48,${strength}) 100%)` }} />
);
