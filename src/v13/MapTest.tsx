import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MoscowMap } from "./MoscowMap";

/** Map check: frame 0 night, frame 1 day, frame 2 a closer day view. */
export const MapTest: React.FC = () => {
  const f = useCurrentFrame();
  const cam = f < 2 ? { lng: 37.62, lat: 55.75, zoom: 9.55 } : { lng: 37.6, lat: 55.68, zoom: 12.2 };
  return (
    <AbsoluteFill>
      <MoscowMap cam={cam} day={f === 0 ? 0 : 1} />
    </AbsoluteFill>
  );
};
