import React from "react";
import { AbsoluteFill } from "remotion";
import { ProtoFrame } from "./ProtoFrame";

/** Fidelity check: one prototype snapshot at full frame. */
export const SnapTest: React.FC<{ snap: string; w: number; h: number }> = ({ snap, w, h }) => (
  <AbsoluteFill style={{ background: "#f3f3f3" }}>
    <div style={{ transformOrigin: "0 0", transform: `scale(${1920 / w})` }}>
      <ProtoFrame snap={snap} w={w} h={h} />
    </div>
  </AbsoluteFill>
);
