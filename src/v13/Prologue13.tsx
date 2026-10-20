import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import "../fonts";
import { C, FONT } from "../theme";
import { OldDesktop } from "./OldDesktop";
import { Quad, clamp01, easeInOut, easeOut, homography, lerpQuad, matrix3d, ramp, rectQuad } from "./geom";
import track from "./p4track.json";

/** v13 prologue draft: dawn over the city → roof repair → one lit office window →
    through the glass to the specialist's monitor → into the screen, where
    «как сейчас» begins. Live plates are Kling 2.5 drafts at 24 fps, interpolated
    to 60 fps and upscaled to 1080p before they get here. */

export const PROLOGUE13_FRAMES = 1500;
const W = 1920;
const H = 1080;
const FULL = rectQuad(W, H);

// Timeline (60 fps).
const P1 = { from: 0, dur: 352, rate: 0.85 };
const P2 = { from: 350, dur: 352, rate: 0.85 };
const P3 = { from: 700, dur: 306, rate: 0.98 };
const WIN = { a: 928, b: 1006 }; // flight through the lit window
const P4 = { from: WIN.a, dur: 326, rate: 0.92 };
const PUSH = { a: 1158, b: 1250 }; // into the screen until it fills the frame
const ACT1 = 1248;

// The lit window in P3's last frame (1080p coordinates) and the point of the room
// that sits behind it when we first look in (between her shoulder and the monitor).
const LIT = { x: 909, y: 645, w: 171, h: 190 };
const LIT_C: [number, number] = [LIT.x + LIT.w / 2, LIT.y + LIT.h / 2];
const ROOM_C: [number, number] = [1060, 520];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The specialist's pointer on the monitor: drifts with her hand, then settles on
    the request's «Материал» field and clicks in the first beat of «как сейчас». */
const POINTER_KEYS: [number, number, number][] = [
  [P4.from, 1280, 760],
  [P4.from + 120, 1180, 690],
  [P4.from + 300, 640, 360],
  [ACT1 + 100, 560, 352],
];
const CLICK = ACT1 + 128;
const pointerAt = (f: number): [number, number] => {
  const k = POINTER_KEYS;
  if (f <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 0; i < k.length - 1; i++) {
    if (f <= k[i + 1][0]) {
      const u = easeInOut((f - k[i][0]) / (k[i + 1][0] - k[i][0]));
      return [lerp(k[i][1], k[i + 1][1], u), lerp(k[i][2], k[i + 1][2], u)];
    }
  }
  const last = k[k.length - 1];
  // a resting hand never quite freezes
  return [last[1] + Math.sin(f / 37) * 1.5, last[2] + Math.cos(f / 43) * 1.2];
};
const pressAt = (f: number) => clamp01(1 - Math.abs(f - CLICK) / 7);

/** Tracked screen quad in 1080p coordinates for a P4-local frame. */
const screenQuad = (local: number): Quad => {
  const corners = track.corners as number[][][];
  const src = (local / 60) * P4.rate * track.fps;
  const i = Math.max(0, Math.min(corners.length - 1, Math.floor(src)));
  const j = Math.min(corners.length - 1, i + 1);
  const u = clamp01(src - i);
  const k = W / track.w;
  return corners[i].map((p, n) => [lerp(p[0], corners[j][n][0], u) * k, lerp(p[1], corners[j][n][1], u) * k]) as Quad;
};

const Plate: React.FC<{ src: string; rate: number; style?: React.CSSProperties }> = ({ src, rate, style }) => (
  <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{ position: "absolute", width: W, height: H, ...style }} />
);

/** Soft photographic vignette so white supers read over bright skies. */
const Vignette: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(120% 90% at 30% 35%, rgba(0,0,0,0) 55%, rgba(0,4,24,0.42) 100%)",
      opacity: o,
    }}
  />
);

/** A big number and its caption, set like the rest of the film: Onest 800, tight. */
const Super: React.FC<{ n: string; cap: string; a: number; b: number }> = ({ n, cap, a, b }) => {
  const f = useCurrentFrame();
  const inn = easeOut(ramp(f, a, a + 42));
  const inn2 = easeOut(ramp(f, a + 10, a + 52));
  const out = 1 - easeInOut(ramp(f, b - 30, b));
  if (f < a - 1 || f > b + 1) return null;
  const shadow = "0 2px 24px rgba(0,4,30,0.35)";
  return (
    <div style={{ position: "absolute", left: 128, bottom: 150, color: "#fff", fontFamily: FONT, opacity: out }}>
      <div
        style={{
          fontSize: 148,
          fontWeight: 800,
          letterSpacing: -5,
          lineHeight: 1,
          opacity: inn,
          transform: `translateY(${(1 - inn) * 26}px)`,
          textShadow: shadow,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 650,
          letterSpacing: -0.6,
          marginTop: 14,
          opacity: inn2,
          transform: `translateY(${(1 - inn2) * 18}px)`,
          textShadow: shadow,
        }}
      >
        {cap}
      </div>
    </div>
  );
};

/** P3 with the camera's final flight into the lit window (geometric zoom). */
const WindowFlight: React.FC = () => {
  const f = useCurrentFrame() + P3.from;
  const e = easeInOut(ramp(f, WIN.a, WIN.b));
  const S = 11.8;
  const s = Math.pow(S, e);
  const cx = lerp(LIT_C[0], W / 2, e);
  const cy = lerp(LIT_C[1], H / 2, e);
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${cx}px,${cy}px) scale(${s}) translate(${-LIT_C[0]}px,${-LIT_C[1]}px)` }}>
      <Plate src="v13/P3.mp4" rate={P3.rate} />
    </AbsoluteFill>
  );
};

/** P4: seen through the window first, then the push into the monitor. The
    interface lives on the screen through a tracked homography and inherits the
    screen's light; at the end of the push it is exactly the full frame. */
const Office: React.FC = () => {
  const local = useCurrentFrame();
  const f = local + P4.from;

  // Through-the-window reveal: clip to the growing window, room settles to 1:1.
  const ew = easeInOut(ramp(f, WIN.a, WIN.b));
  const s = Math.pow(11.8, ew);
  const cx = lerp(LIT_C[0], W / 2, ew);
  const cy = lerp(LIT_C[1], H / 2, ew);
  const wx = (x: number) => cx + (x - LIT_C[0]) * s;
  const wy = (y: number) => cy + (y - LIT_C[1]) * s;
  const clip =
    ew < 1
      ? `polygon(${wx(LIT.x)}px ${wy(LIT.y)}px, ${wx(LIT.x + LIT.w)}px ${wy(LIT.y)}px, ${wx(LIT.x + LIT.w)}px ${wy(LIT.y + LIT.h)}px, ${wx(LIT.x)}px ${wy(LIT.y + LIT.h)}px)`
      : undefined;
  // At first the whole room fits the window; it grows to 1:1 as we pass the glass.
  const k0 = 0.2;
  const k = lerp(k0, 1, ew);
  const tx = lerp(LIT_C[0] - ROOM_C[0] * k0, 0, ew);
  const ty = lerp(LIT_C[1] - ROOM_C[1] * k0, 0, ew);
  // From the street the room glows warm and the glass carries a sheen; both
  // clear as the camera passes through.
  const outside = 1 - ew;

  // Push into the screen.
  const q = screenQuad(local);
  const ep = easeInOut(ramp(f, PUSH.a, PUSH.b));
  const cam = homography(q, lerpQuad(q, FULL, ep));
  const ui = homography(FULL, q);
  const screenClip = `polygon(${q.map((p) => `${p[0]}px ${p[1]}px`).join(",")})`;
  const settle = 1 - ep;

  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx}px,${ty}px) scale(${k})` }}>
        <AbsoluteFill style={{ transformOrigin: "0 0", transform: matrix3d(cam) }}>
          <Plate src="v13/P4.mp4" rate={P4.rate} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: H,
              transformOrigin: "0 0",
              transform: matrix3d(ui),
              filter: `blur(${0.5 * settle}px) contrast(${1 - 0.06 * settle})`,
            }}
          >
            <OldDesktop cursor={pointerAt(f)} />
          </div>
          {/* the screen's own light falloff, multiplied over the interface */}
          <AbsoluteFill style={{ clipPath: screenClip, mixBlendMode: "multiply", opacity: 0.9 * settle }}>
            <Plate src="v13/P4.mp4" rate={P4.rate} style={{ filter: "brightness(1.16) saturate(0.6)" }} />
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
      {outside > 0 && (
        <>
          <AbsoluteFill style={{ background: "#FFB45C", mixBlendMode: "multiply", opacity: 0.55 * outside }} />
          <AbsoluteFill
            style={{
              background: "linear-gradient(118deg, rgba(255,255,255,0) 30%, rgba(255,244,228,0.5) 46%, rgba(255,255,255,0) 60%)",
              opacity: 0.6 * outside,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

/** First beat of «как сейчас», flat and full frame. */
const Act1Open: React.FC = () => {
  const local = useCurrentFrame();
  const t = easeOut(ramp(local, 40, 90));
  const lift = easeInOut(ramp(local, 130, 180));
  const f = local + ACT1;
  return (
    <AbsoluteFill>
      <OldDesktop lift={lift} cursor={pointerAt(f)} press={pressAt(f)} />
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 64,
          fontFamily: FONT,
          fontSize: 58,
          fontWeight: 800,
          letterSpacing: -1.6,
          color: C.ink,
          opacity: t,
          transform: `translateY(${(1 - t) * 18}px)`,
        }}
      >
        Как это работает сейчас
      </div>
    </AbsoluteFill>
  );
};

export const Prologue13: React.FC = () => {
  const f = useCurrentFrame();
  const scene = (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Sequence from={P1.from} durationInFrames={P1.dur}>
        <Plate src="v13/P1.mp4" rate={P1.rate} />
        <Vignette />
      </Sequence>
      <Sequence from={P2.from} durationInFrames={P2.dur}>
        <Plate src="v13/P2.mp4" rate={P2.rate} />
        <Vignette />
      </Sequence>
      <Sequence from={P3.from} durationInFrames={P3.dur}>
        <WindowFlight />
      </Sequence>
      <Sequence from={P4.from} durationInFrames={P4.dur}>
        <Office />
      </Sequence>
      <Sequence from={ACT1} durationInFrames={PROLOGUE13_FRAMES - ACT1}>
        <Act1Open />
      </Sequence>
      <Super n="1 800" cap="объектов капитального ремонта" a={70} b={330} />
      <Super n="12 000" cap="инженерных систем в работе" a={420} b={680} />
    </AbsoluteFill>
  );
  // The flight through the glass is the only fast move: give it a real shutter.
  return f >= WIN.a - 2 && f <= WIN.b + 2 ? (
    <CameraMotionBlur samples={10} shutterAngle={200}>
      {scene}
    </CameraMotionBlur>
  ) : (
    scene
  );
};
