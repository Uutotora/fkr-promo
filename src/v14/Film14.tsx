import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import "../fonts";
import { C, FONT } from "../theme";
import { clamp01, easeInOut, easeOut, homography, lerpQuad, matrix3d, Quad, rectQuad } from "../v13/geom";
import { Cam, MoscowMap, project } from "../v13/MoscowMap";
import { Comet, Defs, mixHex, Objects, RouteLine } from "../v13/film/MapStage";
import { Mark13 } from "../v13/film/Logo13";
import { PLACES, ROUTES } from "../v13/film/places";
import { DROP, DURATION, f, MUSIC, S, Scene } from "./T14";
import { planCamera, Track, UIShot } from "./UIShot";
import { LiveInsert, quadAt, Track as ScreenTrack } from "../v13/film/Insert";
import { Edit, ProtoFrame } from "../v13/ProtoFrame";
import { BADGE, install, SIGNED } from "../v13/film/screens";
import L6 from "../v13/data/tracks/L6_approver.json";
import L7 from "../v13/data/tracks/L7_supplier.json";
import L9 from "../v13/data/tracks/L9_sign.json";
import u1t from "../../public/v14/u1_track.json";
import u2t from "../../public/v14/u2_track.json";
import u3t from "../../public/v14/u3_track.json";

export { DURATION };

/* ---------- helpers ---------- */

/** A Sequence by film seconds; inside it `useSec()` counts from `a`. Neighbouring
    spans overlap through their transitions. */
const Span: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => (
  <Sequence from={f(a)} durationInFrames={f(b) - f(a)}>
    {children}
  </Sequence>
);

const Clip: React.FC<{ src: string; startFrom?: number; rate?: number; style?: React.CSSProperties }> = ({ src, startFrom = 0, rate = 1, style }) => <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={rate} muted style={{ position: "absolute", width: 1920, height: 1080, ...style }} />;
// The Seedance clips are 298 frames and their spans a few frames longer: *_fit.mp4 are
// motion-interpolated to the exact span (a slower playbackRate would repeat frames).

/** local seconds inside a Span */
const useSec = () => useCurrentFrame() / 60;
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeIn3 = (t: number) => clamp01(t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoother = (x: number) => {
  const u = clamp01(x);
  return u * u * u * (u * (6 * u - 15) + 10);
};

/** Holds the clip's last frame past its end (decoders must not be asked beyond it). */
const Hold: React.FC<{ last: number; children: React.ReactNode }> = ({ last, children }) => {
  const fr = useCurrentFrame();
  return (
    <Freeze frame={last} active={fr > last}>
      {children}
    </Freeze>
  );
};

/** Directional (motion) blur for whip pans, as an SVG filter usable from CSS. */
const MotionBlur: React.FC<{ id: string; x?: number; y?: number }> = ({ id, x = 0, y = 0 }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} edgeMode="duplicate" />
      </filter>
    </defs>
  </svg>
);
const mb = (id: string, x: number, y: number) => (x + y > 0.4 ? `url(#${id})` : undefined);

/** A whip pan between a and a+d: e is the travel (strong ease), blur peaks mid-way. */
const whip = (film: number, a: number, d: number) => {
  const p = ramp(film, a, a + d);
  return { p, e: easeInOut(p), blur: 70 * Math.sin(Math.PI * p) ** 1.5 };
};

/** Lower-third chip, the prototype's ink colour; enters with a short rise. */
const Chip: React.FC<{ a: number; b: number; children: React.ReactNode; light?: boolean }> = ({ a, b, children, light }) => {
  const t = useSec();
  if (t < a - 0.05 || t > b + 0.05) return null;
  const k = easeOut(clamp01((t - a) / 0.35)) * (1 - easeInOut(clamp01((t - (b - 0.3)) / 0.3)));
  return <div style={{ position: "absolute", left: 96, bottom: 92, padding: "18px 28px 20px", borderRadius: 16, background: light ? "#fff" : C.ink, color: light ? C.ink : "#fff", fontFamily: FONT, fontSize: 40, fontWeight: 700, letterSpacing: -0.6, opacity: k, transform: `translateY(${(1 - k) * 18}px)`, whiteSpace: "nowrap" }}>{children}</div>;
};

/** Big number + line over the day map: ink type on a soft paper floor. Enters
    rising from below, leaves rising out, so consecutive titles read as one ticker. */
const MapTitle: React.FC<{ t: number; a: number; b: number; big: string; line: string }> = ({ t, a, b, big, line }) => {
  if (t < a - 0.02 || t > b + 0.02) return null;
  const i1 = easeOut(ramp(t, a, a + 0.4));
  const i2 = easeOut(ramp(t, a + 0.08, a + 0.48));
  const o = easeInOut(ramp(t, b - 0.28, b));
  return (
    <div style={{ position: "absolute", left: 120, bottom: 150, fontFamily: FONT, color: C.ink }}>
      <div style={{ fontSize: 176, fontWeight: 800, letterSpacing: -6, lineHeight: 1, fontVariantNumeric: "tabular-nums", opacity: i1 * (1 - o), transform: `translateY(${(1 - i1) * 60 - o * 50}px)` }}>{big}</div>
      <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -0.8, marginTop: 14, opacity: i2 * (1 - o), transform: `translateY(${(1 - i2) * 40 - o * 40}px)` }}>{line}</div>
    </div>
  );
};

/* ---------- 1. the call: live transcript beside her (left third of the frame) ---------- */

const LINES = [
  {
    who: "ИИ-ассистент ФКР",
    text: "Добрый день, чем я могу вам помочь?",
    a: 3.25,
    b: 5.15,
    ai: true,
  },
  {
    who: "Жительница",
    text: "Батареи не работают.",
    a: 5.6,
    b: 6.85,
    ai: false,
  },
  {
    who: "ИИ-ассистент ФКР",
    text: "Подскажите, где вы проживаете?",
    a: 8.55,
    b: 10.9,
    ai: true,
  },
];
const Transcript: React.FC = () => {
  const t = useSec();
  const head = easeOut(clamp01((t - 2.4) / 0.6));
  const out = 1 - easeInOut(clamp01((t - 11.6) / 0.5));
  const speaking = LINES.some((l) => t >= l.a && t <= l.b);
  return (
    <div style={{ position: "absolute", left: 92, top: 210, width: 600, fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#fff", opacity: head, transform: `translateY(${(1 - head) * 14}px)`, textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", height: 30 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const v = speaking ? 0.35 + 0.65 * Math.abs(Math.sin(t * (7 + i * 1.7) + i)) : 0.18;
            return <span key={i} style={{ width: 5, height: 30 * v, borderRadius: 3, background: "#fff" }} />;
          })}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>Звонок в ФКР · ИИ-ассистент</div>
      </div>
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 18 }}>
        {LINES.map((l, i) => {
          if (t < l.a - 0.15) return null;
          const k = easeOut(clamp01((t - (l.a - 0.15)) / 0.35));
          const n = Math.round(l.text.length * clamp01((t - l.a) / Math.max(0.4, l.b - l.a - 0.2)));
          return (
            <div key={i} style={{ alignSelf: l.ai ? "flex-start" : "flex-end", maxWidth: 560, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
              <div style={{ fontSize: 20, fontWeight: 650, color: "rgba(255,255,255,0.86)", marginBottom: 8, textAlign: l.ai ? "left" : "right", textShadow: "0 1px 10px rgba(0,0,0,0.35)" }}>{l.who}</div>
              <div style={{ background: l.ai ? "#fff" : C.orange, color: l.ai ? C.ink : "#fff", borderRadius: l.ai ? "22px 22px 22px 6px" : "22px 22px 6px 22px", padding: "20px 26px 22px", fontSize: 36, fontWeight: 650, letterSpacing: -0.5, lineHeight: 1.18 }}>
                {l.text.slice(0, n)}
                <span style={{ opacity: 0 }}>{l.text.slice(n)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- 2. the foreman; the camera leaves through the bright doorway behind him ---------- */

const DOOR: [number, number] = [1690, 600]; // the bright doorway right of him (L3, ~3.3 s)
const FOREMAN_END = 37.68;
/** The camera flies at the doorway: it grows and slides to the centre of the frame,
    its daylight floods the picture, and the map comes out of that light. */
const Foreman: React.FC = () => {
  const t = useSec();
  const p = ramp(t, 2.95, FOREMAN_END - S.foreman[0]);
  const g = p * p;
  const z = 1 + 7 * p ** 2.4;
  const c = smoother(ramp(t, 2.85, FOREMAN_END - S.foreman[0] - 0.12));
  // the doorway heads for the centre, but the plate always covers the frame
  const tx = Math.min(0, Math.max(1920 - 1920 * z, lerp(DOOR[0], 960, c) - DOOR[0] * z));
  const ty = Math.min(0, Math.max(1080 - 1080 * z, lerp(DOOR[1], 540, c) - DOOR[1] * z));
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})`, filter: p > 0 ? `brightness(${1 + 3.2 * g}) saturate(${1 - 0.6 * g}) blur(${6 * g}px)` : undefined }}>
      <Clip src="v13/live/L3_phone.mp4" />
    </AbsoluteFill>
  );
};

/* ---------- 3. the problems on one day map, ending in the ФКР mark ---------- */

const TRIPS = Object.keys(ROUTES).filter((k) => k.includes(">"));
const CITY = { lng: 37.617, lat: 55.742 };
const FUND = PLACES.fund;

const P0 = 37.45; // the map's camera starts here; it shows once the doorway's light fills the frame
const MARK = { a: 42.3, dive: 42.85, in: 43.45 }; // lockup draws, camera dives into window 1, facade fills the frame
const LOCK = 200; // mark height, px
const KW = LOCK / 56;
const DIVE_END = 1.2 * Math.max(1920 / (3 * KW), 1080 / (6 * KW));

/** The dive into the mark's first window: scale about the screen centre, where the
    window sits (the camera is centred on the Fund by then). */
const diveAt = (film: number) => {
  const u = easeInOut(ramp(film, MARK.dive, MARK.in));
  const s = Math.exp(Math.log(DIVE_END) * u);
  const w = 3.3 * KW * s;
  const h = 6.3 * KW * s;
  return { u, s, rect: { x: 960 - w / 2, y: 540 - h / 2, w, h } };
};

const problemsCam = (film: number): Cam => {
  const t = film - P0;
  const H0 = PLACES.house;
  if (film < MARK.a - 0.6) {
    const z = lerp(16.2, 10.05, smoother(t / 1.5)) + 0.18 * ramp(t, 1.5, 4.3);
    const c = smoother(ramp(t, 0.5, 1.6));
    return { lng: lerp(H0.lng, CITY.lng, c), lat: lerp(H0.lat, CITY.lat, c), zoom: z };
  }
  // glide to the Fund as its mark draws, then the parallax dive (the ground stays far below)
  const g = smoother(ramp(film, MARK.a - 0.6, MARK.dive));
  const z0 = 10.05 + 0.18 * ramp(MARK.a - 0.6 - P0, 1.5, 4.3);
  return { lng: lerp(CITY.lng, FUND.lng, g), lat: lerp(CITY.lat, FUND.lat, g), zoom: lerp(z0, 10.45, g) + 1.3 * easeIn3(ramp(film, MARK.dive, MARK.in)) };
};

const Problems: React.FC = () => {
  const t = useSec();
  const film = P0 + t;
  const cam = problemsCam(film);
  const show = easeInOut(ramp(film, P0 + 0.07, FOREMAN_END)); // out of the doorway's light
  const comets = 1 - ramp(film, 41.9, 42.5);
  const items: React.ReactNode[] = [];
  if (comets > 0) {
    TRIPS.forEach((key, i) => {
      for (let run = 0; run < 3; run++) {
        const u = (t - 1.0 - (i % 6) * 0.12 - run * 0.85) / 0.75;
        items.push(<Comet key={key + run} cam={cam} line={ROUTES[key]} u={u} tail={220} width={7} o={comets} />);
      }
    });
    for (let i = 0; i < 3; i++) {
      if (t > 1.0) items.push(<Comet key={"mkad" + i} cam={cam} line={ROUTES.mkad} u={((t - 1.0 - i * 0.6) / 2.4) % 1} tail={300} width={7} o={comets} />);
      if (t > 1.2) items.push(<Comet key={"ttk" + i} cam={cam} line={ROUTES.ttk} u={((t - 1.2 - i * 0.5) / 1.8) % 1} tail={220} width={6} o={comets} />);
    }
  }
  const d = diveAt(film);
  const [fx, fy] = project(cam, FUND.lng, FUND.lat);
  // the window's centre sits on the Fund; everything scales about it in the dive
  const wx = fx;
  const wy = fy;
  const markX = wx - 22.5 * KW;
  const markY = wy - 13 * KW;
  const draw = ramp(film, MARK.a, MARK.a + 0.45);
  const lit = ramp(film, MARK.a + 0.2, MARK.a + 0.55);
  const word = easeOut(ramp(film, MARK.a + 0.25, MARK.a + 0.6));
  return (
    <AbsoluteFill style={{ opacity: show }}>
      <MoscowMap cam={cam} day={1} labels={0.8} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        {items}
      </svg>
      {/* a paper floor under the titles */}
      <AbsoluteFill style={{ background: "linear-gradient(20deg, rgba(243,243,243,0.94) 0%, rgba(243,243,243,0.7) 32%, rgba(243,243,243,0) 58%)", opacity: comets }} />
      <MapTitle t={t} a={1.0} b={2.45} big="×3" line="рейса на объект вместо одного" />
      <MapTitle t={t} a={2.5} b={3.75} big="≈20" line="документов к приёмке — вручную" />
      <MapTitle t={t} a={3.8} b={MARK.a - P0 + 0.15} big="7,76 млрд ₽" line="в отчёте — при факте 6,1 млрд ₽" />
      {draw > 0 && (
        <AbsoluteFill style={{ transformOrigin: `${wx}px ${wy}px`, transform: `scale(${d.s})` }}>
          <div style={{ position: "absolute", left: markX, top: markY }}>
            <div style={{ display: "block", lineHeight: 0 }}>
              <Mark13 size={LOCK} draw={draw} lit={lit} />
            </div>
          </div>
          <div style={{ position: "absolute", left: markX + (LOCK * 44) / 56 + LOCK * 0.32, top: markY + LOCK * 0.17, fontFamily: FONT, color: C.logoInk, lineHeight: 0.95, clipPath: `inset(0 ${(1 - word) * 100}% 0 0)` }}>
            <div style={{ fontSize: LOCK * 0.42, fontWeight: 800 }}>ФКР</div>
            <div style={{ fontSize: LOCK * 0.39, fontWeight: 400, letterSpacing: 3 }}>МОСКВЫ</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 4. the facade: one shot, through the window on the drop ---------- */

const F0 = MARK.dive; // facade_ramp.mp4 frame 0
const RAMP_A = 44.75; // the speed ramp starts (tools/prep2.py)
const Facade: React.FC = () => {
  const t = useSec();
  const film = F0 + t;
  const d = diveAt(film);
  const inPortal = film < MARK.in;
  const inner = 1.35 - 0.35 * easeOut(d.u);
  const r = d.rect;
  const clip = inPortal ? `inset(${Math.max(0, r.y)}px ${Math.max(0, 1920 - r.x - r.w)}px ${Math.max(0, 1080 - r.y - r.h)}px ${Math.max(0, r.x)}px)` : undefined;
  // the tagline: rises in the music's break, then the camera rushes past it
  const k = easeOut(ramp(film, 43.55, 44.15));
  const fly = easeIn3(ramp(film, RAMP_A, RAMP_A + 0.5));
  return (
    <AbsoluteFill style={{ clipPath: clip, opacity: inPortal ? ramp(film, MARK.dive, MARK.dive + 0.12) : 1 }}>
      <AbsoluteFill style={{ transform: `scale(${inner})` }}>
        <Clip src="v14/facade_ramp.mp4" />
      </AbsoluteFill>
      {k > 0 && fly < 1 && (
        <AbsoluteFill style={{ transformOrigin: "960px 540px", transform: `scale(${1 + 1.4 * fly})`, opacity: 1 - fly, filter: fly > 0 ? `blur(${10 * fly}px)` : undefined }}>
          <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 46%)", opacity: k }} />
          <div style={{ position: "absolute", left: 120, bottom: 120, color: "#fff", fontFamily: FONT, fontSize: 84, fontWeight: 800, letterSpacing: -2.4, lineHeight: 1.02, textShadow: "0 2px 24px rgba(0,0,0,0.35)", opacity: k, transform: `translateY(${(1 - k) * 26}px)` }}>
            Единая система
            <br />
            капитального ремонта
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 5. Fund → contractor: the notification flies, the camera whips after it ---------- */

const WHIP1 = 60.25;
const PUSH_IN = 59.64;
const TABLET: [number, number] = [853, 815]; // T4's blank tablet screen, first frames
const PushFly: React.FC = () => {
  const t = useSec();
  const film = PUSH_IN + t;
  const k = easeOut(clamp01(t / 0.4));
  const m = easeInOut(ramp(film, WHIP1 - 0.04, WHIP1 + 0.42));
  const sink = ramp(film, WHIP1 + 0.4, WHIP1 + 0.62);
  if (sink >= 1) return null;
  const x0 = 1920 - 70 - 310;
  const y0 = 64 + 56;
  const x = lerp(x0, TABLET[0], m);
  const y = lerp(y0, TABLET[1], m * m * (3 - 2 * m) * 0.7 + m * 0.3) - (1 - k) * 40;
  const s = (1 - 0.56 * m) * (1 - 0.1 * sink);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 620, transform: `translate(-50%, -50%) rotate(${-4.5 * m}deg) scale(${s})`, padding: "22px 26px", borderRadius: 22, background: "rgba(255,255,255,0.97)", fontFamily: FONT, opacity: k * (1 - sink), boxShadow: `0 ${12 + 20 * m}px ${30 + 30 * m}px rgba(0,2,48,${0.16 + 0.1 * m})` }}>
      <div style={{ fontSize: 20, fontWeight: 650, color: C.muted }}>ФКР · подрядчику</div>
      <div style={{ fontSize: 30, fontWeight: 750, color: C.ink, marginTop: 6 }}>Пора подавать заявку на ТМЦ · Нагорная, 20 к4</div>
    </div>
  );
};

const U1: React.FC = () => {
  const film = S.u1[0] + useSec();
  const w = whip(film, WHIP1, 0.4);
  return (
    <AbsoluteFill style={{ transform: `translateX(${-1920 * w.e}px)`, filter: mb("w1o", w.blur, 0) }}>
      <MotionBlur id="w1o" x={w.blur} />
      <Hold last={447}>
        <UIShot src="v14/u1.mp4" track={u1t as Track} frames={448} zoom={1.75} settle={30} />
      </Hold>
    </AbsoluteFill>
  );
};

const T4: React.FC = () => {
  const fr = useCurrentFrame();
  const film = WHIP1 + fr / 60;
  const w = whip(film, WHIP1, 0.4);
  const pre = f(S.t4[0]) - f(WHIP1);
  return (
    <AbsoluteFill style={{ transform: `translateX(${1920 * (1 - w.e)}px)`, filter: mb("w1i", w.blur, 0) }}>
      <MotionBlur id="w1i" x={w.blur} />
      {fr < pre ? (
        <Freeze frame={0}>
          <Clip src="v14/T4_fit.mp4" />
        </Freeze>
      ) : (
        <Sequence from={pre}>
          <Clip src="v14/T4_fit.mp4" />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 6. out of the contractor's screen into the approver's monitor, and back in ---------- */

const ApproverScreen: React.FC = () => {
  const t = useSec();
  const k = ramp(t, 0.3, 0.6);
  return (
    <AbsoluteFill>
      <Img src={staticFile("v14/u2_last.jpg")} style={{ position: "absolute", width: 1920, height: 1080 }} />
      {k > 0 && <Img src={staticFile("v14/u3_f84.jpg")} style={{ position: "absolute", width: 1920, height: 1080, opacity: k }} />}
    </AbsoluteFill>
  );
};
const Approver: React.FC = () => {
  const t = useSec();
  const len = S.approver[1] - S.approver[0];
  const ep = t < len / 2 ? 1 - ramp(t, 0, 0.62) : ramp(t, len - 0.62, len);
  return <LiveInsert src="v13/live/L6_approver.mp4" start={0} from={60} track={L6 as ScreenTrack} ep={ep} ui={{ w: 1920, h: 1080, node: <ApproverScreen /> }} />;
};

/* ---------- 7. approver → supplier: the click on «Согласовать ТУ» opens the next shot ---------- */

const U3_FROM = 84;
const U3_N = 316; // through the click at recording frame 399
const U3_ZOOM = 1.7;
const U3_SETTLE = 24;
const CLICK = (() => {
  const tr = u3t as Track;
  const c = planCamera(tr, U3_FROM, U3_N, U3_ZOOM, U3_SETTLE, 0)[U3_N - 1];
  const [, x, y] = tr.frames[U3_FROM + U3_N - 1];
  const s = (1920 / tr.w) * c.z;
  return [960 + (x - c.x) * s, 540 + (y - c.y) * s] as [number, number];
})();
const IRIS = [S.u3[1], S.u3[1] + 0.55];
const IRIS_R =
  Math.max(
    ...[
      [0, 0],
      [1920, 0],
      [0, 1080],
      [1920, 1080],
    ].map(([x, y]) => Math.hypot(x - CLICK[0], y - CLICK[1])),
  ) + 40;

const Supplier: React.FC = () => {
  const t = useSec();
  const film = S.supplier[0] + t;
  const u = ramp(film, IRIS[0], IRIS[1]);
  const r = IRIS_R * (1 - (1 - u) ** 3);
  const w = whip(film, WHIP2, 0.4);
  const mask = u < 1 ? `radial-gradient(circle at ${CLICK[0]}px ${CLICK[1]}px, #000 ${Math.max(0, r - 28)}px, transparent ${r}px)` : undefined;
  return (
    <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, transform: `translateY(${1080 * w.e}px)`, filter: mb("w2o", 0, w.blur) }}>
      <MotionBlur id="w2o" y={w.blur} />
      <AbsoluteFill style={{ transformOrigin: `${CLICK[0]}px ${CLICK[1]}px`, transform: `scale(${1.12 - 0.12 * easeOut(u)})` }}>
        <LiveInsert src="v13/live/L7_supplier.mp4" start={0} track={L7 as ScreenTrack} ui={{ w: 1440, h: 900, node: <ProtoFrame snap="supplier_home" w={1440} h={900} /> }} />
      </AbsoluteFill>
      <Chip a={0.6} b={2.4}>
        Поставщик подтверждает дату
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------- 8. whip up over the warehouse: one trip on the day map, then a dive into the house ---------- */

const WHIP2 = 83.3;
const DIVE2 = [85.95, 87.12];
const Trip: React.FC = () => {
  const t = useSec();
  const film = WHIP2 + t;
  const S0 = PLACES.store;
  const H = PLACES.house;
  const mid = { lng: (S0.lng + H.lng) / 2, lat: (S0.lat + H.lat) / 2 };
  const up = smoother(ramp(t, 0.05, 1.55));
  const c = smoother(ramp(t, 0.35, 1.55));
  const dv = ramp(film, DIVE2[0], DIVE2[1]);
  const dc = smoother(ramp(film, DIVE2[0] - 0.2, DIVE2[0] + 0.6));
  const overlay = 1 - ramp(film, DIVE2[0] + 0.5, DIVE2[0] + 0.85);
  const cam: Cam = { lng: lerp(lerp(S0.lng, mid.lng, c), H.lng, dc), lat: lerp(lerp(S0.lat, mid.lat, c), H.lat, dc), zoom: lerp(14.4, 11.2, up) + 0.22 * ramp(t, 1.55, 2.65) + 5.8 * dv * dv };
  const w = whip(film, WHIP2, 0.4);
  const line = ROUTES["w_se>nagornaya"];
  const [hx, hy] = project(cam, H.lng, H.lat);
  const [sx, sy] = project(cam, S0.lng, S0.lat);
  const draw = easeInOut(ramp(t, 1.0, 2.6));
  return (
    <AbsoluteFill style={{ transform: `translateY(${-1080 * (1 - w.e)}px)`, filter: mb("w2i", 0, w.blur) }}>
      <MotionBlur id="w2i" y={w.blur} />
      <MoscowMap cam={cam} day={1} labels={0.8} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <RouteLine cam={cam} line={line} draw={draw} color={C.orange} width={6} o={0.6 * overlay} />
        <Comet cam={cam} line={line} u={(t - 1.05) / 1.75} tail={180} width={6} o={overlay} />
        {[
          [sx, sy, "Склад поставщика"],
          [hx, hy, "ул. Нагорная, 20 к4"],
        ].map(([x, y, label], i) => (
          <g key={i} transform={`translate(${x},${y})`} opacity={i === 1 ? 1 : overlay}>
            <rect x={-14} y={-14} width={28} height={28} rx={7} fill="#fff" />
            <rect x={-6} y={-6} width={12} height={12} rx={2.5} fill={C.orange} />
            <text x={24} y={8} fontFamily={FONT} fontWeight={700} fontSize={26} fill={C.ink} opacity={overlay}>
              {label as string}
            </text>
          </g>
        ))}
      </svg>
      <Chip a={1.3} b={2.95} light>
        Один рейс — по графику
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------- 9. the truck arrives; focus pulls to the foreman's tablet ---------- */

const RACK = [89.7, 90.1]; // the yard goes soft
const Truck: React.FC = () => {
  const t = useSec();
  const film = DIVE2[1] - 0.2 + t;
  const a = ramp(film, DIVE2[1] - 0.2, DIVE2[1] - 0.02);
  const settle = easeOut(ramp(film, DIVE2[1] - 0.2, DIVE2[1] + 0.9));
  const soft = easeIn3(ramp(film, RACK[0], RACK[1]));
  const blur = 6 * (1 - ramp(film, DIVE2[1] - 0.2, DIVE2[1] + 0.15)) + 18 * soft;
  return (
    <AbsoluteFill style={{ opacity: a, transform: `scale(${1 + 0.1 * settle + 0.04 * soft})`, filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
      <Clip src="v13/live/L8_truck.mp4" />
    </AbsoluteFill>
  );
};

/* ---------- 10. the signature; the signed act lifts off the tablet as the closed appeal ---------- */

/** M-15 on the foreman's tablet: both signatures arrive while he signs. */
const signedEdit: Edit = (doc, fr) => {
  install(doc, SIGNED);
  [0, 1].forEach((i) => {
    const el = doc.getElementById("sig" + i);
    if (el) el.innerHTML = fr >= 50 + i * 55 ? BADGE("Подписано · КЭП", "green") : BADGE("Ожидается подпись", "gray");
  });
};

/** The foreman's hand, keyed out of the plate, back in front of the tablet's screen. */
const HandOver: React.FC = () => {
  const i = Math.min(185, useCurrentFrame());
  return <Img src={staticFile(`v14/l9hand/${String(i).padStart(4, "0")}.webp`)} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }} />;
};

const SIGN0 = RACK[0] + 0.15; // L9 frame 0
const CARD = { x: 120, y: 300, w: 1680, h: 520 }; // the appeal's card
const LIFT = [92.5, 93.2];
const Sign: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / 60;
  const film = SIGN0 + t;
  const focus = easeOut(ramp(film, RACK[0] + 0.25, RACK[1] + 0.35));
  const a = ramp(film, RACK[0] + 0.25, RACK[0] + 0.4);
  const e = easeInOut(ramp(film, LIFT[0], LIFT[1]));
  const away = ramp(film, LIFT[0], LIFT[0] + 0.55);
  const plateBlur = 18 * (1 - focus) + 30 * easeIn3(away);
  const q = quadAt(L9 as ScreenTrack, Math.min(fr, 237));
  const cq = rectQuad(CARD.w, CARD.h, CARD.x, CARD.y);
  const quad = lerpQuad(q, cq, e) as Quad;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 - 0.04 * focus})`, filter: plateBlur > 0.1 ? `blur(${plateBlur}px)` : undefined }}>
        <LiveInsert src="v13/live/L9_sign.mp4" start={0} track={L9 as ScreenTrack} ui={{ w: 1180, h: 820, node: <ProtoFrame snap="c_home" w={1180} h={820} edit={signedEdit} /> }} />
        <AbsoluteFill style={{ opacity: 1 - ramp(film, LIFT[0] - 0.05, LIFT[0] + 0.25) }}>
          <HandOver />
        </AbsoluteFill>
      </AbsoluteFill>
      {film > LIFT[0] - 0.05 && (
        <>
          <AbsoluteFill style={{ background: "#F3F3F3", opacity: easeInOut(ramp(film, LIFT[0] + 0.1, LIFT[1])) }} />
          <AbsoluteFill style={{ opacity: ramp(film, LIFT[0] - 0.05, LIFT[0] + 0.12) }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: CARD.h, transformOrigin: "0 0", transform: matrix3d(homography(rectQuad(CARD.w, CARD.h), quad)), background: "#fff", borderRadius: 26 }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: 1180, height: 820, transformOrigin: "0 0", transform: matrix3d(homography(rectQuad(1180, 820), quad)), opacity: 1 - ramp(e, 0.12, 0.5), overflow: "hidden" }}>
              <ProtoFrame snap="c_home" w={1180} h={820} edit={signedEdit} />
            </div>
          </AbsoluteFill>
        </>
      )}
      {film < LIFT[0] && (
        <Chip a={0.5} b={2.5}>
          Приёмка — КЭП, без бумаги
        </Chip>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 11. the appeal, handled (closes the call that opened the film) ---------- */

const ROWS: [string, string][] = [
  ["Адрес", "ул. Нагорная, д. 20, корп. 4 — определён из разговора"],
  ["Причина", "замена радиаторов 2-го подъезда · капремонт 2026"],
  ["Случай", "гарантийный · М-15 подписан 20.10"],
  ["Исполнитель", "ООО «Городские системы» · срок 24.10"],
  ["Ответ жительнице", "«Подрядчик придёт 23.10. Мы сообщим о результате»"],
];
const PAN = [99.45, 100.35]; // the page pans down onto the city map
const Appeal: React.FC = () => {
  const t = useSec();
  const film = LIFT[1] + t;
  const k0 = easeOut(ramp(film, LIFT[1], LIFT[1] + 0.5));
  const p = ramp(film, PAN[0], PAN[1]);
  const pan = easeInOut(p);
  const vb = 16 * Math.sin(Math.PI * p);
  return (
    <AbsoluteFill style={{ background: "#F3F3F3" }}>
      <AbsoluteFill style={{ transform: `translateY(${-1080 * pan}px)`, filter: mb("panA", 0, vb) }}>
        <MotionBlur id="panA" y={vb} />
        <AbsoluteFill style={{ background: "#F3F3F3", fontFamily: FONT }}>
          <div style={{ position: "absolute", left: 120, top: 96, opacity: k0, transform: `translateY(${(1 - k0) * 20}px)` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.muted }}>Обращение жителя · принято ИИ-ассистентом</div>
            <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2.6, color: C.ink, marginTop: 10 }}>«Батареи не работают»</div>
          </div>
          {film >= LIFT[1] && (
            <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: "#fff", borderRadius: 26, padding: "10px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
              {ROWS.map(([k, v], i) => {
                const e = easeOut(ramp(t, 0.7 + i * 0.8, 1.15 + i * 0.8));
                return (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 30, opacity: e, transform: `translateX(${(1 - e) * -24}px)` }}>
                    <div style={{ width: 330, fontSize: 30, fontWeight: 600, color: C.muted }}>{k}</div>
                    <div style={{ fontSize: 38, fontWeight: 700, color: i === ROWS.length - 1 ? C.green : C.ink, letterSpacing: -0.5 }}>{v}</div>
                  </div>
                );
              })}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 12. effect: dusk over the city, its 1 800 objects light up, the numbers ---------- */

const NIGHT_CAM = { lng: 37.62, lat: 55.745 };
const EFFECT: {
  g: string;
  title: string;
  n: string;
  note?: string;
  d: number;
}[] = [
  {
    g: "Закупки",
    title: "8 млрд ₽ в год на материалы",
    n: "−10–12%",
    note: "одна витрина, лимиты по смете и договору",
    d: 3.22,
  },
  { g: "Закупки", title: "Экономия в год", n: "800–960 млн ₽", d: 3.05 },
  {
    g: "Доставка",
    title: "450 млн ₽ в год · −15–20%",
    n: "67,5–90 млн ₽",
    note: "поставка под готовность объекта, без повторных рейсов",
    d: 3.4,
  },
  { g: "Итого", title: "Экономия", n: "≈1 млрд ₽ в год", d: 3.05 },
  {
    g: "Время",
    title: "765 возвратов заявок на доработку",
    n: "1 419 чел.-ч",
    note: "проверка по смете и лимитам — до отправки",
    d: 3.4,
  },
  {
    g: "Время",
    title: "Цикл согласования",
    n: "−20–30%",
    note: "250–300 ч в год на сотрудника ≈ 1–1,5 часа в день",
    d: 3.4,
  },
  {
    g: "Люди",
    title: "−25–30% трудозатрат на охваченные операции",
    n: "2,5–3 ставки",
    note: "на каждые 10 человек · 100% объектов в аналитике",
    d: 3.73,
  },
];
const BEATS0 = 2.0; // effect-local second the first number lands
const TILT = [125.2, 126.3];
const Effect: React.FC = () => {
  const film = PAN[0] + useSec();
  const t = film - S.effect[0];
  const H0 = PLACES.house;
  const out = smoother(ramp(t, 0.25, 2.2));
  const c = smoother(ramp(t, 0.6, 2.2));
  const tp = easeInOut(ramp(film, TILT[0], TILT[1]));
  const cam: Cam = { lng: lerp(H0.lng, NIGHT_CAM.lng, c) + 0.01 * Math.sin(Math.max(0, t - 2.2) / 9), lat: lerp(H0.lat, NIGHT_CAM.lat, c), zoom: lerp(14.2, 9.7, out) + 0.45 * ramp(t, 2.2, 25.2) + 0.5 * tp };
  const day = 1 - easeInOut(ramp(t, 0.6, 2.4));
  const pan = easeInOut(ramp(film, PAN[0], PAN[1]));
  const p = ramp(film, PAN[0], PAN[1]);
  const vb = 16 * Math.sin(Math.PI * p);
  let acc = BEATS0;
  return (
    <AbsoluteFill style={{ background: film > PAN[1] ? "linear-gradient(180deg, #215d85 0%, #3a6585 14%, #4f687c 24%, #5b5c69 29%, #090C26 40%)" : undefined }}>
      <AbsoluteFill style={{ transform: `translateY(${1080 * (1 - pan)}px)`, filter: mb("panB", 0, vb) }}>
        <MotionBlur id="panB" y={vb} />
        <AbsoluteFill style={{ transformOrigin: "50% 100%", transform: tp > 0 ? `perspective(1600px) rotateX(${46 * tp}deg) scale(${1 + 0.9 * tp})` : undefined }}>
          <MoscowMap cam={cam} day={day} labels={0.35 + 0.45 * day} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <Defs />
            <Objects cam={cam} grow={ramp(t, 0.9, 3.0)} day={day} o={0.9} />
          </svg>
        </AbsoluteFill>
        {/* the page's paper runs on into the map */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #F3F3F3 0%, rgba(243,243,243,0) 22%)", opacity: 1 - ramp(film, PAN[1] - 0.1, PAN[1] + 0.5) }} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(9,12,38,0.86) 0%, rgba(9,12,38,0.55) 45%, rgba(9,12,38,0) 75%)", opacity: (1 - day) * (1 - tp) }} />
      </AbsoluteFill>
      {EFFECT.map((e, i) => {
        const a = acc;
        acc += e.d;
        const b = acc;
        if (t < a - 0.05 || t > b + 0.05) return null;
        const k = easeOut(clamp01((t - a) / 0.45));
        const o = 1 - easeInOut(clamp01((t - (b - 0.3)) / 0.3));
        return (
          <div key={i} style={{ position: "absolute", left: 120, top: 300, fontFamily: FONT, color: "#fff", opacity: o }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 5, color: C.orange, opacity: k }}>{e.g.toUpperCase()}</div>
            <div style={{ fontSize: 44, fontWeight: 650, marginTop: 16, opacity: k, letterSpacing: -0.6 }}>{e.title}</div>
            <div style={{ fontSize: 176, fontWeight: 800, letterSpacing: -6, lineHeight: 1.02, marginTop: 10, opacity: k, transform: `translateY(${(1 - k) * 34}px)`, fontVariantNumeric: "tabular-nums" }}>{e.n}</div>
            {e.note && <div style={{ fontSize: 32, fontWeight: 550, color: "rgba(255,255,255,0.75)", marginTop: 18, opacity: easeOut(clamp01((t - a - 0.3) / 0.45)) }}>{e.note}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- finale: the evening city folds into the mark's first window ---------- */

const CODA0 = 125.85;
const EndCard: React.FC = () => {
  const t = useSec();
  const film = CODA0 + t;
  const fold = easeInOut(clamp01((t - 4.4) / 1.6));
  const size = 230;
  const k = size / 56;
  const mx = 960 - (size * 44) / 56 / 2 - 260;
  const my = 330;
  const win = { x: mx + 21 * k, y: my + 10 * k, w: 3 * k, h: 6 * k };
  const r = { x: win.x * fold, y: win.y * fold, w: 1920 + (win.w - 1920) * fold, h: 1080 + (win.h - 1080) * fold };
  const s = Math.max(r.w / 1920, r.h / 1080);
  // arrives from the tilted map: the real city's lights take over the objects' dots
  const a = ramp(film, CODA0, TILT[1] - 0.05);
  const settle = 1.06 - 0.06 * easeOut(ramp(film, CODA0, CODA0 + 1.2));
  return (
    <AbsoluteFill style={{ background: fold > 0 ? "#fff" : undefined, opacity: a }}>
      {fold > 0 && (
        <div style={{ position: "absolute", left: mx, top: my, display: "flex", alignItems: "center", gap: size * 0.32 }}>
          <Mark13 size={size} draw={easeInOut(clamp01((t - 5.3) / 1.2))} lit={clamp01((t - 5.9) / 0.9)} />
          <div style={{ fontFamily: FONT, color: C.logoInk, lineHeight: 0.95, clipPath: `inset(0 ${(1 - easeOut(clamp01((t - 6.0) / 0.8))) * 100}% 0 0)` }}>
            <div style={{ fontSize: size * 0.42, fontWeight: 800 }}>ФКР</div>
            <div style={{ fontSize: size * 0.39, fontWeight: 400, letterSpacing: 3 }}>МОСКВЫ</div>
          </div>
        </div>
      )}
      {fold > 0 && <div style={{ position: "absolute", left: mx, top: my + size + 60, fontFamily: FONT, fontSize: 50, fontWeight: 750, letterSpacing: -1, color: C.ink, opacity: easeOut(clamp01((t - 6.6) / 0.6)) }}>Единая система капитального ремонта</div>}
      <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, overflow: "hidden", borderRadius: 2 + 16 * Math.sin(Math.PI * fold), background: C.orangeLogo }}>
        <div style={{ position: "absolute", left: (r.w - 1920 * s) / 2, top: (r.h - 1080 * s) / 2, width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${s})`, opacity: 1 - clamp01((t - 5.6) / 0.4) }}>
          {t < 6.1 && (
            <AbsoluteFill style={{ transform: `scale(${settle})` }}>
              <Clip src="v13/live/L11_evening_s85.mp4" />
            </AbsoluteFill>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound effects: real clicks and the camera's moves ---------- */

const clicksOf = (t: Track, scene: Scene, from = 0, frames = 1e9) => t.frames.filter(([fr, , , c]) => c && fr >= from && fr < from + frames).map(([fr]) => S[scene][0] + (fr - from) / 60);
const CLICKS = [...clicksOf(u1t as Track, "u1", 0, 448), ...clicksOf(u2t as Track, "u2", 0, 457), ...clicksOf(u3t as Track, "u3", U3_FROM, U3_N)];
const AIR: [number, string, number][] = [
  [S.t1[0] + 1.6, "whoosh_a", 0.22],
  [S.t2[0] + 1.4, "whoosh_a", 0.26],
  [37.05, "whoosh_a", 0.3], // through the doorway
  [MARK.dive - 0.1, "push_a", 0.26], // into the mark's window
  [RAMP_A, "whoosh_a", 0.3], // through the facade window, onto the drop
  [S.t3[0] + 2.4, "push_a", 0.18],
  [WHIP1 - 0.12, "whoosh_a", 0.3],
  [S.t4[0] + 2.6, "push_a", 0.18],
  [S.approver[0], "push_a", 0.14],
  [S.approver[1] - 0.6, "push_a", 0.16],
  [WHIP2 - 0.12, "whoosh_a", 0.3],
  [DIVE2[0] + 0.2, "push_a", 0.22],
  [LIFT[0], "push_a", 0.14],
  [PAN[0], "whoosh_a", 0.16],
  [TILT[0], "whoosh_a", 0.24],
];
const Sfx: React.FC = () => (
  <>
    {CLICKS.map((t, i) => (
      <Sequence key={"c" + i} from={f(t - 0.09)} durationInFrames={30}>
        <Audio src={staticFile("v14/sfx/click_a.mp3")} volume={0.32} />
      </Sequence>
    ))}
    {AIR.map(([t, name, v], i) => (
      <Sequence key={"a" + i} from={f(t)} durationInFrames={120}>
        <Audio src={staticFile(`v14/sfx/${name}.mp3`)} volume={v} />
      </Sequence>
    ))}
  </>
);

/* ---------- the film ---------- */

export const Film14: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / 60;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      {/* sound: one piece of music + the call's voices */}
      <Sequence from={f(MUSIC)}>
        <Audio src={staticFile("v14/music.wav")} volume={(fr) => 0.9 * clamp01(fr / 90)} />
      </Sequence>
      <Audio src={staticFile("v14/resident_voice.wav")} volume={1} />
      <Sfx />

      <Span a={S.call[0]} b={S.call[1]}>
        <Clip src="v14/resident.mp4" />
        <Transcript />
      </Span>
      <Span a={S.t1[0]} b={S.t1[1]}>
        <Clip src="v14/T1_fit.mp4" />
      </Span>
      <Span a={S.drone[0]} b={S.drone[1]}>
        <Clip src="v14/opening_fit.mp4" />
        <DroneTitles />
      </Span>
      <Span a={S.t2[0]} b={S.t2[1]}>
        <Clip src="v14/T2_fit.mp4" />
      </Span>
      <Span a={S.foreman[0]} b={FOREMAN_END}>
        <Foreman />
        <Chip a={0.25} b={3.0}>
          Где поставка? Обзвоном — по трём таблицам
        </Chip>
      </Span>
      {/* the map comes out of the doorway's light, so it sits above the foreman */}
      <Span a={P0} b={MARK.in}>
        <Problems />
      </Span>
      <Span a={F0} b={S.facade[1]}>
        <Facade />
      </Span>
      <Span a={S.t3[0]} b={S.t3[1]}>
        <Clip src="v14/T3_fit.mp4" />
      </Span>
      <Span a={S.u1[0]} b={WHIP1 + 0.4}>
        <U1 />
        <Chip a={0.6} b={3.3}>
          Вся программа — на одном экране
        </Chip>
        <Chip a={4.1} b={6.9}>
          Каждый дом — одна карточка
        </Chip>
      </Span>
      <Span a={WHIP1} b={S.t4[1]}>
        <T4 />
      </Span>
      <Span a={PUSH_IN} b={WHIP1 + 0.65}>
        <PushFly />
      </Span>
      <Span a={S.u2[0]} b={S.u2[1]}>
        <UIShot src="v14/u2.mp4" track={u2t as Track} frames={457} zoom={1.8} settle={30} out={40} />
        <Chip a={0.5} b={2.6}>
          Подрядчик подаёт заявку прямо с объекта
        </Chip>
        <Chip a={3.0} b={6.7}>
          Система сверяет со сметой и лимитами — до отправки
        </Chip>
      </Span>
      <Span a={S.approver[0]} b={S.approver[1]}>
        <Approver />
        <Chip a={0.6} b={1.65}>
          ТУ ГАУ проверяет правки
        </Chip>
      </Span>
      <Span a={S.u3[0]} b={IRIS[1]}>
        <Hold last={U3_N - 1}>
          <UIShot src="v14/u3.mp4" track={u3t as Track} from={U3_FROM} frames={U3_N} zoom={U3_ZOOM} settle={U3_SETTLE} />
        </Hold>
        <Chip a={0.5} b={4.9}>
          Что изменено и кем — видно сразу
        </Chip>
      </Span>
      <Span a={S.supplier[0]} b={WHIP2 + 0.4}>
        <Supplier />
      </Span>
      <Span a={WHIP2} b={DIVE2[1] + 0.05}>
        <Trip />
      </Span>
      <Span a={DIVE2[1] - 0.2} b={RACK[1] + 0.3}>
        <Truck />
      </Span>
      <Span a={SIGN0} b={LIFT[1] + 0.02}>
        <Sign />
      </Span>
      {/* the appeal sits under the lifting card until the card lands */}
      <Span a={LIFT[1]} b={PAN[1]}>
        <Appeal />
      </Span>
      <Span a={PAN[0]} b={TILT[1] + 0.05}>
        <Effect />
      </Span>
      <Span a={CODA0} b={S.coda[1]}>
        <EndCard />
      </Span>
      {/* fade up from black at the very start */}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - clamp01(sec / 0.8), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/* ---------- the drone's titles (district → house) ---------- */

const droneTitle = (t: number, a: number, b: number, line: string, big?: string) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const k1 = easeOut(clamp01((t - a) / 0.6));
  const k2 = easeOut(clamp01((t - a - 0.15) / 0.6));
  const out = 1 - easeInOut(clamp01((t - (b - 0.4)) / 0.4));
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 46%)", opacity: k1 }} />
      <div style={{ position: "absolute", left: 120, bottom: 120, color: "#fff", fontFamily: FONT, textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}>
        {big && <div style={{ fontSize: 168, fontWeight: 800, letterSpacing: -6, lineHeight: 1, opacity: k1, transform: `translateY(${(1 - k1) * 30}px)`, fontVariantNumeric: "tabular-nums" }}>{big}</div>}
        <div style={{ fontSize: big ? 46 : 76, fontWeight: big ? 650 : 800, letterSpacing: big ? -0.6 : -2.2, marginTop: big ? 16 : 0, opacity: k2, transform: `translateY(${(1 - k2) * 20}px)` }}>{line}</div>
      </div>
    </AbsoluteFill>
  );
};
const DroneTitles: React.FC = () => {
  const t = useSec();
  return (
    <>
      {droneTitle(t, 0.5, 4.0, "Капитальный ремонт в Москве")}
      {droneTitle(t, 4.3, 7.6, "объектов · 12 000 инженерных систем", "1 800")}
      <Chip a={8.2} b={11.8} light>
        ул. Нагорная, д. 20, корп. 4
      </Chip>
    </>
  );
};
