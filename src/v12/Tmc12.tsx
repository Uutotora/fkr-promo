import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, glow } from "../theme";
import { EXPO, IN, INOUT, OUT, TL, pop, tw, useSec } from "../lib";
import { AppWindow, HOME, Stage3D, focus, poseAt, type Pose } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { TmcForm, QTY, SEND } from "../screens/TmcForm";
import { Chip } from "../screens/Dashboard";
import { Eyebrow, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { Caption } from "../scenes/S5Objects";
import { ICheck, IAlert, IFile, ISign } from "../components/Icons";
import { LogoMark } from "../components/Logo";

import { TmcRegistry } from "../scenes/S7Tmc";

/** v12: after the route the system reminds everyone of the next step (pushes), then the last node becomes the AI input. */
export const PUSHES = { at: 55.0, end: 60.4 };
const EXT = PUSHES.end - PUSHES.at; // seconds added to the v9 route

const STEPS = [
  { who: "Подрядчик", what: "Заявка направлена" },
  { who: "ТУ ГАУ", what: "Проверка заявки" },
  { who: "УРО ГАУ", what: "Согласование" },
  { who: "Экономист ФКР", what: "Формирование ЗПМ" },
  { who: "Диадок", what: "Подписи сторон" },
];

const Route: React.FC = () => {
  const s = useSec();
  const t = TL.tmc;
  const enter = tw(s, [t.route, t.route + 0.7], [0, 1], EXPO);
  const stepAt = [t.route + 0.3, ...t.steps];
  const W = 1500;
  const gap = W / (STEPS.length - 1);
  const fill = (() => {
    let v = 0;
    for (let i = 1; i < STEPS.length; i++) v += tw(s, [stepAt[i] - 0.45, stepAt[i]], [0, 1], INOUT);
    return v;
  })();
  const out = tw(s, [55.85 + EXT, 56.3 + EXT], [0, 1], IN);
  const hdr = 1 - tw(s, [PUSHES.at + 0.05, PUSHES.at + 0.45], [0, 1], IN);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: enter * (1 - out) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: hdr }}>
        <Eyebrow n="04" label="Учёт ТМЦ · заявка З-2026-0201" at={t.route + 0.1} />
        <Rise text="Маршрут согласования виден всем сторонам" at={t.route + 0.2} size={62} weight={780} highlight={["виден"]} />
      </div>
      <Pushes />
      <div style={{ position: "absolute", left: 210, top: 470, width: W, height: 300, scale: String(0.94 + 0.06 * enter) }}>
        <div style={{ position: "absolute", left: 0, top: 38, width: W, height: 6, borderRadius: 99, background: "#E4E7F0" }} />
        <div style={{ position: "absolute", left: 0, top: 38, width: gap * fill, height: 6, borderRadius: 99, background: C.blue, boxShadow: "0 0 18px rgba(49,107,253,0.45)" }} />
        {/* the request itself: a point of light running from desk to desk */}
        {fill > 0.02 && fill < STEPS.length - 1.02 && (
          <div style={{ position: "absolute", left: gap * fill, top: 41, width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -60, top: -60, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(49,107,253,0.5), rgba(49,107,253,0))" }} />
            <div style={{ position: "absolute", left: -8, top: -8, width: 16, height: 16, borderRadius: 99, background: "#fff", boxShadow: `0 0 0 4px ${C.blue}, 0 0 20px rgba(49,107,253,0.9)` }} />
          </div>
        )}
        {STEPS.map((st, i) => {
          const done = s >= stepAt[i] + (i === STEPS.length - 1 ? 99 : 0);
          const current = !done && (i === 0 || s >= stepAt[i]);
          const reach = tw(s, [stepAt[i], stepAt[i] + 0.4], [0, 1], EXPO);
          const p = pop(s, stepAt[i], 0.5);
          const ring = 0.5 + 0.5 * Math.sin(s * 6);
          return (
            <div key={st.who} style={{ position: "absolute", left: i * gap, top: 0, width: 0 }}>
              <div style={{ position: "absolute", left: -41, top: 0, width: 82, height: 82, display: "grid", placeItems: "center" }}>
                {current && reach > 0 && (
                  <div style={{ position: "absolute", inset: -22 - ring * 6, borderRadius: 99, background: "radial-gradient(closest-side, rgba(49,107,253,0.35), rgba(49,107,253,0))" }} />
                )}
                <div
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: 99,
                    display: "grid",
                    placeItems: "center",
                    background: done && reach > 0 ? C.blue : "#fff",
                    boxShadow: current && reach > 0 ? `inset 0 0 0 6px ${C.blue}` : done ? "0 14px 30px -12px rgba(49,107,253,0.7)" : `inset 0 0 0 3px #DDE1EC`,
                    scale: String(reach > 0 ? 0.7 + 0.3 * Math.max(p, 0.2) : 0.7),
                  }}
                >
                  {done && reach > 0 ? <ICheck size={38} color="#fff" stroke={3} /> : <div style={{ width: 16, height: 16, borderRadius: 99, background: reach > 0 ? C.blue : "#DDE1EC" }} />}
                </div>
              </div>
              <div style={{ position: "absolute", left: -160, width: 320, top: 112, textAlign: "center", opacity: 0.35 + 0.65 * reach }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>{st.who}</div>
                <div style={{ fontSize: 22, color: C.muted, marginTop: 6 }}>{st.what}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, marginTop: 8, opacity: reach, fontVariantNumeric: "tabular-nums" }}>{["12:38", "12:41", "12:46", "12:52", "19:13"][i]}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* deviation travels with the request */}
      <div
        style={{
          position: "absolute",
          left: 210 + gap * Math.min(fill, STEPS.length - 1.6),
          top: 760,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px",
          borderRadius: 14,
          background: C.orange50,
          color: "#c4520f",
          fontSize: 21,
          fontWeight: 750,
          whiteSpace: "nowrap",
          opacity: tw(s, [t.steps[0], t.steps[0] + 0.4], [0, 1]),
          translate: "-50% 0",
        }}
      >
        <IAlert size={21} color="#c4520f" /> Отклонение от сметы подтверждено: 100 / 10 шт.
      </div>
    </AbsoluteFill>
  );
};

/** fromSheet: the window arrives flat where the «Смета» sheet opened, then tilts home. */
export const Tmc12: React.FC<{ fromSheet?: boolean }> = ({ fromSheet = true }) => {
  const s = useSec();
  const t = TL.tmc;
  const keys: [number, Pose][] = [
    fromSheet ? [46.2, { x: 1240, y: 590, s: 0.66, rx: 0, ry: 0 }] : [46.2, { ...HOME, x: 3000, ry: -30, blur: 30 }],
    [46.8, { ...HOME }],
    [47.3, { ...HOME, s: 0.69, x: 1230 }],
    [47.95, focus(790, 520, 1.42)],
    [49.4, focus(800, 560, 1.45)],
    [50.1, focus(860, 640, 1.2)],
    [50.6, focus(860, 640, 1.18)],
    [51.3, { x: 960, y: 1500, s: 0.6, rx: 30, ry: 0, o: 0, blur: 10 }],
  ];
  const pose = poseAt(s, keys, (x) => (s < 46.8 ? OUT(x) : INOUT(x)));
  const blank = fromSheet ? 1 - tw(s, [46.2, 46.5], [0, 1]) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage glowX={0.45} />
      <div style={{ position: "absolute", left: 96, top: 340, width: 560, opacity: s < 50 ? 1 : 0 }}>
        <Eyebrow n="04" label="Учёт ТМЦ" at={46.4} out={47.75} />
        <div style={{ height: 26 }} />
        <Rise text={"Заявка сверяется\nсо сметой сразу"} at={46.5} out={47.7} size={66} weight={780} highlight={["со", "сметой"]} />
      </div>
      {s < 51.4 && (
        <Stage3D pose={pose}>
          <AppWindow nav="tmc" tmcSub="Заявки и поставки" role="Подрядчик" roleSub="Подрядная организация" tabs={[{ id: "r", label: "Заявки и поставки", icon: "package", active: true }]} overlay={<TmcForm at={46.35} qtyClick={t.clickQty} type={t.type} limit={t.limit} reasonAt={49.35} sendPress={t.clickSend} />}>
            <TmcRegistry />
          </AppWindow>
          {blank > 0 && <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: C.bg, opacity: blank }} />}
          <div style={{ position: "absolute", inset: 0 }}>
            <Cursor
              keys={[
                [46.8, 1150, 760],
                [47.45, QTY.x, QTY.y],
                [48.8, QTY.x + 6, QTY.y + 4],
                [49.4, 640, 690],
                [50.25, SEND.x, SEND.y],
              ]}
              clicks={[t.clickQty, 49.45, t.clickSend]}
              scale={1 / pose.s}
              show={[46.7, 50.9]}
            />
          </div>
        </Stage3D>
      )}
      {/* the guard: the request against the estimate, side by side */}
      {s > t.limit && s < 51 && (() => {
        const k = tw(s, [t.limit + 0.08, t.limit + 0.7], [0, 1], EXPO);
        const o = tw(s, [49.25, 49.6], [0, 1], IN);
        const p = pop(s, t.limit + 0.1, 0.6);
        return (
          <div style={{ position: "absolute", left: 1150, top: 720, transformOrigin: "0% 50%", scale: String((0.7 + 0.3 * Math.max(0, p)) * (1 - o * 0.08)), opacity: Math.min(1, k * 1.6) * (1 - o), padding: "24px 30px 26px", borderRadius: 28, background: "#fff", boxShadow: "0 40px 80px -24px rgba(208,52,75,0.45), 0 0 60px rgba(208,52,75,0.12)", fontFamily: FONT, whiteSpace: "nowrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 800, letterSpacing: "0.02em", color: C.red }}>
              <IAlert size={19} color={C.red} /> Проверка по смете
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>в заявке</div>
                <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: C.red }}>100</div>
              </div>
              <div style={{ marginBottom: 12, padding: "6px 12px", borderRadius: 12, background: C.red, color: "#fff", fontSize: 22, fontWeight: 800, scale: String(Math.max(0, pop(s, t.limit + 0.45, 0.5))) }}>×10</div>
              <div>
                <div style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>по смете и МГЭ</div>
                <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: C.ink }}>10</div>
              </div>
            </div>
          </div>
        );
      })()}

      {s >= t.route && <Route />}
    </AbsoluteFill>
  );
};

/** Reminders arrive by themselves: what to do next, for whom, by when. */
const PUSH_LIST = [
  { t: "Пора подавать заявку", d: "Радиаторы на Нагорную, 20 к4 — поставка 20.10", who: "подрядчику · за 10 рабочих дней", I: IFile, done: true },
  { t: "Загрузите ТТН", d: "Поставка 20.10 принята на объекте", who: "подрядчику · в день поставки", I: IFile },
  { t: "Подпишите М-15", d: "Передача материалов подрядчику — 10 шт.", who: "техническому заказчику · сегодня", I: ISign },
];
const Pushes: React.FC = () => {
  const s = useSec();
  const a = PUSHES.at;
  if (s < a || s > PUSHES.end + 0.6) return null;
  const out = tw(s, [PUSHES.end - 0.4, PUSHES.end], [0, 1], IN);
  const head = tw(s, [a + 0.3, a + 1.0], [0, 1], EXPO) * (1 - out);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 112, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: 1 - out }}>
        <Eyebrow n="04" label="Напоминания" at={a + 0.3} />
        <Rise text="Система сама напомнит о следующем шаге" at={a + 0.4} size={58} weight={780} highlight={["сама", "напомнит"]} center />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", justifyContent: "center", gap: 26, opacity: head > 0 ? 1 : 0 }}>
        {PUSH_LIST.map((p, i) => {
          const k = tw(s, [a + 0.75 + i * 0.45, a + 1.35 + i * 0.45], [0, 1], EXPO) * (1 - out);
          const glow = tw(s, [a + 0.95 + i * 0.45, a + 1.3 + i * 0.45, a + 2.1 + i * 0.45], [0, 1, 0.35]);
          return (
            <div key={p.t} style={{ width: 470, padding: "18px 20px", borderRadius: 24, background: "rgba(255,255,255,0.97)", boxShadow: `0 30px 60px -28px rgba(0,2,48,0.35), 0 0 0 1px rgba(0,2,48,0.04), 0 0 ${46 * glow}px rgba(49,107,253,${0.28 * glow})`, opacity: Math.min(1, k * 1.4), translate: `0 ${(1 - k) * -40}px`, scale: String(0.96 + 0.04 * k), display: "flex", gap: 16, boxSizing: "border-box" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#fff", boxShadow: "0 0 0 1px rgba(0,2,48,0.07)", display: "grid", placeItems: "center", flex: "none" }}><LogoMark size={32} strokeW={4} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", fontSize: 14.5, color: C.muted, fontWeight: 600 }}><span>ФКР · Учёт ТМЦ</span><span style={{ marginLeft: "auto" }}>{["06.10", "20.10", "20.10"][i]}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 21, fontWeight: 800, color: C.ink, marginTop: 4 }}>
                  {p.t}
                  {p.done && <span style={{ width: 22, height: 22, borderRadius: 99, background: C.green, display: "grid", placeItems: "center" }}><ICheck size={13} color="#fff" stroke={3.2} /></span>}
                </div>
                <div style={{ fontSize: 16.5, color: C.ink2, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.d}</div>
                <div style={{ fontSize: 14, color: C.blue, fontWeight: 700, marginTop: 8 }}>{p.who}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
