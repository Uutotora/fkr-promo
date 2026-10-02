import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, glow } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";
import { AppWindow, HOME, SIDEBAR, Stage3D, TABBAR, focus, poseAt, type Pose } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { LightStage } from "../components/Backdrop";
import { Eyebrow, Rise } from "../components/Type";
import { ISearch, ICheck, IArrowR, IX, IHouse } from "../components/Icons";

/* Marketplace — the next stage of the ecosystem (concept: unit-fkr-platform, section 07):
   material is needed by a concrete work; one need can be covered from the ФКР warehouse
   or through a partner. Redrawn in the prototype's language. */

export const MK = {
  in: 80.0,
  head: 80.25,
  zoom: 81.25,
  clickSearch: 81.6,
  type: [81.85, 82.45] as [number, number],
  cards: 82.65,
  pick: 83.6,
  drawer: 83.85,
  qty: [84.45, 84.85] as [number, number],
  submit: 85.6,
  chain: 85.95,
  toast: 87.75,
  back: 88.3,
  out: 89.6,
};

const CX = SIDEBAR;
const CY = TABBAR;
const CARD_W = 309;
const cardX = (i: number) => 30 + i * (CARD_W + 18);

/** Simple product illustrations so the shelf feels real without photos. */
const Swatch: React.FC<{ kind: "wool" | "rock" | "mesh" | "bag" }> = ({ kind }) => {
  if (kind === "mesh")
    return (
      <svg width="100%" height="100%" viewBox="0 0 260 120">
        <rect width="260" height="120" rx="14" fill="#EEF2FF" />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`a${i}`} x1={20 + i * 15} y1={14} x2={20 + i * 15 - 30} y2={106} stroke="#7EA2FF" strokeWidth={2} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`b${i}`} x1={-10 + i * 15} y1={14} x2={20 + i * 15} y2={106} stroke="#7EA2FF" strokeWidth={2} opacity={0.6} />
        ))}
      </svg>
    );
  if (kind === "bag")
    return (
      <svg width="100%" height="100%" viewBox="0 0 260 120">
        <rect width="260" height="120" rx="14" fill="#FFF1E7" />
        <path d="M95 26h70l10 80H85z" fill="#FD8431" />
        <rect x="104" y="48" width="52" height="26" rx="5" fill="#fff" opacity="0.9" />
        <path d="M95 26c10 6 60 6 70 0" stroke="#d9621a" strokeWidth="4" fill="none" />
      </svg>
    );
  const c = kind === "wool" ? ["#FFE9A8", "#F5CF6A"] : ["#E1E6F2", "#B9C3DA"];
  return (
    <svg width="100%" height="100%" viewBox="0 0 260 120">
      <rect width="260" height="120" rx="14" fill={kind === "wool" ? "#FFF8E6" : "#F1F3F8"} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${60 + i * 8} ${70 - i * 18})`}>
          <path d="M0 10 L90 0 L140 18 L50 28 Z" fill={c[0]} />
          <path d="M0 10 L50 28 L50 44 L0 26 Z" fill={c[1]} />
          <path d="M50 28 L140 18 L140 34 L50 44 Z" fill={c[1]} opacity={0.8} />
        </g>
      ))}
    </svg>
  );
};

const ITEMS = [
  { kind: "wool" as const, cat: "УТЕПЛИТЕЛЬ", name: "Утеплитель минераловатный 100 мм", maker: "ТехноФас Оптима", spec: "120 кг/м³ · 100 мм", stock: true, qty: "480 м² доступно", where: "Склад ФКР №2 · 1–2 дня", cta: "Выбрать" },
  { kind: "rock" as const, cat: "УТЕПЛИТЕЛЬ", name: "ROCKWOOL Фасад Баттс 100 мм", maker: "ROCKWOOL", spec: "Для фасадных работ", stock: false, qty: "Поставка через партнёров", where: "Партнёр ФКР · 5–10 дней", cta: "Создать заявку" },
  { kind: "mesh" as const, cat: "СЕТКА", name: "Фасадная сетка армирующая", maker: "По спецификации", spec: "Единица учёта: м²", stock: true, qty: "350 м² доступно", where: "Склад ФКР №2 · 1–2 дня", cta: "Выбрать" },
  { kind: "bag" as const, cat: "СМЕСЬ", name: "Штукатурная смесь фасадная", maker: "По спецификации", spec: "Единица учёта: мешок", stock: true, qty: "80 мешков доступно", where: "Склад ФКР №2 · 1–2 дня", cta: "Выбрать" },
];

const CHAIN = ["Объект", "Работа", "Потребность", "Источник", "Получение"];

const MarketScreen: React.FC = () => {
  const s = useSec();
  const q = "утеплитель".slice(0, Math.round(tw(s, [MK.type[0], MK.type[1]], [0, 10], (x) => x)));
  const focusSearch = s >= MK.clickSearch;
  const drawer = tw(s, [MK.drawer, MK.drawer + 0.55], [0, 1], EXPO);
  const qty = "250".slice(0, Math.round(tw(s, [MK.qty[0], MK.qty[1]], [0, 3], (x) => x)));
  const pickPress = tw(s, [MK.pick - 0.05, MK.pick + 0.08, MK.pick + 0.3], [0, 1, 0]);
  const subPress = tw(s, [MK.submit - 0.05, MK.submit + 0.08, MK.submit + 0.3], [0, 1, 0]);
  const done = tw(s, [MK.chain + CHAIN.length * 0.3, MK.chain + CHAIN.length * 0.3 + 0.4], [0, 1], EXPO);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "26px 30px", boxSizing: "border-box", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", height: 50 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", flex: 1 }}>Обеспечение ТМЦ</div>
        <div style={{ display: "flex", background: "#fff", borderRadius: 12, padding: 4, gap: 2 }}>
          <div style={{ padding: "10px 18px", borderRadius: 9, fontSize: 15.5, fontWeight: 500, color: C.muted }}>Мои объекты</div>
          <div style={{ padding: "10px 18px", borderRadius: 9, fontSize: 15.5, fontWeight: 700, background: glow }}>Маркетплейс</div>
        </div>
      </div>

      <div style={{ marginTop: 20, height: 250, background: "#fff", borderRadius: 20, padding: "28px 30px", boxSizing: "border-box", display: "flex", gap: 40 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", color: C.muted }}>ДОБРЫЙ ДЕНЬ, АЛЕКСЕЙ</div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>Что необходимо для ваших объектов?</div>
          <div
            style={{
              marginTop: 24,
              width: 760,
              height: 58,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 18px",
              boxSizing: "border-box",
              background: C.surface2,
              boxShadow: focusSearch ? `0 0 0 2px ${C.blue}, 0 0 0 6px rgba(49,107,253,0.15)` : `inset 0 0 0 1px ${C.line}`,
              fontSize: 19,
            }}
          >
            <ISearch size={20} color={focusSearch ? C.blue : C.muted} />
            {q ? (
              <span style={{ fontWeight: 650 }}>
                {q}
                <span style={{ display: "inline-block", width: 2, height: 22, background: C.blue, marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 3) % 2 ? 1 : 0.2 }} />
              </span>
            ) : (
              <span style={{ color: C.faint }}>Материал, артикул или работа</span>
            )}
          </div>
        </div>
        <div style={{ width: 380, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <div style={{ fontSize: 17, color: C.ink2, lineHeight: 1.4, fontWeight: 550 }}>Наличие ФКР и заказ через партнёра — два маршрута одной потребности</div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: C.green50, color: C.green, fontWeight: 700, fontSize: 15 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9, background: C.green }} />В наличии ФКР
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: C.blue50, color: C.blue, fontWeight: 700, fontSize: 15 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9, background: C.blue }} />Под заказ
            </span>
          </div>
        </div>
      </div>

      {ITEMS.map((it, i) => {
        const at = MK.cards + i * 0.12;
        const k = tw(s, [at, at + 0.7], [0, 1], EXPO);
        const picked = i === 0 && s >= MK.pick;
        return (
          <div
            key={it.name}
            style={{
              position: "absolute",
              left: cardX(i),
              top: 370,
              width: CARD_W,
              height: 360,
              background: "#fff",
              borderRadius: 20,
              padding: 18,
              boxSizing: "border-box",
              opacity: Math.min(1, k * 1.4) * (1 - drawer * (i > 1 ? 0.5 : 0)),
              translate: `0 ${(1 - k) * 60}px`,
              scale: String(0.94 + 0.06 * k),
              boxShadow: picked ? `0 0 0 2px ${C.blue}, 0 20px 40px -20px rgba(49,107,253,0.6)` : "0 1px 2px rgba(0,2,48,0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 112 }}>
              <Swatch kind={it.kind} />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em", color: C.muted, marginTop: 14 }}>{it.cat}</div>
            <div style={{ fontSize: 18.5, fontWeight: 750, lineHeight: 1.2, marginTop: 4 }}>{it.name}</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
              {it.maker} · {it.spec}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700, color: it.stock ? C.green : C.blue }}>
              <span style={{ width: 8, height: 8, borderRadius: 9, background: it.stock ? C.green : C.blue }} />
              {it.stock ? "В наличии ФКР" : "Под заказ"} <span style={{ color: C.ink2, fontWeight: 600 }}>· {it.qty}</span>
            </div>
            <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{it.where}</div>
            <div
              style={{
                marginTop: 12,
                height: 42,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 700,
                background: it.stock ? C.blue : "#fff",
                color: it.stock ? "#fff" : C.blue,
                boxShadow: it.stock ? "none" : `inset 0 0 0 1.5px ${C.blue}`,
                scale: i === 0 ? String(1 - pickPress * 0.06) : undefined,
              }}
            >
              {it.cta} <IArrowR size={16} color={it.stock ? "#fff" : C.blue} />
            </div>
          </div>
        );
      })}

      {/* the chain that closes the need */}
      {s >= MK.chain - 0.2 && (
        <div style={{ position: "absolute", left: 30, top: 760, width: 770, height: 92, background: "#fff", borderRadius: 20, display: "flex", alignItems: "center", padding: "0 22px", boxSizing: "border-box", gap: 8, opacity: tw(s, [MK.chain - 0.2, MK.chain + 0.2], [0, 1]) }}>
          {CHAIN.map((c, i) => {
            const on = s >= MK.chain + i * 0.3;
            const p = pop(s, MK.chain + i * 0.3, 0.45);
            return (
              <React.Fragment key={c}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", borderRadius: 11, background: on ? glow : "transparent", fontSize: 16, fontWeight: on ? 750 : 500, color: on ? C.ink : C.faint, scale: on ? String(0.9 + 0.1 * Math.max(0.6, p)) : undefined }}>
                  {on && <ICheck size={15} color={C.blue} stroke={3} />}
                  {c}
                </div>
                {i < CHAIN.length - 1 && <IArrowR size={15} color={on ? C.blue : C.faint} />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* need drawer */}
      {drawer > 0 && (
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 540, background: "#fff", boxShadow: "-30px 0 60px -30px rgba(0,2,48,0.35)", translate: `${(1 - drawer) * 560}px 0`, padding: "28px 30px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, flex: 1 }}>Новая потребность</div>
            <IX size={20} color={C.muted} />
          </div>
          {[
            ["Объект", "ул. Нагорная, д. 20, корп. 4"],
            ["Работа", "Ремонт фасада"],
            ["Материал", "Утеплитель минераловатный 100 мм"],
          ].map(([l, v], i) => (
            <div key={l} style={{ marginTop: i ? 16 : 26, opacity: tw(s, [MK.drawer + 0.2 + i * 0.08, MK.drawer + 0.6 + i * 0.08], [0, 1]) }}>
              <div style={{ fontSize: 14, color: C.muted }}>{l}</div>
              <div style={{ marginTop: 6, height: 50, borderRadius: 12, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontSize: 16.5, fontWeight: 650 }}>
                {i === 0 && <IHouse size={17} color={C.blue} />}
                {v}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, color: C.muted }}>Количество</div>
            <div style={{ marginTop: 6, height: 56, borderRadius: 12, boxShadow: s >= MK.qty[0] - 0.2 ? `inset 0 0 0 2px ${C.blue}, 0 0 0 5px rgba(49,107,253,0.15)` : `inset 0 0 0 1px ${C.line}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 24, fontWeight: 800 }}>
              {qty}
              <span style={{ fontSize: 16, color: C.muted, fontWeight: 600, marginLeft: 8 }}>м²</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 14, color: C.green, fontWeight: 700 }}>доступно 480 м²</span>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "16px 16px", borderRadius: 14, background: C.green50 }}>
            <div style={{ fontSize: 14, color: C.green, fontWeight: 700 }}>Источник</div>
            <div style={{ fontSize: 17, fontWeight: 750, marginTop: 4 }}>Склад ФКР №2 · получение 1–2 дня</div>
          </div>
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 34, height: 56, borderRadius: 14, background: C.blue, color: "#fff", display: "grid", placeItems: "center", fontSize: 17.5, fontWeight: 750, scale: String(1 - subPress * 0.05), boxShadow: "0 14px 30px -12px rgba(49,107,253,0.7)" }}>
            {done > 0.5 ? "✓ Потребность обеспечена" : "Оформить потребность"}
          </div>
        </div>
      )}
    </div>
  );
};

export const Market: React.FC = () => {
  const s = useSec();
  const keys: [number, Pose][] = [
    [80.0, { ...HOME, x: 2900, ry: -28, blur: 26 }],
    [80.65, { ...HOME }],
    [81.05, { ...HOME, s: 0.68, x: 1232 }],
    [81.7, focus(760, 470, 1.12)],
    [83.5, focus(740, 520, 1.1)],
    [84.2, focus(1120, 560, 1.12)],
    [85.8, focus(1120, 590, 1.1)],
    [86.4, focus(820, 640, 1.04)],
    [87.6, focus(820, 600, 1.0)],
    [88.6, { ...HOME, x: 1150, ry: -6, s: 0.7 }],
    [89.6, { ...HOME, x: 1150, ry: -6, s: 0.71 }],
  ];
  const pose = poseAt(s, keys, (x) => (s < 80.65 ? OUT(x) : INOUT(x)));
  const out = tw(s, [MK.out, MK.out + 0.6], [0, 1], IN);
  const toast = tw(s, [MK.toast, MK.toast + 0.5], [0, 1], EXPO) * (1 - tw(s, [89.2, 89.6], [0, 1]));
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: 1 - out }}>
      <LightStage glowX={0.6} />
      <div style={{ position: "absolute", left: 96, top: 330, width: 560 }}>
        <Eyebrow n="06" label="Маркетплейс" at={MK.head} out={81.1} />
        <div style={{ height: 26 }} />
        <Rise text={"Склад ФКР и партнёры —\nв одной витрине"} at={MK.head + 0.1} out={81.05} size={62} weight={800} highlight={["в", "одной", "витрине"]} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 330, width: 560 }}>
        <Rise text={"Материал нужен\nконкретной работе"} at={88.45} size={62} weight={800} highlight={["конкретной", "работе"]} />
        <div style={{ marginTop: 22, fontSize: 25, color: C.muted, lineHeight: 1.35, opacity: tw(s, [88.8, 89.3], [0, 1]) }}>Объект → работа → потребность → источник → получение</div>
      </div>
      <Stage3D pose={pose}>
        <AppWindow nav="market" role="Подрядчик" roleSub="ООО «Городские системы»" tabs={[{ id: "m", label: "Маркетплейс", icon: "store", active: true }]}>
          <MarketScreen />
        </AppWindow>
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor
            keys={[
              [81.0, 1000, 760],
              [81.55, CX + 440, CY + 239],
              [82.6, CX + 460, CY + 300],
              [83.5, CX + cardX(0) + 150, CY + 370 + 360 - 39],
              [84.3, CX + 1100, CY + 520],
              [85.5, CX + 1352 - 270, CY + 944 - 62],
              [86.4, CX + 900, CY + 820],
              [87.8, CX + 700, CY + 880],
            ]}
            clicks={[MK.clickSearch, MK.pick, MK.qty[0] - 0.25, MK.submit]}
            scale={1 / pose.s}
            show={[80.9, 87.6]}
          />
        </div>
      </Stage3D>
      {toast > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", opacity: toast, translate: `0 ${(1 - toast) * 30}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 28px", borderRadius: 20, background: C.ink, color: "#fff", fontSize: 26, fontWeight: 650, boxShadow: "0 24px 50px -20px rgba(0,2,48,0.5)" }}>
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
