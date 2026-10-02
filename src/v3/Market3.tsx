import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, glow } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";
import { AppWindow, HOME, SIDEBAR, Stage3D, TABBAR, focus, poseAt, type Pose } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { LightStage } from "../components/Backdrop";
import { Eyebrow, Rise } from "../components/Type";
import { ISearch, ICheck, IArrowR, IHouse, IChevron, IBox, IClock } from "../components/Icons";

/* Marketplace: material is needed by a concrete work. The need comes from the estimate,
   the shelf shows the ФКР warehouse and partners, one click covers the need. */

export const M3 = {
  in: 94.0,
  head: 94.25,
  zoom: 95.55,
  clickNeed: 96.05,
  type: [96.3, 96.9] as [number, number],
  results: 97.1,
  hover: 98.2,
  provide: 99.0,
  chain: 99.6,
  toast: 101.3,
  back: 102.6,
  out: 105.8,
};

const CX = SIDEBAR;
const CY = TABBAR;

const Wool: React.FC<{ tone?: "warm" | "cool" }> = ({ tone = "warm" }) => {
  const c = tone === "warm" ? ["#FFE9A8", "#F5CF6A", "#FFF8E6"] : ["#E1E6F2", "#B9C3DA", "#F1F3F8"];
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 150">
      <rect width="200" height="150" rx="18" fill={c[2]} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${32 + i * 6} ${92 - i * 22})`}>
          <path d="M0 10 L80 0 L130 16 L50 26 Z" fill={c[0]} />
          <path d="M0 10 L50 26 L50 42 L0 26 Z" fill={c[1]} />
          <path d="M50 26 L130 16 L130 32 L50 42 Z" fill={c[1]} opacity={0.8} />
        </g>
      ))}
    </svg>
  );
};

const NEEDS = [
  { name: "Утеплитель минераловатный 100 мм", qty: "250 м²", tone: "orange" as const, status: "Не обеспечено", have: 0, total: 250 },
  { name: "Фасадная сетка армирующая", qty: "500 м²", tone: "blue" as const, status: "Заказано · 350 м² к получению", have: 350, total: 500 },
  { name: "Штукатурная смесь фасадная", qty: "80 мешков", tone: "green" as const, status: "Готово к выдаче", have: 80, total: 80 },
];
const CHAIN = ["Объект", "Работа", "Потребность", "Источник", "Получение"];

const tone = (t: "orange" | "blue" | "green") => (t === "orange" ? [C.orange50, "#c4520f", C.orange] : t === "blue" ? [C.blue50, C.blue, C.blue] : [C.green50, C.green, C.green]);

const Screen: React.FC = () => {
  const s = useSec();
  const q = "утеплитель минераловатный 100 мм";
  const typed = q.slice(0, Math.round(tw(s, M3.type, [0, q.length], (x) => x)));
  const covered = tw(s, [M3.provide + 0.3, M3.provide + 1.3], [0, 1], OUT);
  const press = tw(s, [M3.provide - 0.05, M3.provide + 0.08, M3.provide + 0.3], [0, 1, 0]);
  const needSel = s >= M3.clickNeed;
  const hover = tw(s, [M3.hover, M3.hover + 0.4], [0, 1], EXPO) * (1 - tw(s, [M3.provide + 1.4, M3.provide + 1.8], [0, 1]));
  return (
    <div style={{ position: "absolute", inset: 0, padding: "26px 30px", boxSizing: "border-box", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, height: 50 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>Маркетплейс материалов</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42, padding: "0 16px", borderRadius: 12, background: glow, fontSize: 16, fontWeight: 650 }}>
          <IHouse size={17} color={C.blue} /> ул. Нагорная, д. 20, корп. 4 · Ремонт фасада <IChevron size={15} color={C.muted} />
        </div>
      </div>

      {/* needs from the estimate */}
      <div style={{ position: "absolute", left: 30, top: 100, width: 400, bottom: 30, background: "#fff", borderRadius: 22, padding: 24, boxSizing: "border-box" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Потребность по смете</div>
        <div style={{ fontSize: 14.5, color: C.muted, marginTop: 4 }}>ПСД-НГ-001 · ремонт фасада</div>
        {NEEDS.map((n, i) => {
          const isFirst = i === 0;
          const have = isFirst ? n.total * covered : n.have;
          const st = isFirst && covered > 0.98 ? "Обеспечено · склад ФКР №2" : n.status;
          const [bg, fg, bar] = tone(isFirst && covered > 0.98 ? "green" : n.tone);
          const sel = isFirst && needSel;
          return (
            <div key={n.name} style={{ marginTop: i ? 14 : 22, padding: 16, borderRadius: 16, background: sel ? "rgba(221,230,255,0.55)" : C.surface2, boxShadow: sel ? `0 0 0 2px ${C.blue}, 0 0 30px rgba(49,107,253,0.25)` : "none" }}>
              <div style={{ fontSize: 16.5, fontWeight: 750, lineHeight: 1.25 }}>{n.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{n.qty}</span>
                <span style={{ padding: "5px 10px", borderRadius: 8, background: bg, color: fg, fontSize: 13.5, fontWeight: 750, whiteSpace: "nowrap" }}>{st}</span>
              </div>
              <div style={{ marginTop: 12, height: 8, borderRadius: 99, background: "#E7E9F1" }}>
                <div style={{ width: `${(have / n.total) * 100}%`, height: 8, borderRadius: 99, background: bar, boxShadow: isFirst && covered > 0 && covered < 1 ? `0 0 14px ${C.green}` : "none" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* search + filters */}
      <div style={{ position: "absolute", left: 454, right: 30, top: 100 }}>
        <div style={{ height: 58, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", gap: 12, padding: "0 18px", boxShadow: typed ? `0 0 0 2px ${C.blue}, 0 0 0 6px rgba(49,107,253,0.14)` : `inset 0 0 0 1px ${C.line}`, fontSize: 19 }}>
          <ISearch size={20} color={typed ? C.blue : C.muted} />
          {typed ? (
            <span style={{ fontWeight: 650 }}>
              {typed}
              {s < M3.results + 0.5 && <span style={{ display: "inline-block", width: 2, height: 22, background: C.blue, marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 3) % 2 ? 1 : 0.2 }} />}
            </span>
          ) : (
            <span style={{ color: C.faint }}>Что необходимо для ваших объектов?</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {[
            ["В наличии ФКР", true],
            ["Под заказ у партнёров", false],
            ["Фасадные работы", false],
          ].map(([l, on]) => (
            <div key={l as string} style={{ height: 38, padding: "0 14px", borderRadius: 11, display: "grid", placeItems: "center", fontSize: 15, fontWeight: on ? 700 : 550, color: on ? C.ink : C.muted, background: on ? glow : "#fff" }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* results */}
      {[
        { name: "Утеплитель минераловатный 100 мм", maker: "ТехноФас Оптима · 120 кг/м³", where: "Склад ФКР №2", eta: "1–2 дня", stock: 480, ours: true, cta: "Обеспечить 250 м²" },
        { name: "ROCKWOOL Фасад Баттс 100 мм", maker: "ROCKWOOL · для фасадных работ", where: "Партнёр ФКР", eta: "5–10 рабочих дней", stock: 0, ours: false, cta: "Запросить" },
      ].map((p, i) => {
        const k = tw(s, [M3.results + i * 0.15, M3.results + 0.7 + i * 0.15], [0, 1], EXPO);
        const top = 240 + i * 250;
        const reserved = p.ours ? 250 * covered : 0;
        const done = p.ours && covered > 0.98;
        return (
          <div key={p.name} style={{ position: "absolute", left: 454, right: 30, top, height: 230, background: "#fff", borderRadius: 22, padding: 22, boxSizing: "border-box", display: "flex", gap: 24, opacity: k, translate: `0 ${(1 - k) * 50}px`, boxShadow: p.ours && hover > 0 ? `0 0 0 2px ${C.blue}, 0 30px 60px -30px rgba(49,107,253,0.5)` : "0 1px 2px rgba(0,2,48,0.04)" }}>
            <div style={{ width: 170, height: 186 }}>
              <Wool tone={p.ours ? "warm" : "cool"} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: C.muted }}>УТЕПЛИТЕЛЬ</div>
              <div style={{ fontSize: 23, fontWeight: 800, marginTop: 4, letterSpacing: "-0.01em" }}>{p.name}</div>
              <div style={{ fontSize: 15, color: C.muted, marginTop: 4 }}>{p.maker}</div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 14.5, fontWeight: 650, whiteSpace: "nowrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, background: p.ours ? C.green50 : C.blue50, color: p.ours ? C.green : C.blue, fontWeight: 800 }}>
                  {p.ours ? <IBox size={16} color={C.green} /> : <IArrowR size={16} color={C.blue} />}
                  {p.ours ? "В наличии ФКР" : "Под заказ"}
                </span>
                <span style={{ color: C.ink2 }}>{p.where}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted }}>
                  <IClock size={16} color={C.muted} /> {p.eta}
                </span>
              </div>
              {p.ours && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", fontSize: 14, color: C.muted, fontWeight: 600 }}>
                    <span>Остаток на складе</span>
                    <span style={{ marginLeft: "auto", color: C.ink, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                      {Math.round(480 - reserved)} м² {reserved > 0 && <span style={{ color: C.orange }}>· 250 м² в резерве</span>}
                    </span>
                  </div>
                  <div style={{ display: "flex", marginTop: 8, height: 10, borderRadius: 99, background: "#E7E9F1", overflow: "hidden" }}>
                    <div style={{ width: `${((480 - reserved) / 480) * 100}%`, background: C.green, boxShadow: hover > 0 ? `0 0 16px ${C.green}` : "none" }} />
                    <div style={{ width: `${(reserved / 480) * 100}%`, background: C.orange }} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ width: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, fontWeight: 800, background: done ? C.green : p.ours ? C.blue : "#fff", color: p.ours ? "#fff" : C.blue, boxShadow: p.ours ? `0 12px 26px -10px ${done ? "rgba(15,138,95,0.6)" : "rgba(49,107,253,0.7)"}` : `inset 0 0 0 1.5px ${C.blue}`, scale: p.ours ? String(1 - press * 0.06) : undefined }}>
                {done ? (
                  <>
                    <ICheck size={18} color="#fff" stroke={3} /> Обеспечено
                  </>
                ) : (
                  p.cta
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* the chain that closes the need */}
      {s >= M3.chain - 0.2 && (
        <div style={{ position: "absolute", left: 454, right: 30, top: 760, height: 120, background: "#fff", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: tw(s, [M3.chain - 0.2, M3.chain + 0.2], [0, 1]) }}>
          {CHAIN.map((c, i) => {
            const on = s >= M3.chain + i * 0.28;
            const p = pop(s, M3.chain + i * 0.28, 0.45);
            return (
              <React.Fragment key={c}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px", borderRadius: 12, background: on ? glow : "transparent", fontSize: 17, fontWeight: on ? 800 : 550, color: on ? C.ink : C.faint, scale: on ? String(0.9 + 0.1 * Math.max(0.6, p)) : undefined }}>
                  {on && <ICheck size={16} color={C.blue} stroke={3} />}
                  {c}
                </div>
                {i < CHAIN.length - 1 && <IArrowR size={16} color={on ? C.blue : C.faint} />}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Market3: React.FC = () => {
  const s = useSec();
  const keys: [number, Pose][] = [
    [94.0, { ...HOME, x: 1240, y: 900, s: 0.5, rx: 24, ry: 0, o: 0, blur: 20 }],
    [94.7, { ...HOME }],
    [95.4, { ...HOME, s: 0.68, x: 1232 }],
    [96.0, focus(560, 470, 1.15)],
    [96.9, focus(820, 400, 1.12)],
    [98.3, focus(900, 420, 1.14)],
    [99.4, focus(800, 520, 1.06)],
    [101.0, focus(820, 600, 1.02)],
    [102.6, focus(820, 560, 1.0)],
    [103.4, { ...HOME, x: 1270, s: 0.64 }],
    [105.8, { ...HOME, x: 1262, s: 0.66 }],
  ];
  const pose = poseAt(s, keys, (x) => (s < 94.7 ? OUT(x) : INOUT(x)));
  const ent = tw(s, [M3.in, M3.in + 0.4], [0, 1]);
  const out = tw(s, [M3.out, M3.out + 0.5], [0, 1], IN);
  const toast = tw(s, [M3.toast, M3.toast + 0.5], [0, 1], EXPO) * (1 - tw(s, [103.0, 103.4], [0, 1]));
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: ent * (1 - out) }}>
      <LightStage glowX={0.6} />
      <div style={{ position: "absolute", left: 96, top: 330, width: 560 }}>
        <Eyebrow n="06" label="Маркетплейс" at={M3.head} out={95.4} />
        <div style={{ height: 26 }} />
        <Rise text={"Склад ФКР и партнёры —\nв одной витрине"} at={M3.head + 0.1} out={95.35} size={60} weight={800} highlight={["в", "одной", "витрине"]} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 330, width: 520 }}>
        <Rise text={"Материал нужен\nконкретной работе"} at={103.5} size={60} weight={800} highlight={["конкретной", "работе"]} />
        <div style={{ marginTop: 22, fontSize: 25, color: C.muted, lineHeight: 1.35, opacity: tw(s, [103.9, 104.4], [0, 1]) }}>Потребность из сметы закрывается со склада ФКР или через партнёра</div>
      </div>
      <Stage3D pose={pose}>
        <AppWindow nav="market" role="Подрядчик" roleSub="ООО «Городские системы»" tabs={[{ id: "m", label: "Маркетплейс", icon: "store", active: true }]}>
          <Screen />
        </AppWindow>
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor
            keys={[
              [95.3, 1100, 800],
              [95.95, CX + 230, CY + 245],
              [96.9, CX + 300, CY + 330],
              [98.1, CX + 1000, CY + 440],
              [98.9, CX + 1200, CY + 423],
              [100.0, CX + 1100, CY + 640],
              [101.5, CX + 900, CY + 900],
            ]}
            clicks={[M3.clickNeed, M3.provide]}
            scale={1 / pose.s}
            show={[95.2, 101.4]}
          />
        </div>
      </Stage3D>
      {toast > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", opacity: toast, translate: `0 ${(1 - toast) * 30}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 28px", borderRadius: 20, background: C.ink, color: "#fff", fontSize: 26, fontWeight: 650, boxShadow: "0 24px 50px -20px rgba(0,2,48,0.5), 0 0 60px rgba(49,107,253,0.35)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 99, background: C.green, display: "grid", placeItems: "center" }}>
              <ICheck size={20} color="#fff" stroke={3} />
            </span>
            Потребность P-2838 обеспечена · склад ФКР, 1–2 дня
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
