import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, TL, pop, tw, useSec } from "../lib";
import { AppWindow, HOME, Stage3D } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { Eyebrow, Rise } from "../components/Type";
import { LightStage } from "../components/Backdrop";
import { ISign, IShield, ICheck } from "../components/Icons";
import { TmcRegistry } from "./S7Tmc";

const D = { w: 860, x: 960 - 430, y: 318 };
const SIGN_BTN = { x: D.x + D.w - 36 - 90, y: D.y + 312 };

const STEPS = ["Проверка сертификата", "Вычисление хэша документа", "Формирование подписи", "Отправка в Диадок"];

export const S8Sign: React.FC = () => {
  const s = useSec();
  const g = TL.sign;
  const enter = tw(s, [g.dialog, g.dialog + 0.6], [0, 1], EXPO);
  const signing = s >= g.clickSign + 0.15;
  const doneAll = s >= g.steps[3] + 0.3;
  const prog = tw(s, [g.clickSign + 0.15, g.steps[3] + 0.2], [0, 1], INOUT);
  const press = tw(s, [g.clickSign - 0.05, g.clickSign + 0.08, g.clickSign + 0.3], [0, 1, 0]);
  const stamp = tw(s, [g.stamp, g.stamp + 0.32], [0, 1], (t) => t * t);
  const stampSettle = pop(s, g.stamp + 0.28, 0.5);
  const shock = tw(s, [g.stamp + 0.3, g.stamp + 1.1], [0, 1], EXPO);
  const out = tw(s, [61.75, 62.3], [0, 1], IN);
  const h = 370 + tw(s, [g.steps[3] + 0.3, g.steps[3] + 0.8], [0, 190], EXPO);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightStage glowX={0.5} glowY={0.6} />
      <div style={{ opacity: 0.55 * (1 - out), filter: "blur(6px)" }}>
        <Stage3D pose={{ ...HOME, x: 960, y: 620, s: 0.78, rx: 8, ry: 0 }}>
          <AppWindow nav="tmc" tmcSub="Заявки и поставки" tabs={[{ id: "r", label: "З-2026-0201", icon: "package", active: true }]}>
            <TmcRegistry title="З-2026-0201" />
          </AppWindow>
        </Stage3D>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 112, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - out }}>
        <Eyebrow n="07" label="Электронная подпись" at={g.dialog} />
        <Rise text="КЭП и Диадок — без бумаги и курьеров" at={g.dialog + 0.1} size={60} weight={780} highlight={["без", "бумаги"]} />
      </div>

      <div
        style={{
          position: "absolute",
          left: D.x,
          top: D.y,
          width: D.w,
          height: h,
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 50px 100px -30px rgba(0,2,48,0.45), 0 0 0 1px rgba(0,2,48,0.05)",
          opacity: enter * (1 - out),
          scale: String((0.92 + 0.08 * enter) * (1 - out * 0.06)),
          translate: `0 ${(1 - enter) * 40}px`,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "30px 36px 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: 99, background: C.blue50, display: "grid", placeItems: "center" }}>
            <ISign size={28} color={C.blue} />
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>{doneAll ? "Документ подписан" : "Подписание ЭЦП"}</div>
            <div style={{ fontSize: 18, color: C.muted, marginTop: 2 }}>ЗПМ · заявка З-2026-0201</div>
          </div>
        </div>

        {!signing ? (
          <div style={{ padding: "22px 36px 0" }}>
            <div style={{ fontSize: 18, color: C.ink2 }}>Выберите сертификат квалифицированной подписи</div>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 18, padding: "20px 22px", borderRadius: 18, background: C.blue50, boxShadow: `inset 0 0 0 2px ${C.blue}` }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, boxShadow: `inset 0 0 0 7px ${C.blue}`, background: "#fff" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 21, fontWeight: 800 }}>Смирнова Елена Андреевна</div>
                <div style={{ fontSize: 16.5, color: C.ink2, marginTop: 3 }}>Начальник ОПМ · Фонд капитального ремонта г. Москвы</div>
                <div style={{ fontSize: 15, color: C.muted, marginTop: 3 }}>УЦ ФНС России · действует до 12.03.2027</div>
              </div>
              <IShield size={30} color={C.green} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <div style={{ height: 52, padding: "0 22px", borderRadius: 13, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 650 }}>Отмена</div>
              <div style={{ height: 52, width: 180, borderRadius: 13, background: C.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 17, fontWeight: 750, scale: String(1 - press * 0.06) }}>
                <ISign size={19} color="#fff" /> Подписать
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "24px 36px 0" }}>
            {STEPS.map((st, i) => {
              const ok = s >= g.steps[i];
              const now = !ok && (i === 0 || s >= g.steps[i - 1]);
              const p = pop(s, g.steps[i], 0.4);
              return (
                <div key={st} style={{ display: "flex", alignItems: "center", gap: 16, height: 46, fontSize: 19, fontWeight: ok || now ? 650 : 450, color: ok || now ? C.ink : C.faint }}>
                  <div style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", background: ok ? C.blue : "#fff", boxShadow: ok ? "none" : `inset 0 0 0 2.5px ${now ? C.blue : "#DDE1EC"}`, scale: String(ok ? Math.max(0.6, p) : 1) }}>
                    {ok && <ICheck size={17} color="#fff" stroke={3} />}
                  </div>
                  {st}
                </div>
              );
            })}
            <div style={{ marginTop: 14, height: 8, borderRadius: 99, background: C.lineSoft }}>
              <div style={{ width: `${prog * 100}%`, height: 8, borderRadius: 99, background: C.blue }} />
            </div>
          </div>
        )}

        {doneAll && (
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 352,
              width: 520,
              padding: "16px 20px",
              boxSizing: "border-box",
              borderRadius: 14,
              boxShadow: `inset 0 0 0 2.5px ${C.blue}, inset 0 0 0 6px #fff, inset 0 0 0 7.5px ${C.blue}`,
              color: C.blue700,
              opacity: Math.min(1, stamp * 2),
              scale: String(stamp < 1 ? 2.2 - 1.2 * stamp : 1 + (stampSettle - 1) * 0.08),
              rotate: `${(1 - stamp) * -9 - 1.5}deg`,
              transformOrigin: "40% 50%",
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.04em" }}>ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ</div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 3, marginTop: 8, fontSize: 14.5 }}>
              <span style={{ opacity: 0.7 }}>Сертификат</span>
              <b>01D8 3A7F 00B2 7C41</b>
              <span style={{ opacity: 0.7 }}>Владелец</span>
              <b>Смирнова Е. А.</b>
              <span style={{ opacity: 0.7 }}>Подписан</span>
              <b>01.10.2026, 19:13</b>
            </div>
          </div>
        )}
        {doneAll && (
          <div style={{ position: "absolute", right: 36, bottom: 30, height: 52, width: 150, borderRadius: 13, background: C.blue, color: "#fff", display: "grid", placeItems: "center", fontSize: 17, fontWeight: 750, opacity: tw(s, [g.stamp + 0.6, g.stamp + 1], [0, 1]) }}>
            Готово
          </div>
        )}
      </div>
      {/* impact ring: a thin line of light */}
      {shock > 0 && shock < 1 && (
        <div style={{ position: "absolute", left: D.x + 36 + 260, top: D.y + 352 + 60, width: 20 + shock * 1100, height: 20 + shock * 1100, borderRadius: 9999, translate: "-50% -50%", border: `2px solid rgba(49,107,253,${0.7 * (1 - shock)})`, boxShadow: `0 0 30px rgba(49,107,253,${0.5 * (1 - shock)}), inset 0 0 30px rgba(49,107,253,${0.3 * (1 - shock)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor
            keys={[
              [56.6, 1300, 900],
              [57.5, SIGN_BTN.x, SIGN_BTN.y],
              [58.6, SIGN_BTN.x + 120, SIGN_BTN.y + 220],
            ]}
            clicks={[g.clickSign]}
            show={[56.7, 58.9]}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
