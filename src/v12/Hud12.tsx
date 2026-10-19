import React from "react";
import { C, FONT, glow } from "../theme";
import { EXPO, tw, useSec } from "../lib";
import { LogoMark } from "../components/Logo";
import { s12of5 } from "./pace";

/** Chapter navigation of the product part (v12 story clock). Hidden while the camera is close. */
export type Hud12Plan = { ch: [string, number][]; hide: [number, number][]; from: number; to: number };

export const Hud12: React.FC<{ plan: Hud12Plan }> = ({ plan }) => {
  const s = useSec();
  const hide = plan.hide.reduce((h, [a, b]) => Math.max(h, Math.min(tw(s, [a, a + 0.35], [0, 1]), 1 - tw(s, [b, b + 0.35], [0, 1]))), 0);
  const k = tw(s, [plan.from, plan.from + 0.8], [0, 1], EXPO) * (1 - tw(s, [plan.to, plan.to + 0.5], [0, 1])) * (1 - hide);
  if (k <= 0) return null;
  let cur = 0;
  plan.ch.forEach(([, t], i) => {
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
      <div style={{ position: "absolute", right: 96, top: 40, display: "flex", gap: 4, padding: 5, borderRadius: 16, background: "rgba(255,255,255,0.78)", boxShadow: "0 10px 30px -18px rgba(0,2,48,0.3)" }}>
        {plan.ch.map(([l], i) => {
          const on = i === cur;
          return (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 13px", borderRadius: 11, background: on ? glow : "transparent", fontSize: 15.5, fontWeight: on ? 700 : 500, color: on ? C.ink : i < cur ? C.ink2 : C.faint, boxShadow: on ? "0 0 24px rgba(49,107,253,0.25)" : "none" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? C.blue : C.faint, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const v5 = s12of5;
