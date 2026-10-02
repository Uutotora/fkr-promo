import React from "react";
import { C, FONT, glow } from "../theme";
import { EXPO, tw, useSec } from "../lib";
import { LogoMark } from "./Logo";

const CH: [string, number][] = [
  ["Программа", 20.3],
  ["Объекты", 30.0],
  ["Работы", 38.0],
  ["ТМЦ", 46.0],
  ["Подпись", 56.0],
  ["Участники", 62.0],
];

/** Persistent chrome across the product chapters: mark on the left, chapter rail on the right. */
export const Hud: React.FC = () => {
  const s = useSec();
  // step aside while the camera is close to the product
  const ZOOMS: [number, number][] = [
    [24.45, 29.3],
    [32.45, 37.75],
    [39.7, 42.5],
    [47.5, 50.9],
  ];
  const hide = ZOOMS.reduce((h, [a, b]) => Math.max(h, Math.min(tw(s, [a, a + 0.35], [0, 1]), 1 - tw(s, [b, b + 0.35], [0, 1]))), 0);
  const k = tw(s, [20.4, 21.2], [0, 1], EXPO) * (1 - tw(s, [67.4, 67.9], [0, 1])) * (1 - hide);
  if (k <= 0) return null;
  let cur = 0;
  CH.forEach(([, t], i) => {
    if (s >= t) cur = i;
  });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, fontFamily: FONT, opacity: k, translate: `0 ${(1 - k) * -20}px` }}>
      <div style={{ position: "absolute", left: 96, top: 38, display: "flex", alignItems: "center", gap: 14 }}>
        <LogoMark size={40} strokeW={4} />
        <div style={{ fontSize: 19, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
          ФКР Москвы
          <div style={{ fontSize: 15, fontWeight: 500, color: C.muted }}>Единая система РСКР</div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 96, top: 40, display: "flex", gap: 4, padding: 5, borderRadius: 16, background: "rgba(255,255,255,0.7)", boxShadow: "0 10px 30px -18px rgba(0,2,48,0.3)" }}>
        {CH.map(([l], i) => {
          const on = i === cur;
          return (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 14px", borderRadius: 11, background: on ? glow : "transparent", fontSize: 16, fontWeight: on ? 700 : 500, color: on ? C.ink : i < cur ? C.ink2 : C.faint }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: on ? C.blue : C.faint, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
};
