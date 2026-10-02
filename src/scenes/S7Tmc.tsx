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
import { Caption } from "./S5Objects";
import { ICheck, IAlert } from "../components/Icons";

/** Requests registry used as the backdrop of dialogs. */
export const TmcRegistry: React.FC<{ title?: string }> = ({ title = "Заявки и поставки" }) => (
  <div style={{ position: "absolute", inset: 0, padding: "26px 30px", boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</div>
    <div style={{ marginTop: 22, background: "#fff", borderRadius: 20, padding: "16px 0" }}>
      <div style={{ display: "flex", gap: 6, padding: "0 18px 14px" }}>
        {["Заявки", "Архив заявок", "Остатки", "Перемещения", "Использование", "Мониторинг"].map((t, i) => (
          <div key={t} style={{ height: 38, padding: "0 14px", borderRadius: 10, display: "grid", placeItems: "center", fontSize: 15, fontWeight: i ? 500 : 700, color: i ? C.muted : C.ink, background: i ? "transparent" : glow }}>
            {t}
          </div>
        ))}
      </div>
      {[
        ["З-2026-0201", "ул. Нагорная, д. 20, корп. 4", "Радиатор биметаллический · 100 шт.", "На проверке ТУ", "blue"],
        ["З-2026-0188", "Варшавское ш., д. 152, корп. 8", "Утеплитель · 42 м³", "Готово к поставке", "green"],
        ["З-2026-0176", "Абрамцевская ул., д. 7, корп. 2", "Штукатурная смесь · 180 пачек", "Подпись ЗПМ", "amber"],
        ["З-2026-0163", "Ленская ул., д. 32", "Радиатор биметаллический · 24 шт.", "Согласование УРО", "blue"],
      ].map((r) => (
        <div key={r[0]} style={{ display: "flex", alignItems: "center", height: 74, padding: "0 20px", fontSize: 15, borderTop: `1px solid ${C.lineSoft}` }}>
          <div style={{ width: 160, fontWeight: 750, color: C.blue }}>{r[0]}</div>
          <div style={{ width: 330, fontWeight: 600 }}>{r[1]}</div>
          <div style={{ width: 380, color: C.ink2 }}>{r[2]}</div>
          <Chip tone={r[4] as never}>{r[3]}</Chip>
        </div>
      ))}
    </div>
  </div>
);

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
  const out = tw(s, [55.85, 56.3], [0, 1], IN);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: enter * (1 - out) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <Eyebrow n="04" label="Учёт ТМЦ · заявка З-2026-0201" at={t.route + 0.1} />
        <Rise text="Маршрут согласования виден всем сторонам" at={t.route + 0.2} size={62} weight={780} highlight={["виден"]} />
      </div>
      <div style={{ position: "absolute", left: 210, top: 470, width: W, height: 300, scale: String(0.94 + 0.06 * enter) }}>
        <div style={{ position: "absolute", left: 0, top: 38, width: W, height: 6, borderRadius: 99, background: "#E4E7F0" }} />
        <div style={{ position: "absolute", left: 0, top: 38, width: gap * fill, height: 6, borderRadius: 99, background: C.blue }} />
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
          left: 960,
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

export const S7Tmc: React.FC = () => {
  const s = useSec();
  const t = TL.tmc;
  const keys: [number, Pose][] = [
    [46.2, { ...HOME, x: 3000, ry: -30, blur: 30 }],
    [46.8, { ...HOME }],
    [47.3, { ...HOME, s: 0.69, x: 1230 }],
    [47.95, focus(790, 520, 1.42)],
    [49.4, focus(800, 560, 1.45)],
    [50.1, focus(860, 640, 1.2)],
    [50.6, focus(860, 640, 1.18)],
    [51.3, { x: 960, y: 1500, s: 0.6, rx: 30, ry: 0, o: 0, blur: 10 }],
  ];
  const pose = poseAt(s, keys, (x) => (s < 46.8 ? OUT(x) : INOUT(x)));
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
          <AppWindow nav="tmc" tmcSub="Заявки и поставки" role="Подрядчик" roleSub="ООО «Городские системы»" tabs={[{ id: "r", label: "Заявки и поставки", icon: "package", active: true }]} overlay={<TmcForm at={46.35} qtyClick={t.clickQty} type={t.type} limit={t.limit} reasonAt={49.35} sendPress={t.clickSend} />}>
            <TmcRegistry />
          </AppWindow>
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
      {/* call-out on the guard */}
      {s > t.limit && s < 51 && (
        <div
          style={{
            position: "absolute",
            left: 1215,
            top: 770,
            scale: String(pop(s, t.limit + 0.1, 0.55)),
            opacity: 1 - tw(s, [49.3, 49.6], [0, 1]),
            padding: "18px 26px",
            borderRadius: 22,
            background: C.red,
            color: "#fff",
            fontFamily: FONT,
            boxShadow: "0 24px 60px -16px rgba(208,52,75,0.7)",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.85 }}>по смете и МГЭ — 10 шт.</div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em" }}>в заявке 100</div>
        </div>
      )}

      {s >= t.route && <Route />}
    </AbsoluteFill>
  );
};
