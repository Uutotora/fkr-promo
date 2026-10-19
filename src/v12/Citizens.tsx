import React from "react";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, pop, tw, useSec } from "../lib";
import { BENTO, BENTO_R } from "../v3/AiBento";
import { Eyebrow, Rise } from "../components/Type";
import { Cursor } from "../components/Cursor";
import { LogoMark } from "../components/Logo";
import { ICheck, IHouse, ITrend, ISign, IClock, IUsers } from "../components/Icons";

/* v12 · citizens' requests with AI: the hero card of the second bento opens into the whole screen.
   A request arrives → AI recognises house, system, contract and deadline → drafts the answer →
   the operator sends it; typical requests are answered automatically. Times on the Ai12 clock. */
export const CIT = { open: 90.6, end: 98.6 };
const T = (d: number) => CIT.open + d;
const FULL = { x: 90, y: 96, w: 1740, h: 920, r: 34 };

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const FIELDS: { l: string; v: string; I: React.FC<{ size?: number; color?: string }> }[] = [
  { l: "Дом", v: "ул. Нагорная, д. 20, корп. 4 · УНОМ 18542", I: IHouse },
  { l: "Система", v: "Отопление · 2-й подъезд", I: ITrend },
  { l: "Исполнитель", v: "подрядчик по договору ПКРД-002047-25", I: IUsers },
  { l: "Тип", v: "Гарантийный случай", I: ISign },
  { l: "Срок ответа", v: "до 24.10 · контроль устранения", I: IClock },
];
const REPLY = "Здравствуйте! Обращение принято. Подрядчик проверит отопление во 2-м подъезде 21.10, устранение — до 24.10. Мы сообщим о результате.";

export const Citizens: React.FC = () => {
  const s = useSec();
  if (s < CIT.open - 0.05 || s > CIT.end + 0.8) return null;
  const open = tw(s, [CIT.open, CIT.open + 0.75], [0, 1], INOUT);
  const close = tw(s, [CIT.end, CIT.end + 0.7], [0, 1], INOUT);
  const m = open * (1 - close);
  const a = BENTO[0];
  const r = { x: lerp(a.x, FULL.x, m), y: lerp(a.y, FULL.y, m), w: lerp(a.w, FULL.w, m), h: lerp(a.h, FULL.h, m), rad: lerp(BENTO_R, FULL.r, m) };
  const face = tw(s, [CIT.open + 0.45, CIT.open + 0.85], [0, 1]) * (1 - tw(s, [CIT.end - 0.25, CIT.end + 0.05], [0, 1]));
  const k = (d: number) => tw(s, [T(d), T(d) + 0.5], [0, 1], EXPO);
  const typed = REPLY.slice(0, Math.round(tw(s, [T(3.45), T(4.75)], [0, REPLY.length], (x) => x)));
  const SEND = T(5.25);
  const press = tw(s, [SEND - 0.05, SEND + 0.07, SEND + 0.28], [0, 1, 0]);
  const sent = tw(s, [SEND + 0.15, SEND + 0.6], [0, 1], EXPO);
  const hoverSend = tw(s, [SEND - 0.45, SEND - 0.2], [0, 1]) * (1 - sent);
  const auto = k(5.9);
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: r.rad, overflow: "hidden", zIndex: 6,
      background: m > 0.6 ? `rgb(${Math.round(lerp(49, 248, (m - 0.6) / 0.4))},${Math.round(lerp(107, 249, (m - 0.6) / 0.4))},${Math.round(lerp(253, 252, (m - 0.6) / 0.4))})` : `linear-gradient(160deg, #3D78FF, ${C.blue} 55%, #2557E0)`,
      boxShadow: "0 60px 120px -40px rgba(0,2,48,0.35)", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, opacity: face }}>
        <div style={{ position: "absolute", left: 60, top: 46, display: "flex", flexDirection: "column", gap: 14 }}>
          <Eyebrow n="ИИ" label="Обращения граждан" at={T(0.5)} />
          <Rise text="Обращение сразу попадает к исполнителю" at={T(0.6)} size={52} weight={800} highlight={["к", "исполнителю"]} />
        </div>
        {/* the request */}
        <div style={{ position: "absolute", left: 60, top: 240, width: 560, padding: "24px 26px", borderRadius: 24, background: "#fff", boxShadow: "0 30px 60px -30px rgba(0,2,48,0.3)", opacity: k(1.0), translate: `${(1 - k(1.0)) * -40}px 0` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: C.muted, fontWeight: 650 }}>
            <span style={{ width: 40, height: 40, borderRadius: 99, background: C.orange50, color: C.orange, display: "grid", placeItems: "center", fontWeight: 800 }}>Ж</span>
            Житель, кв. 57 · электронная приёмная · 09:12
          </div>
          <div style={{ fontSize: 23, fontWeight: 650, color: C.ink, lineHeight: 1.38, marginTop: 16 }}>«После ремонта отопления во 2-м подъезде холодные батареи. Нагорная, 20 к4»</div>
        </div>
        {/* what the model recognised */}
        <div style={{ position: "absolute", left: 670, top: 240, width: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: C.blue, letterSpacing: "0.04em", opacity: k(1.6) }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: C.blue, color: "#fff", display: "grid", placeItems: "center", fontSize: 15 }}>✦</span>
            ИИ РАСПОЗНАЛ
          </div>
          {FIELDS.map((f, i) => {
            const q = k(1.8 + i * 0.3);
            return (
              <div key={f.l} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, padding: "12px 16px", borderRadius: 16, background: "#fff", boxShadow: `0 16px 34px -22px rgba(0,2,48,0.35), 0 0 ${26 * Math.max(0, 1 - Math.abs(s - T(1.9 + i * 0.3)) * 2)}px rgba(49,107,253,0.35)`, opacity: q, translate: `${(1 - q) * 30}px 0` }}>
                <span style={{ width: 38, height: 38, borderRadius: 99, background: C.blue50, display: "grid", placeItems: "center", flex: "none" }}><f.I size={19} color={C.blue} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600 }}>{f.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.v}</div>
                </div>
                <span style={{ width: 24, height: 24, borderRadius: 99, background: C.green50, display: "grid", placeItems: "center", scale: String(Math.max(0, pop(s, T(2.0 + i * 0.3), 0.45))) }}><ICheck size={14} color={C.green} stroke={3} /></span>
              </div>
            );
          })}
        </div>
        {/* the drafted answer */}
        <div style={{ position: "absolute", left: 1240, top: 240, width: 440, padding: "24px 26px", borderRadius: 24, background: "#fff", boxShadow: "0 30px 60px -30px rgba(0,2,48,0.3)", opacity: k(3.25), translate: `0 ${(1 - k(3.25)) * 30}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 800, color: C.muted, letterSpacing: "0.04em" }}>
            <LogoMark size={26} strokeW={4.4} /> ПРОЕКТ ОТВЕТА
          </div>
          <div style={{ fontSize: 19, color: C.ink, lineHeight: 1.45, marginTop: 14, minHeight: 168 }}>
            {typed}
            {typed.length < REPLY.length && s > T(3.4) && <span style={{ display: "inline-block", width: 2, height: 21, background: C.blue, marginLeft: 2, verticalAlign: "middle" }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10, height: 50, padding: "0 22px", borderRadius: 16, background: sent > 0.5 ? C.green : C.blue, color: "#fff", fontSize: 19, fontWeight: 750, scale: String(1 - press * 0.05 + hoverSend * 0.02), boxShadow: `0 12px 26px -10px ${sent > 0.5 ? "rgba(15,138,95,0.7)" : "rgba(49,107,253,0.75)"}, 0 0 ${34 * hoverSend}px rgba(49,107,253,${0.45 * hoverSend})` }}>
              {sent > 0.5 ? <><ICheck size={18} color="#fff" stroke={3} /> Отправлено</> : "Отправить"}
            </div>
            <span style={{ fontSize: 15, color: C.muted, opacity: 1 - sent }}>оператор проверяет</span>
          </div>
        </div>
        {/* typical requests: answered automatically */}
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 46, display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", borderRadius: 24, background: C.blue50, opacity: auto, translate: `0 ${(1 - auto) * 24}px` }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.blue }}>Типовые обращения — ответ автоматически</span>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            {["Сроки ремонта", "График отключений", "Состав работ", "Контакты подрядчика"].map((x, i) => (
              <span key={x} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 99, background: "#fff", color: C.ink2, fontSize: 16, fontWeight: 700, opacity: k(6.05 + i * 0.12) }}>
                <ICheck size={14} color={C.green} stroke={3} /> {x}
              </span>
            ))}
          </div>
        </div>
        <Cursor keys={[[T(4.4), FULL.x + 1500, FULL.y + 760], [SEND - 0.25, FULL.x + 1300 - FULL.x + 60, FULL.y + 545], [SEND + 0.7, 1400, 700]].map(([t, x, y]) => [t, x - r.x, y - r.y] as [number, number, number])} clicks={[SEND]} show={[T(4.4), T(6.4)]} />
      </div>
    </div>
  );
};
export const _cit = IN;
