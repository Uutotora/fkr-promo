import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, glow } from "../theme";
import { EXPO, IN, INOUT, OUT, pop, tw, useSec } from "../lib";
import { AppWindow, HOME, SIDEBAR, Stage3D, TABBAR, focus, poseAt, type Pose } from "../components/AppWindow";
import { Cursor } from "../components/Cursor";
import { LightStage } from "../components/Backdrop";
import { Eyebrow, Rise } from "../components/Type";
import { ISearch, ICheck, IHouse, IChevron, IClock, SbIcon, IFile } from "../components/Icons";

/* Маркет ФКР: a real e-commerce shelf for capital-repair materials — big search with
   suggestions, categories, filters, product grid with prices and stock, «В потребность». */

export const MK4 = {
  in: 94.0,
  head: 94.25,
  clickSearch: 96.05,
  type: [96.3, 96.8] as [number, number],
  suggest: 96.45,
  pick: 97.0,
  results: 97.15,
  hover: 98.2,
  add: 99.0,
  popover: 99.55,
  chain: 99.9,
  toast: 101.3,
  out: 105.8,
};

const CX = SIDEBAR;
const CY = TABBAR;

const Radiator: React.FC<{ sections?: number; tone?: string; bg?: string }> = ({ sections = 10, tone = "#E9EDF7", bg = "#F4F6FB" }) => (
  <svg width="100%" height="100%" viewBox="0 0 220 140">
    <rect width="220" height="140" rx="16" fill={bg} />
    <ellipse cx={110} cy={124} rx={80} ry={6} fill="rgba(0,2,48,0.08)" />
    {Array.from({ length: sections }, (_, i) => {
      const w = 140 / sections;
      const x = 40 + i * w;
      return (
        <g key={i}>
          <rect x={x + 1} y={28} width={w - 3} height={90} rx={w / 2.6} fill={tone} stroke="#C5CCE0" strokeWidth={1.2} />
          <rect x={x + w / 2 - 1} y={34} width={2} height={78} fill="#fff" opacity={0.8} />
        </g>
      );
    })}
    <rect x={36} y={38} width={148} height={6} rx={3} fill="#D3D9EA" />
    <rect x={36} y={100} width={148} height={6} rx={3} fill="#D3D9EA" />
  </svg>
);

const SmallItem: React.FC<{ kind: number }> = ({ kind }) => (
  <svg width="100%" height="100%" viewBox="0 0 120 80">
    <rect width="120" height="80" rx="12" fill="#F4F6FB" />
    {kind === 0 && <path d="M30 50h60M40 50V30h40v20" stroke="#8E9AC0" strokeWidth={6} fill="none" strokeLinecap="round" />}
    {kind === 1 && (
      <g>
        <circle cx={60} cy={40} r={18} fill="#E1E6F2" stroke="#8E9AC0" strokeWidth={4} />
        <path d="M60 40l9-8" stroke={C.blue} strokeWidth={4} strokeLinecap="round" />
      </g>
    )}
    {kind === 2 && (
      <g>
        <rect x={50} y={22} width={20} height={36} rx={6} fill="#E1E6F2" stroke="#8E9AC0" strokeWidth={4} />
        <circle cx={60} cy={32} r={4} fill={C.orange} />
      </g>
    )}
    {kind === 3 && <path d="M28 40h64M36 32v16M84 32v16" stroke="#8E9AC0" strokeWidth={6} strokeLinecap="round" />}
  </svg>
);

const CATS: [string, React.ReactNode][] = [
  ["Радиаторы", <g key="r">{[0, 1, 2, 3].map((i) => <rect key={i} x={8 + i * 7} y={8} width={5} height={20} rx={2.5} fill="currentColor" />)}</g>],
  ["Утеплители", <g key="u"><path d="M6 22l14-6 14 6-14 6z" fill="currentColor" /><path d="M6 16l14-6 14 6-14 6z" fill="currentColor" opacity={0.6} /></g>],
  ["Смеси", <path key="s" d="M12 8h16l3 22H9z" fill="currentColor" />],
  ["Сетки", <path key="n" d="M6 8l28 22M6 30L34 8M14 8l20 16M6 16l20 14" stroke="currentColor" strokeWidth={2.4} fill="none" />],
  ["Трубы", <path key="t" d="M6 14h22a6 6 0 0 1 0 12H18" stroke="currentColor" strokeWidth={5} fill="none" strokeLinecap="round" />],
  ["Кровля", <path key="k" d="M4 24L20 10l16 14" stroke="currentColor" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />],
  ["Окна", <g key="o"><rect x={9} y={7} width={22} height={24} rx={2} stroke="currentColor" strokeWidth={3} fill="none" /><path d="M20 7v24M9 19h22" stroke="currentColor" strokeWidth={3} /></g>],
  ["Электрика", <path key="e" d="M22 4L10 22h9l-2 12 12-18h-9z" fill="currentColor" />],
];

const ITEMS = [
  { name: "Радиатор биметаллический, 10 секций", code: "ТМЦ-000317", price: "8 600 ₽", stock: "46 шт на складе ФКР", eta: "1–2 дня", ours: true, smeta: true, sec: 10 },
  { name: "Радиатор биметаллический, 12 секций", code: "ТМЦ-000318", price: "10 320 ₽", stock: "18 шт на складе ФКР", eta: "1–2 дня", ours: true, smeta: false, sec: 12 },
  { name: "Радиатор биметаллический, 10 секций · партнёр", code: "", price: "8 950 ₽", stock: "Партнёр ФКР", eta: "3–5 дней", ours: false, smeta: true, sec: 10 },
  { name: "Радиатор алюминиевый, 10 секций", code: "", price: "6 900 ₽", stock: "Партнёр ФКР", eta: "5–7 дней", ours: false, smeta: false, sec: 10 },
];
const ALSO = ["Кронштейны настенные", "Терморегулятор", "Кран Маевского", "Заглушки и переходники"];
const SUGG = ["радиатор биметаллический 10 секций", "радиатор биметаллический 12 секций", "радиатор алюминиевый", "в категории «Радиаторы»", "ТМЦ-000317 · по смете ЛСР-НГ-001"];
const CHAIN = ["Объект", "Работа", "Потребность", "Источник", "Получение"];

const GRID_X = 304;
const CW = 244;
const cardX = (i: number) => GRID_X + i * (CW + 16);

const Screen: React.FC = () => {
  const s = useSec();
  const q = "радиатор";
  const typedN = Math.round(tw(s, MK4.type, [0, q.length], (x) => x));
  const picked = s >= MK4.pick;
  const query = picked ? SUGG[0] : q.slice(0, typedN);
  const sugg = tw(s, [MK4.suggest, MK4.suggest + 0.3], [0, 1], EXPO) * (1 - tw(s, [MK4.pick, MK4.pick + 0.2], [0, 1]));
  const hover = tw(s, [MK4.hover, MK4.hover + 0.35], [0, 1], EXPO);
  const added = s >= MK4.add + 0.1;
  const press = tw(s, [MK4.add - 0.05, MK4.add + 0.08, MK4.add + 0.3], [0, 1, 0]);
  const fly = tw(s, [MK4.add + 0.05, MK4.add + 0.6], [0, 1], INOUT);
  const badge = pop(s, MK4.add + 0.6, 0.5);
  const pop1 = tw(s, [MK4.popover, MK4.popover + 0.45], [0, 1], EXPO);
  const done = s >= MK4.chain + CHAIN.length * 0.25 + 0.2;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      {/* top bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 88, background: "#fff", display: "flex", alignItems: "center", padding: "0 24px", gap: 20, boxShadow: "0 1px 0 rgba(0,2,48,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 250 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: C.blue, display: "grid", placeItems: "center", color: "#fff", boxShadow: "0 8px 20px -6px rgba(49,107,253,0.6)" }}>
            <SbIcon name="store" size={22} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 22, fontWeight: 850 }}>Маркет ФКР</div>
            <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>материалы для капремонта</div>
          </div>
        </div>
        <div style={{ flex: 1, height: 56, borderRadius: 16, display: "flex", alignItems: "center", background: "#fff", boxShadow: s >= MK4.clickSearch ? `0 0 0 2.5px ${C.blue}, 0 0 0 7px rgba(49,107,253,0.14)` : `0 0 0 2px ${C.blue}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 12px", marginLeft: 8, borderRadius: 10, background: C.surface2, fontSize: 14.5, fontWeight: 650, color: C.ink2, whiteSpace: "nowrap" }}>
            Все категории <IChevron size={14} color={C.muted} />
          </div>
          <div style={{ flex: 1, padding: "0 14px", fontSize: 19, fontWeight: 600, color: query ? C.ink : C.faint, whiteSpace: "nowrap", overflow: "hidden" }}>
            {query || "Искать материалы, артикулы, ТМЦ"}
            {s >= MK4.clickSearch && s < MK4.results && <span style={{ display: "inline-block", width: 2, height: 22, background: C.blue, marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(s * 3) % 2 ? 1 : 0.2 }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 24px", borderRadius: "0 16px 16px 0", background: C.blue, color: "#fff", fontSize: 17, fontWeight: 800 }}>
            <ISearch size={19} color="#fff" /> Найти
          </div>
        </div>
        {[
          ["Потребности", 3],
          ["Заявки", 0],
        ].map(([l, n], i) => (
          <div key={l as string} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 96, color: i === 0 && added ? C.blue : C.ink2 }}>
            {i === 0 ? <SbIcon name="package" size={26} /> : <IFile size={26} color={C.ink2} />}
            <div style={{ fontSize: 13.5, fontWeight: 650 }}>{l}</div>
            {i === 0 && (
              <div style={{ position: "absolute", right: 18, top: -6, minWidth: 22, height: 22, borderRadius: 99, background: added ? C.green : C.orange, color: "#fff", fontSize: 12.5, fontWeight: 800, display: "grid", placeItems: "center", scale: String(added ? 1 + 0.3 * Math.max(0, badge - 1 + 1) * (1 - tw(s, [MK4.add + 0.6, MK4.add + 1.1], [0, 1])) : 1), boxShadow: added ? `0 0 14px ${C.green}` : "none" }}>
                {added ? <ICheck size={13} color="#fff" stroke={3} /> : n}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* categories */}
      <div style={{ position: "absolute", left: 24, right: 24, top: 104, height: 92, display: "flex", gap: 12 }}>
        {CATS.map(([l, icon], i) => {
          const on = picked && i === 0;
          return (
            <div key={l} style={{ flex: 1, background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", boxShadow: on ? `0 0 0 2px ${C.blue}, 0 0 24px rgba(49,107,253,0.25)` : "none" }}>
              <div style={{ width: 52, height: 52, borderRadius: 99, background: on ? C.blue : C.blue50, color: on ? "#fff" : C.blue, display: "grid", placeItems: "center" }}>
                <svg width={40} height={38} viewBox="0 0 40 38">{icon}</svg>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>{l}</div>
            </div>
          );
        })}
      </div>

      {/* filters */}
      <div style={{ position: "absolute", left: 24, top: 212, width: 264, bottom: 24, background: "#fff", borderRadius: 20, padding: 20, boxSizing: "border-box", fontSize: 15 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: C.muted }}>ОБЪЕКТ</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: glow, fontWeight: 700, fontSize: 14.5 }}>
          <IHouse size={16} color={C.blue} /> ул. Нагорная, 20 к4
        </div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: C.muted, paddingLeft: 4 }}>Ремонт системы отопления</div>
        {[
          ["НАЛИЧИЕ", [["Склад ФКР", true], ["Партнёры ФКР", true]]],
          ["СРОК ПОСТАВКИ", [["1–2 дня", true], ["до 10 дней", false]]],
        ].map(([h, opts]) => (
          <div key={h as string} style={{ marginTop: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: C.muted }}>{h as string}</div>
            {(opts as [string, boolean][]).map(([o, on]) => (
              <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontWeight: 600 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: on ? C.blue : "#fff", boxShadow: on ? "none" : `inset 0 0 0 2px ${C.line}`, display: "grid", placeItems: "center" }}>{on && <ICheck size={13} color="#fff" stroke={3} />}</span>
                {o}
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
          <span style={{ width: 40, height: 24, borderRadius: 99, background: C.blue, position: "relative", boxShadow: "0 0 14px rgba(49,107,253,0.45)" }}>
            <span style={{ position: "absolute", right: 3, top: 3, width: 18, height: 18, borderRadius: 99, background: "#fff" }} />
          </span>
          Только по смете
        </div>
        <div style={{ marginTop: 22, fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: C.muted }}>СЕКЦИЙ</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {["8", "10", "12"].map((n) => (
            <span key={n} style={{ padding: "7px 14px", borderRadius: 10, fontWeight: 700, background: n === "10" ? glow : C.surface2, color: n === "10" ? C.ink : C.muted }}>{n}</span>
          ))}
        </div>
      </div>

      {/* results */}
      <div style={{ position: "absolute", left: GRID_X, top: 218, right: 24, display: "flex", alignItems: "baseline", gap: 12, opacity: tw(s, [MK4.results, MK4.results + 0.4], [0, 1]) }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Радиаторы биметаллические</div>
        <div style={{ fontSize: 15, color: C.muted, fontWeight: 600 }}>24 товара</div>
        <div style={{ marginLeft: "auto", fontSize: 15, fontWeight: 650, color: C.ink2, display: "flex", alignItems: "center", gap: 6 }}>
          По сроку поставки <IChevron size={14} color={C.muted} />
        </div>
      </div>
      {s < MK4.results && (
        <div style={{ position: "absolute", left: GRID_X, top: 262, right: 24, height: 330, borderRadius: 20, background: "rgba(255,255,255,0.5)" }} />
      )}
      {ITEMS.map((it, i) => {
        const k = tw(s, [MK4.results + 0.05 + i * 0.1, MK4.results + 0.7 + i * 0.1], [0, 1], EXPO);
        const hov = i === 0 ? hover : 0;
        return (
          <div key={it.name} style={{ position: "absolute", left: cardX(i), top: 262, width: CW, height: 340, background: "#fff", borderRadius: 20, padding: 12, boxSizing: "border-box", opacity: Math.min(1, k * 1.4), translate: `0 ${(1 - k) * 50 - hov * 6}px`, boxShadow: hov ? `0 0 0 2px ${C.blue}, 0 26px 50px -24px rgba(49,107,253,0.55)` : "0 1px 2px rgba(0,2,48,0.04)", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", height: 138 }}>
              <Radiator sections={it.sec} tone={it.ours ? "#EEF1FA" : "#E9ECF3"} />
              <div style={{ position: "absolute", left: 8, top: 8, display: "flex", gap: 5 }}>
                <span style={{ padding: "4px 8px", borderRadius: 8, background: it.ours ? C.green : C.blue, color: "#fff", fontSize: 11.5, fontWeight: 800 }}>{it.ours ? "Склад ФКР" : "Партнёр"}</span>
                {it.smeta && <span style={{ padding: "4px 8px", borderRadius: 8, background: "#fff", color: C.blue, fontSize: 11.5, fontWeight: 800, boxShadow: `inset 0 0 0 1.5px ${C.blue}` }}>По смете</span>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
              <span style={{ fontSize: 25, fontWeight: 850, letterSpacing: "-0.02em" }}>{it.price}</span>
              <span style={{ fontSize: 13.5, color: C.muted, fontWeight: 600 }}>/ шт</span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 650, lineHeight: 1.25, marginTop: 4, minHeight: 36 }}>{it.name}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, display: "flex", gap: 8 }}>
              {it.code ? <span>{it.code}</span> : null}
              <span style={{ color: "#c98a00", fontWeight: 700 }}>★ {it.ours ? "4,9" : i === 2 ? "4,7" : "4,3"}</span>
              <span>{it.ours ? "склад ФКР" : "рейтинг поставщика"}</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: it.ours ? C.green : C.blue }}>
              <IClock size={13} color={it.ours ? C.green : C.blue} /> {it.eta} · <span style={{ color: C.muted, fontWeight: 600 }}>{it.stock}</span>
            </div>
            <div style={{ marginTop: 8, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14.5, fontWeight: 800, background: i === 0 && added ? C.green : i === 0 ? C.blue : C.blue50, color: i === 0 ? "#fff" : C.blue, scale: i === 0 ? String(1 - press * 0.06) : undefined, boxShadow: i === 0 ? `0 10px 22px -10px ${added ? "rgba(15,138,95,0.7)" : "rgba(49,107,253,0.7)"}` : "none" }}>
              {i === 0 && added ? (
                <>
                  <ICheck size={15} color="#fff" stroke={3} /> В потребности · 10 шт
                </>
              ) : (
                "В потребность"
              )}
            </div>
          </div>
        );
      })}

      {/* often bought together */}
      <div style={{ position: "absolute", left: GRID_X, top: 622, right: 24, opacity: tw(s, [MK4.results + 0.6, MK4.results + 1.0], [0, 1]) }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Часто берут вместе</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          {ALSO.map((a, i) => (
            <div key={a} style={{ width: CW, height: 150, background: "#fff", borderRadius: 18, padding: 10, boxSizing: "border-box" }}>
              <div style={{ height: 80 }}>
                <SmallItem kind={i} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{a}</div>
              <div style={{ fontSize: 12.5, color: C.green, fontWeight: 700, marginTop: 2 }}>Склад ФКР · 1–2 дня</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 28, bottom: 22, fontSize: 12.5, color: C.faint }}>Цены и остатки — демонстрационные</div>

      {/* suggestions */}
      {sugg > 0 && (
        <div style={{ position: "absolute", left: 294, top: 80, width: 640, background: "#fff", borderRadius: 18, padding: 8, boxShadow: "0 30px 60px -20px rgba(0,2,48,0.35), 0 0 0 1px rgba(0,2,48,0.06)", opacity: sugg, translate: `0 ${(1 - sugg) * -10}px` }}>
          {SUGG.map((sg, i) => {
            const hl = i === 0 && s > MK4.pick - 0.25;
            const t = Math.min(typedN, q.length);
            return (
              <div key={sg} style={{ display: "flex", alignItems: "center", gap: 12, height: 46, padding: "0 14px", borderRadius: 12, background: hl ? glow : "transparent", fontSize: 16.5, color: C.ink2 }}>
                <ISearch size={16} color={C.faint} />
                {i < 3 ? (
                  <span>
                    <b style={{ color: C.ink }}>{sg.slice(0, t)}</b>
                    {sg.slice(t)}
                  </span>
                ) : (
                  <span style={{ color: C.blue, fontWeight: 650 }}>{sg}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* the card flies into «Потребности» */}
      {fly > 0 && fly < 1 && (
        <div style={{ position: "absolute", left: cardX(0) + 20 + (1105 - cardX(0) - 20) * fly, top: 290 + (14 - 290) * fly - Math.sin(fly * Math.PI) * 120, width: 120 * (1 - fly * 0.7), height: 76 * (1 - fly * 0.7), borderRadius: 12, overflow: "hidden", boxShadow: "0 0 30px rgba(49,107,253,0.6)", opacity: 1 - tw(fly, [0.8, 1], [0, 1]) }}>
          <Radiator />
        </div>
      )}

      {/* need popover */}
      {pop1 > 0 && (
        <div style={{ position: "absolute", right: 120, top: 84, width: 430, background: "#fff", borderRadius: 22, padding: 22, boxSizing: "border-box", boxShadow: "0 40px 80px -30px rgba(0,2,48,0.45), 0 0 0 1px rgba(0,2,48,0.05), 0 0 50px rgba(49,107,253,0.18)", opacity: pop1 * (1 - tw(s, [103.2, 103.6], [0, 1])), translate: `0 ${(1 - pop1) * -16}px`, scale: String(0.96 + 0.04 * pop1), transformOrigin: "80% 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: C.muted }}>ПОТРЕБНОСТЬ P-2838</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 6 }}>Радиатор биметаллический, 10 секций</div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, fontSize: 14.5, fontWeight: 650 }}>
            <span style={{ padding: "6px 10px", borderRadius: 9, background: C.blue50, color: C.blue }}>10 шт · по смете</span>
            <span style={{ padding: "6px 10px", borderRadius: 9, background: C.green50, color: C.green }}>Склад ФКР №2 · 1–2 дня</span>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            {[
              ["Склад №2", "46 шт"],
              ["Склад №1", "12 шт"],
              ["Доставка", "08.10 · 9–12"],
            ].map(([a, b], j) => (
              <div key={a} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: j === 0 ? glow : C.surface2, fontSize: 12.5, color: C.muted, fontWeight: 600 }}>
                {a}
                <div style={{ fontSize: 15, color: C.ink, fontWeight: 800, marginTop: 2 }}>{b}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {CHAIN.map((c, i) => {
              const on = s >= MK4.chain + i * 0.25;
              return (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15.5, fontWeight: on ? 750 : 500, color: on ? C.ink : C.faint }}>
                  <span style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", background: on ? C.blue : "#fff", boxShadow: on ? "0 0 12px rgba(49,107,253,0.6)" : `inset 0 0 0 2px ${C.line}`, scale: on ? String(Math.max(0.7, pop(s, MK4.chain + i * 0.25, 0.4))) : undefined }}>{on && <ICheck size={14} color="#fff" stroke={3} />}</span>
                  {c}
                  <span style={{ marginLeft: "auto", fontSize: 13.5, color: C.muted, fontWeight: 600 }}>{["ул. Нагорная, 20 к4", "Отопление", "10 шт", "Склад ФКР №2", "1–2 дня"][i]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, height: 46, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, fontWeight: 800, background: done ? C.green : C.surface2, color: done ? "#fff" : C.faint, boxShadow: done ? "0 0 24px rgba(15,138,95,0.45)" : "none" }}>
            {done ? (
              <>
                <ICheck size={16} color="#fff" stroke={3} /> Потребность обеспечена
              </>
            ) : (
              "Проверяем наличие…"
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Market4: React.FC = () => {
  const s = useSec();
  const keys: [number, Pose][] = [
    [94.0, { ...HOME, x: 1240, y: 900, s: 0.5, rx: 24, ry: 0, o: 0, blur: 20 }],
    [94.7, { ...HOME }],
    [95.4, { ...HOME, s: 0.68, x: 1232 }],
    [96.0, focus(840, 330, 1.12)],
    [97.1, focus(860, 360, 1.1)],
    [98.0, focus(760, 470, 1.12)],
    [99.2, focus(900, 400, 1.1)],
    [100.0, focus(1180, 380, 1.18)],
    [101.6, focus(1190, 390, 1.2)],
    [102.8, focus(820, 520, 1.0)],
    [103.6, { ...HOME, x: 1270, s: 0.64 }],
    [105.8, { ...HOME, x: 1262, s: 0.66 }],
  ];
  const pose = poseAt(s, keys, (x) => (s < 94.7 ? OUT(x) : INOUT(x)));
  const ent = tw(s, [MK4.in, MK4.in + 0.4], [0, 1]);
  const out = tw(s, [MK4.out, MK4.out + 0.5], [0, 1], IN);
  const toast = tw(s, [MK4.toast, MK4.toast + 0.5], [0, 1], EXPO) * (1 - tw(s, [103.0, 103.4], [0, 1]));
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: ent * (1 - out) }}>
      <LightStage glowX={0.6} />
      <div style={{ position: "absolute", left: 96, top: 330, width: 560 }}>
        <Eyebrow n="06" label="Маркетплейс" at={MK4.head} out={95.4} />
        <div style={{ height: 26 }} />
        <Rise text={"Всё для объекта —\nв одной витрине"} at={MK4.head + 0.1} out={95.35} size={60} weight={800} highlight={["в", "одной", "витрине"]} />
        <div style={{ marginTop: 22, fontSize: 25, color: C.muted, lineHeight: 1.35 }}>
          <span style={{ opacity: tw(s, [94.8, 95.2], [0, 1]) * (1 - tw(s, [95.4, 95.7], [0, 1])) }}>Склад ФКР и партнёры, цены, сроки и проверка по смете</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 96, top: 330, width: 520 }}>
        <Rise text={"Материал нужен\nконкретной работе"} at={103.5} size={60} weight={800} highlight={["конкретной", "работе"]} />
        <div style={{ marginTop: 22, fontSize: 25, color: C.muted, lineHeight: 1.35, opacity: tw(s, [103.9, 104.4], [0, 1]) }}>Потребность из сметы закрывается со склада ФКР или через партнёра</div>
      </div>
      <Stage3D pose={pose}>
        <AppWindow nav="market" role="Подрядчик" roleSub="ООО «Городские системы»" tabs={[{ id: "m", label: "Маркет ФКР", icon: "store", active: true }]}>
          <Screen />
        </AppWindow>
        <div style={{ position: "absolute", inset: 0 }}>
          <Cursor
            keys={[
              [95.3, 1100, 800],
              [95.95, CX + 600, CY + 44],
              [96.85, CX + 560, CY + 70],
              [96.95, CX + 520, CY + 104],
              [97.6, CX + 600, CY + 330],
              [98.15, CX + cardX(0) + 140, CY + 380],
              [98.95, CX + cardX(0) + 122, CY + 262 + 340 - 32],
              [100.0, CX + 1000, CY + 520],
              [101.5, CX + 1100, CY + 700],
            ]}
            clicks={[MK4.clickSearch, MK4.pick, MK4.add]}
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
            10 радиаторов по смете — со склада ФКР за 1–2 дня
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
