import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, track, tw, useSec } from "../lib";
import { LightStage } from "../components/Backdrop";
import { Cursor } from "../components/Cursor";
import { LogoMark } from "../components/Logo";
import { Eyebrow, Rise } from "../components/Type";
import { ICheck, IFile, ITable, IAlert, ISearch, IArrowR, IShield, ILayers, ITrend } from "../components/Icons";

export const AI = {
  in: 66.0,
  input: 66.35,
  q1: [66.8, 68.25] as [number, number],
  send1: 68.5,
  think: 68.7,
  answer: [69.45, 71.25] as [number, number],
  cards: 71.35,
  focus: [71.9, 73.2] as [number, number],
  q2: [73.55, 74.35] as [number, number],
  send2: 74.5,
  scan: [75.0, 76.1] as [number, number],
  checks: [75.4, 75.75, 76.1],
  verdict: 76.45,
  nom: 77.0,
  modules: 82.2,
  out: 84.9,
};

const Q1 = "Где заявка З-2026-0201 и почему в ней превышение?";
const A1 =
  "Заявка по ул. Нагорной, 20 к4 сейчас на согласовании в УРО ГАУ. В заявке 100 радиаторов, а по ПСД и МГЭ — 10. Подрядчик приложил обоснование, ТУ подтвердил отклонение.";
const Q2 = "Сверь УПД №418 с заявкой";

const typed = (s: number, text: string, [a, b]: [number, number]) => text.slice(0, Math.round(tw(s, [a, b], [0, text.length], (x) => x)));

const Avatar: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <div style={{ position: "relative", width: 46, height: 46, borderRadius: 14, background: "#fff", display: "grid", placeItems: "center", boxShadow: `0 6px 18px -6px rgba(0,2,48,0.25), 0 0 ${30 * glow}px rgba(49,107,253,${0.6 * glow})` }}>
    <LogoMark size={30} strokeW={4.2} />
  </div>
);

const AttachCard: React.FC<{ at: number; x: number; w: number; children: React.ReactNode; dim?: number }> = ({ at, x, w, children, dim = 0 }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.7], [0, 1], EXPO);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: w,
        background: "#fff",
        borderRadius: 20,
        padding: 20,
        boxSizing: "border-box",
        boxShadow: "0 24px 50px -24px rgba(0,2,48,0.35), 0 0 0 1px rgba(0,2,48,0.05)",
        opacity: Math.min(1, k * 1.5) * (1 - dim * 0.75),
        translate: `0 ${(1 - k) * 50}px`,
        scale: String(0.94 + 0.06 * k),
        filter: dim ? `blur(${dim * 2}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

const MODULES = [
  { t: "Сопоставление номенклатуры", d: "БАРС, 1С, ТЭП и проект — одна позиция", I: ILayers },
  { t: "Автосверка документов", d: "УПД, ТТН, счета и М-15", I: IFile },
  { t: "Автосогласование заявок", d: "сотрудник смотрит только отклонения", I: ICheck },
  { t: "Поиск аномалий", d: "повторные заявки, превышение норм", I: IAlert },
  { t: "Прогноз потребности", d: "риск срыва поставок — заранее", I: ITrend },
];

export const Ai3: React.FC = () => {
  const s = useSec();
  const ent = tw(s, [AI.in - 0.3, AI.in + 0.15], [0, 1], EXPO);
  const out = tw(s, [AI.out, AI.out + 0.6], [0, 1], IN);

  // the input travels from the centre to the bottom once the first question is sent
  const dock = tw(s, [AI.send1, AI.send1 + 0.7], [0, 1], INOUT);
  const inputY = 560 + (930 - 560) * dock;
  const inputW = 1180 - 180 * dock;
  const q1 = typed(s, Q1, AI.q1);
  const q2 = typed(s, Q2, AI.q2);
  const inputText = s < AI.send1 ? q1 : s >= AI.q2[0] && s < AI.send2 ? q2 : "";
  const press1 = tw(s, [AI.send1 - 0.05, AI.send1 + 0.08, AI.send1 + 0.3], [0, 1, 0]);
  const press2 = tw(s, [AI.send2 - 0.05, AI.send2 + 0.08, AI.send2 + 0.3], [0, 1, 0]);
  const thinking = s >= AI.think && s < AI.answer[0] + 0.2 ? 1 : s >= AI.send2 && s < AI.scan[0] ? 1 : 0;

  // conversation scrolls up when the second exchange starts
  const scroll = tw(s, [AI.send2, AI.send2 + 0.8], [0, 1], INOUT);
  // attention camera
  const cam = {
    s: track(s, [
      [AI.focus[0] - 0.1, 1],
      [AI.focus[0] + 0.6, 1.55],
      [AI.focus[1], 1.6],
      [AI.focus[1] + 0.6, 1],
      [AI.scan[0], 1],
      [AI.scan[0] + 0.5, 1.18],
      [AI.verdict + 0.4, 1.2],
      [AI.nom, 0.86],
    ], INOUT),
    x: track(s, [
      [AI.focus[0] - 0.1, 0],
      [AI.focus[0] + 0.6, 426],
      [AI.focus[1], 410],
      [AI.focus[1] + 0.6, 0],
      [AI.scan[0], 0],
      [AI.scan[0] + 0.5, 60],
      [AI.verdict + 0.4, 60],
      [AI.nom, 0],
    ], INOUT),
    y: track(s, [
      [AI.focus[0] - 0.1, 0],
      [AI.focus[0] + 0.6, -30],
      [AI.focus[1], -26],
      [AI.focus[1] + 0.6, 0],
      [AI.scan[0], 0],
      [AI.scan[0] + 0.5, 140],
      [AI.verdict + 0.4, 140],
      [AI.nom, -160],
    ], INOUT),
  };
  const dim = tw(s, [AI.focus[0], AI.focus[0] + 0.4, AI.focus[1], AI.focus[1] + 0.4], [0, 1, 1, 0]);

  // answer words
  const words = A1.split(" ");
  const shown = Math.round(tw(s, [AI.answer[0], AI.answer[1]], [0, words.length], (x) => x));

  const sources = ["Заявки ТМЦ", "Смета ЛСР-НГ-001", "Заключение МГЭ", "Журнал согласований"];
  const modK = tw(s, [AI.nom, AI.nom + 0.5], [0, 1], EXPO);
  const modsIn = tw(s, [AI.modules, AI.modules + 0.6], [0, 1], EXPO);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: ent * (1 - out) }}>
      <LightStage glowX={0.5} glowY={0.75} />
      {/* the glowing last step of the approval route becomes the input */}
      {s < AI.input + 0.5 && (() => {
        const m = tw(s, [AI.in, AI.input + 0.25], [0, 1], INOUT);
        const w = 82 + (1180 - 82) * m;
        const h = 82 + (96 - 82) * m;
        const x = 1710 + (960 - 1710) * m;
        const y = 511 + (560 - 511) * m;
        return <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 41 - 11 * m, background: "#fff", boxShadow: `inset 0 0 0 ${6 * (1 - m)}px ${C.blue}, 0 0 ${60 + 40 * m}px rgba(49,107,253,0.45)`, opacity: 1 - tw(s, [AI.input + 0.15, AI.input + 0.5], [0, 1]) }} />;
      })()}
      {/* AI aura under the input */}
      <div
        style={{
          position: "absolute",
          left: 960 - 700,
          top: inputY - 260,
          width: 1400,
          height: 520,
          borderRadius: "50%",
          background: "conic-gradient(from " + s * 60 + "deg, rgba(49,107,253,0.35), rgba(140,110,255,0.28), rgba(253,132,49,0.25), rgba(49,107,253,0.35))",
          filter: "blur(90px)",
          opacity: (0.45 + thinking * 0.4) * (1 - modK * 0.6),
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: 1 - tw(s, [AI.send1, AI.send1 + 0.4], [0, 1]) }}>
        <Eyebrow n="05" label="ИИ-ассистент" at={AI.in + 0.1} />
        <Rise text="Спросите систему — как коллегу" at={AI.in + 0.2} size={68} weight={800} highlight={["как", "коллегу"]} center />
      </div>

      {/* conversation, under an attention camera */}
      <AbsoluteFill style={{ scale: String(cam.s), translate: `${cam.x}px ${cam.y}px`, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 360, width: 1200, top: 150 - scroll * 720, opacity: 1 - modK }}>
          {/* user message 1 */}
          {s >= AI.send1 && (
            <div style={{ display: "flex", justifyContent: "flex-end", opacity: tw(s, [AI.send1 + 0.1, AI.send1 + 0.5], [0, 1]), translate: `0 ${(1 - tw(s, [AI.send1 + 0.1, AI.send1 + 0.7], [0, 1], EXPO)) * 60}px` }}>
              <div style={{ maxWidth: 760, background: "#E9ECF5", padding: "18px 26px", borderRadius: 26, fontSize: 28, fontWeight: 550, color: C.ink, opacity: 1 - dim * 0.75 }}>{Q1}</div>
            </div>
          )}
          {/* thinking + sources */}
          {s >= AI.think && (
            <div style={{ display: "flex", gap: 18, marginTop: 30 }}>
              <Avatar glow={s < AI.answer[0] ? 0.5 + 0.5 * Math.sin(s * 10) : 0} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: 1 - dim * 0.8 }}>
                  {sources.map((src, i) => {
                    const p = pop(s, AI.think + 0.12 + i * 0.12, 0.45);
                    return (
                      <div key={src} style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderRadius: 12, background: "#fff", boxShadow: "0 0 0 1px rgba(0,2,48,0.08)", fontSize: 17, fontWeight: 600, color: C.ink2, scale: String(Math.max(0, p)) }}>
                        <ISearch size={15} color={C.blue} /> {src}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 18, fontSize: 30, lineHeight: 1.42, fontWeight: 500, color: C.ink, maxWidth: 1060, opacity: 1 - dim * 0.8, filter: dim ? `blur(${dim * 2}px)` : undefined }}>
                  {words.slice(0, shown).map((w, i) => {
                    const t0 = AI.answer[0] + (i / words.length) * (AI.answer[1] - AI.answer[0]);
                    const k = tw(s, [t0, t0 + 0.25], [0, 1]);
                    const hot = /100|10\.|ПСД|МГЭ/.test(w);
                    return (
                      <span key={i} style={{ opacity: k, filter: `blur(${(1 - k) * 4}px)`, fontWeight: hot ? 750 : 500, color: hot ? C.blue : C.ink }}>
                        {w}{" "}
                      </span>
                    );
                  })}
                </div>
                {/* attachments */}
                <div style={{ position: "relative", height: 210, marginTop: 26 }}>
                  <AttachCard at={AI.cards} x={0} w={470}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 750 }}>
                      <ITable size={20} color={C.blue} /> Проверка по смете
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginTop: 16, fontSize: 15, color: C.muted, rowGap: 6 }}>
                      <span>ПСД</span>
                      <span>МГЭ</span>
                      <span>В заявке</span>
                      <span>Превышение</span>
                      <b style={{ fontSize: 30, color: C.ink }}>10</b>
                      <b style={{ fontSize: 30, color: C.ink }}>10</b>
                      <b style={{ fontSize: 30, color: C.red, position: "relative" }}>
                        100
                        {dim > 0 && <span style={{ position: "absolute", left: -12, top: -8, width: 82, height: 54, borderRadius: 14, boxShadow: `0 0 0 3px ${C.red}`, opacity: dim, scale: String(0.8 + 0.2 * dim) }} />}
                      </b>
                      <b style={{ fontSize: 30, color: C.red }}>97</b>
                    </div>
                  </AttachCard>
                  <AttachCard at={AI.cards + 0.15} x={490} w={290} dim={dim}>
                    <div style={{ width: 54, height: 66, borderRadius: 8, background: C.red50, display: "grid", placeItems: "center", color: C.red, fontWeight: 800, fontSize: 14 }}>PDF</div>
                    <div style={{ fontSize: 17, fontWeight: 700, marginTop: 14 }}>Обоснование подрядчика</div>
                    <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>З-2026-0201 · 28.09.2026</div>
                  </AttachCard>
                  <AttachCard at={AI.cards + 0.3} x={800} w={300} dim={dim}>
                    <div style={{ fontSize: 17, fontWeight: 750 }}>Маршрут</div>
                    {[
                      ["Подрядчик", 1],
                      ["ТУ ГАУ", 1],
                      ["УРО ГАУ", 0],
                    ].map(([l, d]) => (
                      <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 16, fontWeight: 600 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", background: d ? C.blue : "#fff", boxShadow: d ? "none" : `inset 0 0 0 4px ${C.blue}` }}>{d ? <ICheck size={13} color="#fff" stroke={3} /> : null}</span>
                        {l}
                      </div>
                    ))}
                  </AttachCard>
                </div>
              </div>
            </div>
          )}
          {/* exchange 2 */}
          {s >= AI.send2 && (
            <div style={{ marginTop: 70 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", opacity: tw(s, [AI.send2 + 0.1, AI.send2 + 0.5], [0, 1]) }}>
                <div style={{ background: "#E9ECF5", padding: "18px 26px", borderRadius: 26, fontSize: 28, fontWeight: 550 }}>{Q2}</div>
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 26 }}>
                <Avatar glow={s < AI.scan[0] ? 0.5 + 0.5 * Math.sin(s * 10) : 0} />
                <div style={{ display: "flex", gap: 26, alignItems: "flex-start" }}>
                  {/* the scanned document */}
                  <div style={{ position: "relative", width: 430, height: 300, background: "#fff", borderRadius: 14, boxShadow: "0 24px 50px -24px rgba(0,2,48,0.35), 0 0 0 1px rgba(0,2,48,0.06)", padding: 22, boxSizing: "border-box", overflow: "hidden", opacity: tw(s, [AI.send2 + 0.4, AI.send2 + 0.8], [0, 1]) }}>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.04em" }}>УНИВЕРСАЛЬНЫЙ ПЕРЕДАТОЧНЫЙ ДОКУМЕНТ № 418</div>
                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>Продавец: ООО «Материалы города» · Покупатель: ФКР Москвы</div>
                    {[
                      ["Радиатор БМ 10 секций", "100 шт.", "8 600,00"],
                      ["Доставка до объекта", "1 усл.", "—"],
                    ].map((r, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", columnGap: 10, fontSize: 14, padding: "8px 0", borderBottom: "1px dashed #DDE1EC", marginTop: i ? 0 : 16 }}>
                        {r.map((c, j) => {
                          const hit = i === 0 && s > AI.checks[j];
                          return (
                            <span key={j} style={{ padding: "4px 6px", borderRadius: 7, boxShadow: hit ? `inset 0 0 0 1.5px ${C.blue}` : "none", background: hit ? "rgba(49,107,253,0.08)" : "transparent", color: hit ? C.blue700 : undefined, fontWeight: hit ? 650 : 400 }}>
                              {c}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} style={{ height: 8, borderRadius: 9, background: "#EEF0F5", marginTop: 12, width: `${70 - i * 12}%` }} />
                    ))}
                    {/* scanning beam */}
                    {s > AI.scan[0] && s < AI.scan[1] + 0.2 && (
                      <div style={{ position: "absolute", left: 0, right: 0, top: tw(s, [AI.scan[0], AI.scan[1]], [-20, 300], (x) => x), height: 40, background: "linear-gradient(180deg, rgba(49,107,253,0), rgba(49,107,253,0.28), rgba(49,107,253,0))", boxShadow: "0 0 30px rgba(49,107,253,0.4)" }} />
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 6 }}>
                    {[
                      ["Радиатор БМ 10 секций", "ТМЦ-000317"],
                      ["Количество 100 шт.", "= заявка"],
                      ["Цена 8 600 ₽", "= смета"],
                    ].map(([a, b], i) => {
                      const p = tw(s, [AI.checks[i], AI.checks[i] + 0.4], [0, 1], EXPO);
                      return (
                        <div key={a} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, fontWeight: 650, opacity: p, translate: `${(1 - p) * 30}px 0` }}>
                          <span style={{ width: 34, height: 34, borderRadius: 99, background: C.green, display: "grid", placeItems: "center" }}>
                            <ICheck size={20} color="#fff" stroke={3} />
                          </span>
                          {a} <IArrowR size={18} color={C.faint} /> <span style={{ color: C.blue }}>{b}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 10, alignSelf: "flex-start", padding: "12px 20px", borderRadius: 14, background: C.green50, color: C.green, fontSize: 22, fontWeight: 800, scale: String(Math.max(0, pop(s, AI.verdict, 0.5))) }}>
                      Расхождений нет · документ связан с поставкой
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* the input */}
      <div
        style={{
          position: "absolute",
          left: 960 - inputW / 2,
          top: inputY - 48,
          width: inputW,
          height: 96,
          borderRadius: 30,
          background: "#fff",
          boxShadow: `0 30px 60px -28px rgba(0,2,48,0.4), 0 0 0 1px rgba(0,2,48,0.06), 0 0 0 ${thinking ? 3 : 0}px rgba(49,107,253,0.35)`,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 18px 0 30px",
          boxSizing: "border-box",
          opacity: tw(s, [AI.input, AI.input + 0.5], [0, 1]) * (1 - modK),
          scale: String(0.94 + 0.06 * tw(s, [AI.input, AI.input + 0.6], [0, 1], EXPO)),
          filter: `blur(${(1 - tw(s, [AI.input, AI.input + 0.5], [0, 1])) * 8}px)`,
        }}
      >
        <div style={{ flex: 1, fontSize: 30, fontWeight: 550, color: inputText ? C.ink : C.faint, whiteSpace: "nowrap", overflow: "hidden" }}>
          {inputText || "Спросите о заявке, договоре или документе…"}
          {inputText && <span style={{ display: "inline-block", width: 3, height: 34, background: C.blue, marginLeft: 3, verticalAlign: "middle", opacity: Math.floor(s * 3) % 2 ? 1 : 0.2 }} />}
        </div>
        <div style={{ width: 62, height: 62, borderRadius: 22, background: inputText ? C.blue : "#DDE1EC", display: "grid", placeItems: "center", scale: String(1 - Math.max(press1, press2) * 0.12), boxShadow: inputText ? "0 10px 24px -8px rgba(49,107,253,0.8)" : "none" }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0 }}>
        <Cursor
          keys={[
            [67.8, 1500, 820],
            [68.4, 960 + inputW / 2 - 49, 560],
            [69.3, 1560, 760],
            [74.0, 1560, 860],
            [74.4, 960 + 500 - 49, 930],
            [75.2, 1600, 1010],
          ]}
          clicks={[AI.send1, AI.send2]}
          show={[67.7, 75.0]}
        />
      </div>

      {/* nomenclature matching: the three spellings from problem 05 become one position */}
      {s >= AI.nom - 0.1 && s < AI.modules + 0.5 && (
        <AbsoluteFill style={{ opacity: 1 - tw(s, [AI.modules - 0.3, AI.modules + 0.2], [0, 1]) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Eyebrow n="ИИ" label="Сопоставление номенклатуры" at={AI.nom + 0.1} />
            <Rise text="Одна позиция вместо трёх написаний" at={AI.nom + 0.2} size={64} weight={800} highlight={["Одна", "позиция"]} center />
          </div>
          {[
            ["УПД № 418", "Радиатор биметалл. 10 с.", "100"],
            ["ТТН № 77", "Радиатор БМ 10 секций", "100"],
            ["М-15 № 12", "Радиатор 10-секц.", "98"],
          ].map(([d, n, q], i) => {
            const k = tw(s, [AI.nom + 0.45 + i * 0.18, AI.nom + 1.1 + i * 0.18], [0, 1], EXPO);
            const ok = s > AI.nom + 2.2 + i * 0.3;
            return (
              <div key={d} style={{ position: "absolute", left: 200, top: 400 + i * 150, width: 520, height: 112, background: "#fff", borderRadius: 20, padding: "18px 22px", boxSizing: "border-box", boxShadow: ok ? `0 0 0 2px ${i === 2 ? C.orange : C.green}, 0 24px 50px -24px rgba(0,2,48,0.35)` : "0 24px 50px -24px rgba(0,2,48,0.35), 0 0 0 1px rgba(0,2,48,0.05)", opacity: k, translate: `${(1 - k) * -60}px 0` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: C.muted, letterSpacing: "0.04em" }}>
                  {d}
                  <span style={{ marginLeft: "auto", fontSize: 17, color: i === 2 && ok ? C.orange : C.ink, fontWeight: 800 }}>{q} шт.</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, color: C.ink }}>{n}</div>
              </div>
            );
          })}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[0, 1, 2].map((i) => {
              const d = tw(s, [AI.nom + 1.25 + i * 0.12, AI.nom + 1.95 + i * 0.12], [0, 1], INOUT);
              const y = 456 + i * 150;
              return <path key={i} d={`M 720 ${y} C 900 ${y}, 950 606, 1130 606`} fill="none" stroke={i === 2 ? C.orange : C.blue} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} filter="url(#lineGlow)" />;
            })}
          </svg>
          {(() => {
            const p = tw(s, [AI.nom + 1.8, AI.nom + 2.4], [0, 1], EXPO);
            const an = pop(s, AI.nom + 3.4, 0.5);
            return (
              <div style={{ position: "absolute", left: 1130, top: 440, width: 600, background: "#fff", borderRadius: 26, padding: 30, boxSizing: "border-box", opacity: p, scale: String(0.9 + 0.1 * p), boxShadow: `0 40px 80px -30px rgba(49,107,253,0.45), 0 0 0 2px ${C.blue}, 0 0 60px rgba(49,107,253,${0.25 * p})` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ padding: "6px 12px", borderRadius: 10, background: C.blue50, color: C.blue, fontSize: 18, fontWeight: 800 }}>ТМЦ-000317</span>
                  <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>справочник ФКР</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 16, lineHeight: 1.15, letterSpacing: "-0.02em" }}>Радиатор биметаллический, 10 секций</div>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {["УПД", "ТТН", "М-15"].map((x, i) => {
                    const ok = s > AI.nom + 2.2 + i * 0.3;
                    return (
                      <span key={x} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: ok ? C.green50 : "#F1F1F4", color: ok ? C.green : C.faint, fontSize: 17, fontWeight: 800 }}>
                        {ok && <ICheck size={15} color={C.green} stroke={3} />}
                        {x}
                      </span>
                    );
                  })}
                </div>
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 14, background: C.orange50, color: "#c4520f", fontSize: 19, fontWeight: 750, scale: String(Math.max(0, an)), transformOrigin: "left center" }}>
                  <IAlert size={20} color="#c4520f" /> Аномалия: по М-15 98 шт., по УПД 100 — на проверку
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      )}

      {/* modules */}
      {s >= AI.modules - 0.1 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Rise text="ИИ берёт рутинные проверки на себя" at={AI.modules} size={64} weight={800} highlight={["ИИ"]} center />
            <div style={{ fontSize: 26, color: C.muted, fontWeight: 500, opacity: tw(s, [AI.modules + 0.4, AI.modules + 0.9], [0, 1]) }}>
              <IShield size={22} color={C.green} style={{ verticalAlign: "-3px" }} /> Модели работают в контуре Фонда, без передачи данных наружу
            </div>
          </div>
          <div style={{ position: "absolute", left: 120, right: 120, top: 520, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
            {MODULES.map((m, i) => {
              const k = tw(s, [AI.modules + 0.3 + i * 0.1, AI.modules + 1.0 + i * 0.1], [0, 1], EXPO);
              return (
                <div key={m.t} style={{ background: i === 1 ? C.blue : "#fff", color: i === 1 ? "#fff" : C.ink, borderRadius: 24, padding: 26, minHeight: 230, boxSizing: "border-box", boxShadow: "0 30px 60px -30px rgba(0,2,48,0.35)", opacity: k, translate: `0 ${(1 - k) * 80}px`, display: "flex", flexDirection: "column" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 99, background: i === 1 ? "rgba(255,255,255,0.18)" : C.blue50, display: "grid", placeItems: "center" }}>
                    <m.I size={26} color={i === 1 ? "#fff" : C.blue} />
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 25, fontWeight: 800, lineHeight: 1.15, marginTop: 24 }}>{m.t}</div>
                  <div style={{ fontSize: 17, marginTop: 8, opacity: 0.75, lineHeight: 1.3 }}>{m.d}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
