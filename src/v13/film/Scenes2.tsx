import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, FONT } from "../../theme";
import { clamp01, easeInOut, easeOut, ramp } from "../geom";
import { project } from "../MoscowMap";
import { Edit, ProtoFrame, q, qa } from "../ProtoFrame";
import { LiveInsert, Track } from "./Insert";
import { Caption, CamKey, Pointer, Super, ToPin, UICam } from "./Kit";
import { Lockup } from "./Logo13";
import { camAt, Comet, MapStage, Objects, Pin, RouteLine } from "./MapStage";
import { PLACES, ROUTES } from "./places";
import { CALENDAR, CHAT, CHECK, CITIZEN, install, MARKET, ONE_NAME, REMINDERS, SIGNED, BADGE } from "./screens";
import { f } from "./T";
import L5 from "../data/tracks/L5_tablet.json";
import L6 from "../data/tracks/L6_approver.json";
import L7 from "../data/tracks/L7_supplier.json";
import L9 from "../data/tracks/L9_sign.json";

/* Act II–final. All times are film seconds; f() makes frames. */

const pinAt = (id: keyof typeof PLACES, sec: number): [number, number] => project(camAt(sec), PLACES[id].lng, PLACES[id].lat);
const K = (s: number, x: number, y: number, z: number): CamKey => [f(s), x, y, z];
const P = (s: number, x: number, y: number): [number, number, number] => [f(s), x, y];

/** A UI scene: a sequence with a camera over one prototype screen. */
const Screen: React.FC<{
  a: number;
  b: number;
  w: number;
  h: number;
  snap: string;
  keys: CamKey[];
  edit?: Edit;
  pointer?: [number, number, number][];
  clicks?: number[];
  over?: React.ReactNode; // UI-space overlays (move with the camera)
  top?: React.ReactNode; // frame-space overlays (captions)
  pin?: { id: keyof typeof PLACES; a: number; b: number };
}> = ({ a, b, w, h, snap, keys, edit, pointer, clicks, over, top, pin }) => {
  const body = (
    <AbsoluteFill>
      <UICam w={w} h={h} keys={keys} start={f(a)}>
        <ProtoFrame snap={snap} w={w} h={h} edit={edit} offset={f(a)} />
        {over}
        {pointer && <Pointer keys={pointer} clicks={(clicks ?? []).map(f)} start={f(a)} />}
      </UICam>
      {top}
    </AbsoluteFill>
  );
  return (
    <Sequence from={f(a)} durationInFrames={f(b) - f(a)}>
      {pin ? (
        <ToPin a={f(pin.a)} b={f(pin.b)} pin={pinAt(pin.id, pin.b)} start={f(a)}>
          {body}
        </ToPin>
      ) : (
        body
      )}
    </Sequence>
  );
};

/** Dark toast, as the prototype shows it. */
const Toast: React.FC<{ a: number; b: number; x: number; y: number; text: string; start: number }> = ({ a, b, x, y, text, start }) => {
  const fr = useCurrentFrame() + start;
  const k = easeOut(ramp(fr, f(a), f(a) + 20)) * (1 - ramp(fr, f(b) - 14, f(b)));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - k) * 14, transform: "translateX(-50%)", opacity: k, background: C.ink, color: "#fff", borderRadius: 12, padding: "11px 16px", fontFamily: FONT, fontSize: 14, fontWeight: 600, display: "flex", gap: 10, alignItems: "center", boxShadow: "0 14px 30px rgba(0,2,48,0.25)", whiteSpace: "nowrap", zIndex: 60 }}>
      <span style={{ width: 18, height: 18, borderRadius: 9, background: "#2BB673", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>
      {text}
    </div>
  );
};

/* ---------- edits (frame-driven DOM changes inside snapshots) ---------- */

const typeInto = (el: HTMLInputElement | null, s: string, k: number) => {
  if (!el) return;
  el.value = s.slice(0, Math.round(s.length * clamp01(k)));
};

const objectsEdit: Edit = (doc, fr) => {
  const k = ramp(fr, f(98.0), f(99.0));
  typeInto(q(doc, 'input[aria-label="Поиск объектов"]') as HTMLInputElement, "Нагорная", k);
  const filter = fr >= f(99.1);
  qa(doc, "#object-rows tr").forEach((tr) => {
    tr.hidden = filter && !(tr.textContent ?? "").includes("Нагорная");
    tr.style.background = filter && fr >= f(101.6) ? "var(--surface-2)" : "";
  });
};

const passportEdit: Edit = (doc, fr) => {
  const hover = fr >= f(106.6) && fr < f(111.8);
  qa(doc, ".kv > div").forEach((d) => {
    const isArea = d.querySelector("label")?.textContent === "Общая площадь";
    if (isArea) {
      d.style.background = hover ? "var(--blue-50)" : "";
      d.style.borderRadius = "8px";
    }
  });
};

const TABS: [string, string][] = [
  ["obj_psd", "ПСД"],
  ["obj_contracts", "Договоры подряда"],
  ["obj_volumes", "ТЭП и объемы"],
  ["obj_monitor", "Ход работ"],
  ["obj_ks2", "КС-2"],
  ["obj_invoices", "Счета"],
];

const contractorNewEdit: Edit = (doc, fr) => {
  if (!doc.getElementById("v13-backdrop")) {
    const d = doc.createElement("div");
    d.id = "v13-backdrop";
    d.style.cssText = "position:fixed;inset:0;background:rgba(0,2,48,0.32);z-index:999";
    doc.body.appendChild(d);
    const dlg = doc.querySelector("dialog") as HTMLElement | null;
    if (dlg) dlg.style.cssText += ";position:fixed;inset:0;margin:auto;z-index:1000";
  }
  const body = (q(doc, ".modal-body") ?? q(doc, "#modal-form")?.parentElement) as HTMLElement | null;
  if (body) body.scrollTop = 300 * easeInOut(ramp(fr, f(135.2), f(136.4)));
  // the training data puts an insulation spec on the radiator row; show the radiator's own
  qa(doc, "#modal input").forEach((i) => {
    const el = i as HTMLInputElement;
    if (/Толщина/.test(el.value)) el.value = "Биметаллический · 10 секций";
  });
  const ta = q(doc, 'textarea[name="projectReason"]') as HTMLTextAreaElement | null;
  const why = "Замена радиаторов стояка 2-го подъезда по ПСД";
  if (ta) ta.value = why.slice(0, Math.round(why.length * ramp(fr, f(138.2), f(140.0))));
  const save = qa(doc, "button").find((b) => b.textContent?.includes("Сохранить черновик")) as HTMLButtonElement | undefined;
  if (save) {
    const ok = fr >= f(140.1);
    save.disabled = !ok;
    save.textContent = ok ? "Отправить на проверку" : "Сохранить черновик";
  }
};

const approvalsEdit: Edit = (doc, fr) => {
  const row = qa(doc, "tbody tr")[0];
  if (row) row.style.background = fr >= f(148.6) ? "var(--surface-2)" : "";
};

const stage8Edit: Edit = (doc, fr) => {
  qa(doc, ".flow-map-card").forEach((card, i) => {
    const on = fr >= f(153.8 + i * 0.28);
    const num = card.querySelector(".flow-number") as HTMLElement | null;
    if (num) {
      num.style.background = on ? "var(--green-50)" : "";
      num.style.color = on ? "var(--green)" : "";
    }
    let tag = card.querySelector(".v13-ok") as HTMLElement | null;
    if (!tag) {
      tag = doc.createElement("div");
      tag.className = "v13-ok";
      tag.innerHTML = BADGE("Согласовано", "green");
      tag.style.marginTop = "10px";
      (card.querySelector("div") ?? card).appendChild(tag);
    }
    tag.style.visibility = on ? "visible" : "hidden";
  });
};

const marketEdit: Edit = (doc, fr) => {
  install(doc, MARKET);
  typeInto(q(doc, "#q") as HTMLInputElement, "радиаторы биметаллические", ramp(fr, f(129.8), f(130.9)));
  const add = q(doc, "#add");
  if (add) add.innerHTML = fr >= f(132.6) ? BADGE("В заявке · 10 шт.", "green") : `<button class="btn primary" type="button">В заявку</button>`;
  const r1 = q(doc, "#r1");
  if (r1) r1.style.background = fr >= f(131.2) ? "var(--blue-50)" : "";
};

const calendarEdit: Edit = (doc, fr) => {
  install(doc, CALENDAR);
  const d20 = q(doc, "#d20");
  const confirmed = fr >= f(168.2);
  if (d20) {
    const sel = fr >= f(166.0);
    d20.style.background = sel ? "var(--blue-50)" : "var(--surface-2)";
    d20.style.boxShadow = sel ? "inset 0 0 0 2px var(--blue)" : "none";
  }
  const load = q(doc, "#load");
  if (load) load.textContent = confirmed ? "650 из 1 000 · ваш заказ" : "640 из 1 000";
  const c = q(doc, "#confirm");
  if (c) c.innerHTML = confirmed ? BADGE("Заказ подтверждён · 20.10", "green") : `<button class="btn primary" type="button">Подтвердить 20.10</button>`;
};

const remindersEdit: Edit = (doc, fr) => {
  install(doc, REMINDERS);
  const up = fr >= f(182.6);
  const file = q(doc, "#ttnfile");
  if (file) file.innerHTML = up ? "📎 ТТН_20.10.pdf · фото с объекта" : "Фото или скан ТТН";
  const st = q(doc, "#ttnstate");
  if (st) st.innerHTML = up ? BADGE("Загружено", "green") : BADGE("Ожидает", "orange");
  const row = q(doc, "#rowttn");
  if (row) row.style.background = fr >= f(181.4) && fr < f(183.8) ? "var(--blue-50)" : "";
};

const signedEdit: Edit = (doc, fr) => {
  install(doc, SIGNED);
  [0, 1].forEach((i) => {
    const s = q(doc, "#sig" + i);
    if (s) s.innerHTML = fr >= f(190.6 + i * 0.8) ? BADGE("Подписано · КЭП · 20.10.2026", "green") : BADGE("Ожидается подпись", "gray");
  });
};

const chatEdit: Edit = (doc, fr) => {
  install(doc, CHAT);
  const Q = "Где заявка З-2026-0401 и почему превышение?";
  const t = q(doc, "#asktext");
  const typing = ramp(fr, f(198.8), f(200.6));
  const sent = fr >= f(200.9);
  if (t) {
    t.textContent = sent ? "Спросите о заявке, договоре или документе…" : typing > 0 ? Q.slice(0, Math.round(Q.length * typing)) : "Спросите о заявке, договоре или документе…";
    t.style.color = !sent && typing > 0 ? "var(--ink)" : "var(--faint)";
  }
  const b = q(doc, "#qbubble");
  if (b) {
    b.textContent = Q;
    b.style.opacity = String(easeOut(ramp(fr, f(200.9), f(201.3))));
  }
  const a = q(doc, "#answer");
  if (a) a.style.opacity = String(easeOut(ramp(fr, f(201.8), f(202.5))));
};

const oneNameEdit: Edit = (doc, fr) => {
  install(doc, ONE_NAME);
  const m = easeInOut(ramp(fr, f(208.0), f(209.4)));
  [0, 1, 2].forEach((i) => {
    const s = q(doc, "#src" + i);
    if (s) {
      s.style.transform = `translateX(${m * 60}px) translateY(${(1 - i) * 92 * m}px) scale(${1 - 0.06 * m})`;
      s.style.opacity = String(1 - 0.75 * m);
    }
  });
  const ar = q(doc, "#arrow");
  if (ar) ar.style.opacity = String(ramp(fr, f(208.6), f(209.2)));
  const one = q(doc, "#one");
  if (one) {
    const k = easeOut(ramp(fr, f(209.2), f(209.9)));
    one.style.opacity = String(k);
    one.style.transform = `translateX(${(1 - k) * -30}px)`;
  }
};

const checkEdit: Edit = (doc, fr) => {
  install(doc, CHECK);
  for (let i = 0; i < 4; i++) {
    const c = q(doc, "#c" + i);
    if (!c) continue;
    const on = fr >= f(212.9 + i * 0.45);
    c.innerHTML = !on ? `<span style="color:var(--faint)">сверяется…</span>` : i < 3 ? BADGE("Сверено", "green") : `${BADGE("Отклонение: 9 вместо 10", "red")}<span class="sub">передано сотруднику</span>`;
  }
  const r = q(doc, "#row3");
  if (r) r.style.background = fr >= f(214.3) ? "var(--red-50)" : "";
};

const citizenEdit: Edit = (doc, fr) => {
  install(doc, CITIZEN);
  for (let i = 0; i < 5; i++) {
    const e = q(doc, "#f" + i);
    if (e) e.style.opacity = String(easeOut(ramp(fr, f(221.8 + i * 0.35), f(222.2 + i * 0.35))));
  }
  const r = q(doc, "#reply");
  if (r) r.style.opacity = String(easeOut(ramp(fr, f(224.4), f(225.0))));
};

/* ---------- route strip that becomes the question field ---------- */

const ROUTE = ["Заявка", "ТУ ГАУ", "УРО ГАУ", "Экономист", "Диадок", "Поставщик", "Поставка", "ТТН", "М-15"];
const RouteToChat: React.FC = () => {
  const fr = useCurrentFrame() + f(194.4);
  const n = ROUTE.length;
  const gap = 196;
  const x0 = 960 - ((n - 1) * gap) / 2;
  const morph = easeInOut(ramp(fr, f(196.6), f(198.4)));
  return (
    <AbsoluteFill style={{ background: "#F3F3F3", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: x0, right: x0, top: 540, height: 4, background: C.line, opacity: 1 - morph }} />
      <div style={{ position: "absolute", left: x0, top: 540, height: 4, width: (n - 1) * gap * easeInOut(ramp(fr, f(194.6), f(196.2))), background: C.green, opacity: 1 - morph }} />
      {ROUTE.map((r, i) => {
        const done = fr >= f(194.6 + i * 0.17);
        const last = i === n - 1;
        const cx = x0 + i * gap;
        if (last) {
          // the last circle grows into the question field (ТМЦ → ИИ morph)
          const w = 48 + (1240 - 48) * morph;
          const h = 48 + (64 - 48) * morph;
          const x = cx + (960 - cx) * morph;
          const y = 542 + (820 - 542) * morph;
          return (
            <div key={i} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 24 - 8 * morph, background: morph > 0.4 ? "#fff" : done ? C.green : "#fff", boxShadow: `inset 0 0 0 ${morph > 0.4 ? 1 : 0}px ${C.line}`, display: "flex", alignItems: "center", padding: morph > 0.6 ? "0 22px" : 0, justifyContent: morph > 0.6 ? "flex-start" : "center", color: morph > 0.6 ? C.faint : "#fff", fontSize: 20, fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}>
              {morph > 0.6 ? <span style={{ opacity: ramp(fr, f(197.6), f(198.2)) }}>Спросите о заявке, договоре или документе…</span> : done ? "✓" : ""}
            </div>
          );
        }
        return (
          <div key={i} style={{ position: "absolute", left: cx - 24, top: 518, width: 48, height: 48, borderRadius: 24, background: done ? C.green : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, opacity: 1 - morph }}>
            {done ? "✓" : ""}
            <div style={{ position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", color: C.ink2, fontSize: 24, fontWeight: 700 }}>{r}</div>
          </div>
        );
      })}
      <Caption a={f(194.8) - f(194.4)} b={f(196.8) - f(194.4)} light>
        Каждый шаг виден — от заявки до подписи
      </Caption>
    </AbsoluteFill>
  );
};

/* ---------- effect on the light map ---------- */

const Big: React.FC<{ a: number; b: number; g?: string; title: string; n: string; note?: string; color?: string }> = ({ a, b, g, title, n, note, color = C.ink }) => {
  const fr = useCurrentFrame();
  if (fr < f(a) - 2 || fr > f(b) + 2) return null;
  const k = easeOut(ramp(fr, f(a), f(a) + 36));
  const out = 1 - easeInOut(ramp(fr, f(b) - 24, f(b)));
  return (
    <div style={{ position: "absolute", left: 120, top: 250, fontFamily: FONT, opacity: out }}>
      {g && <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4, color: C.blue, opacity: k }}>{g.toUpperCase()}</div>}
      <div style={{ fontSize: 40, fontWeight: 700, color: C.ink2, marginTop: 14, opacity: k, letterSpacing: -0.6 }}>{title}</div>
      <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -6, color, lineHeight: 1.04, marginTop: 10, opacity: k, transform: `translateY(${(1 - k) * 24}px)`, fontVariantNumeric: "tabular-nums" }}>{n}</div>
      {note && <div style={{ fontSize: 30, fontWeight: 600, color: C.muted, marginTop: 14, opacity: easeOut(ramp(fr, f(a) + 24, f(a) + 56)) }}>{note}</div>}
    </div>
  );
};

const Effect: React.FC = () => (
  <AbsoluteFill>
    <Big a={230.6} b={234.6} g="Деньги" title="Закупки материалов: 8 млрд ₽ в год" n="−10–12%" note="одна витрина, лимиты по смете и договору" color={C.blue} />
    <Big a={234.6} b={238.4} g="Деньги" title="Экономия на закупках" n="800–960 млн ₽" note="в год" />
    <Big a={238.4} b={242.2} g="Деньги" title="Доставка и перемещения: 450 млн ₽ в год" n="67,5–90 млн ₽" note="−15–20%: поставка под готовность объекта, без повторных рейсов" />
    <Big a={242.2} b={245.6} g="Деньги" title="Итого" n="≈1 млрд ₽ в год" color={C.blue} />
    <Big a={245.6} b={249.2} g="Время" title="765 возвратов заявок на доработку" n="1 419 чел.-ч" note="проверка по смете и лимитам — до отправки" />
    <Big a={249.2} b={252.2} g="Время" title="Цикл согласования" n="−20–30%" note="250–300 ч в год на сотрудника ≈ 1–1,5 часа каждого дня" />
    <Big a={252.2} b={256.4} g="Люди" title="−25–30% трудозатрат на охваченные операции" n="2,5–3 ставки" note="на каждые 10 человек · 100% объектов в аналитике, обновление ежедневно" color={C.green} />
  </AbsoluteFill>
);

/* ---------- the dashboard on the Fund monitor ---------- */

const DashboardStill: React.FC = () => <ProtoFrame snap="dashboard" w={1600} h={900} />;
const ContractorHome: React.FC = () => <ProtoFrame snap="c_home" w={1180} h={820} />;
const ApprovalsQueue: React.FC = () => <ProtoFrame snap="tmc_approvals" w={1600} h={900} edit={approvalsEdit} offset={f(144)} />;
const SupplierStart: React.FC = () => <ProtoFrame snap="supplier_home" w={1440} h={900} edit={calendarEdit} offset={f(158)} />;
const RemindersOnTablet: React.FC = () => <ProtoFrame snap="c_home" w={1180} h={820} edit={remindersEdit} offset={f(185.8)} />;
const SignedOnTablet: React.FC = () => <ProtoFrame snap="c_home" w={1180} h={820} edit={signedEdit} offset={f(185.8)} />;

const All: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / 60;
  return (
    <>
      {/* Фонд · дашборд */}
      <Screen
        a={88.6}
        b={97.2}
        w={1600}
        h={900}
        snap="dashboard"
        keys={[K(88.6, 800, 450, 1), K(89.6, 800, 450, 1), K(91.2, 760, 250, 1.6), K(93.6, 760, 250, 1.6), K(95.2, 1040, 640, 1.35)]}
        pointer={[P(88.6, 1000, 560), P(90.6, 470, 260), P(92.6, 1330, 292), P(94.8, 840, 700), P(96.6, 802, 880)]}
        clicks={[96.8]}
        top={<Caption a={f(89.4) - f(88.6)} b={f(96.8) - f(88.6)}>Вся программа — на одном экране</Caption>}
      />
      {/* Фонд · объекты */}
      <Screen
        a={97.2}
        b={103.8}
        w={1600}
        h={900}
        snap="objects"
        edit={objectsEdit}
        keys={[K(97.2, 800, 450, 1), K(97.9, 840, 230, 1.35), K(103.8, 820, 250, 1.35)]}
        pointer={[P(97.2, 802, 880), P(97.8, 1200, 92), P(100.8, 390, 241), P(103.2, 382, 242)]}
        clicks={[97.85, 103.3]}
        top={<Caption a={f(98.2) - f(97.2)} b={f(103.6) - f(97.2)}>Поиск по адресу, УНОМ, подрядчику и договору</Caption>}
      />
      {/* Фонд · карточка дома */}
      <Screen
        a={103.8}
        b={112.2}
        w={1600}
        h={900}
        snap="passport"
        edit={passportEdit}
        keys={[K(103.8, 800, 450, 1), K(104.6, 760, 330, 1.35), K(106.4, 1180, 470, 1.75), K(111.0, 1180, 470, 1.75), K(112.2, 900, 330, 1.3)]}
        pointer={[P(103.8, 382, 242), P(106.4, 1335, 497), P(111.6, 1340, 500)]}
        over={<ProvenancePopover />}
        top={
          <>
            <Caption a={f(104.6) - f(103.8)} b={f(107.8) - f(103.8)}>Каждый дом — одна карточка</Caption>
            <Caption a={f(108.0) - f(103.8)} b={f(112.0) - f(103.8)}>Видно, откуда данные и кто их изменил</Caption>
          </>
        }
      />
      {/* Фонд · весь цикл: вкладки карточки */}
      {TABS.map(([snap, label], i) => {
        const a = 112.2 + i * 1.0;
        const b = i === TABS.length - 1 ? 119.6 : a + 1.0;
        return (
          <Screen
            key={snap}
            a={a}
            b={b}
            w={1600}
            h={900}
            snap={snap}
            keys={[K(112.2, 820, 340, 1.28), K(119.6, 820, 340, 1.28)]}
            pointer={[P(a, 600 + i * 70, 183), P(a + 0.7, 640 + i * 70, 185)]}
            pin={i === TABS.length - 1 ? { id: "fund", a: 118.6, b: 119.6 } : undefined}
            over={
              i === TABS.length - 1 ? (
                <>
                  <Toast a={117.0} b={118.8} x={800} y={820} text="Подрядчику: пора подавать заявку на ТМЦ — за 10 рабочих дней до поставки" start={f(a)} />
                </>
              ) : undefined
            }
          />
        );
      })}
      {sec >= 112.2 && sec < 119.4 && <Caption a={f(112.4)} b={f(117.0)}>От программы до оплаты — в одной системе</Caption>}
      {sec >= 112.2 && sec < 119.4 && (
        <div style={{ position: "absolute", right: 96, bottom: 96, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.ink, background: "#fff", borderRadius: 14, padding: "14px 22px", boxShadow: "0 10px 30px rgba(0,2,48,0.12)", opacity: clamp01((sec - 112.4) / 0.4) * (1 - clamp01((sec - 117) / 0.4)) }}>
          {["ПСД", "Договор", "ТЭП и объёмы", "Ход работ", "КС-2", "Оплата"][Math.min(5, Math.max(0, Math.floor(sec - 112.2)))]}
        </div>
      )}

      {/* map: the request leaves the Fund for the house */}
      {sec >= 118.6 && sec < 124.2 && (
        <MapStage>
          {(cam, day, s) => (
            <>
              <Pin cam={cam} id="fund" show={1} day={day} />
              <Pin cam={cam} id="house" show={1} day={day} active={s > 121.4 ? clamp01((s - 121.4) / 0.4) : 0} />
              <DataArc cam={cam} from="fund" to="house" u={(s - 119.8) / 1.6} />
            </>
          )}
        </MapStage>
      )}
      {sec >= 119.6 && sec < 123.2 && <Caption a={f(119.8)} b={f(123.0)} light>Уведомление уходит подрядчику</Caption>}

      {/* Подрядчик · двор, планшет */}
      <Sequence from={f(123)} durationInFrames={f(128.4) - f(123)}>
        <LiveInsert src="v13/live/L5_tablet.mp4" start={f(123)} pin={pinAt("house", 123)} open={[f(123), f(124)]} track={L5 as Track} push={[f(126.4), f(128.4)]} ui={{ w: 1180, h: 820, node: <ContractorHome /> }} />
      </Sequence>
      <Screen
        a={128.4}
        b={129.6}
        w={1180}
        h={820}
        snap="c_home"
        keys={[K(128.4, 590, 410, 1), K(129.6, 590, 380, 1.05)]}
        over={<Toast a={128.5} b={129.6} x={590} y={150} text="Пора подавать заявку на ТМЦ · ул. Нагорная, 20 к4" start={f(128.4)} />}
      />
      <Screen
        a={129.6}
        b={134}
        w={1180}
        h={820}
        snap="c_home"
        edit={marketEdit}
        keys={[K(129.6, 590, 380, 1.05), K(130.6, 640, 300, 1.3), K(134, 640, 300, 1.3)]}
        pointer={[P(129.6, 760, 300), P(130.0, 900, 86), P(131.4, 660, 236), P(132.4, 1010, 236)]}
        clicks={[130.0, 132.5]}
        top={<Caption a={f(129.8) - f(129.6)} b={f(133.8) - f(129.6)}>Материалы по договорам — в одной витрине</Caption>}
      />
      <Screen
        a={134}
        b={142.4}
        w={1180}
        h={820}
        snap="c_new"
        edit={contractorNewEdit}
        keys={[K(134, 590, 410, 1.0), K(135.0, 590, 410, 1.0), K(136.6, 570, 500, 1.2), K(141.0, 570, 500, 1.2)]}
        pointer={[P(134, 1010, 236), P(136.8, 650, 390), P(137.8, 400, 520), P(140.4, 1010, 760)]}
        clicks={[137.9, 140.6]}
        pin={{ id: "house", a: 141.4, b: 142.4 }}
        over={<Toast a={140.7} b={141.6} x={590} y={700} text="Заявка отправлена на проверку ТУ ГАУ" start={f(134)} />}
        top={
          <>
            <Caption a={f(134.2) - f(134)} b={f(137.6) - f(134)}>Подрядчик подаёт заявку прямо с объекта</Caption>
            <Caption a={f(137.8) - f(134)} b={f(141.2) - f(134)}>Заявка сверяется со сметой и лимитами — до отправки</Caption>
          </>
        }
      />

      {/* map: house → ТУ ГАУ */}
      {sec >= 141.4 && sec < 145.2 && (
        <MapStage>
          {(cam, day, s) => (
            <>
              <Pin cam={cam} id="house" show={1} day={day} />
              <Pin cam={cam} id="tu" show={1} day={day} active={s > 143.4 ? 1 : 0} />
              <DataArc cam={cam} from="house" to="tu" u={(s - 142.4) / 1.1} />
            </>
          )}
        </MapStage>
      )}
      <Sequence from={f(144)} durationInFrames={f(147.4) - f(144)}>
        <LiveInsert src="v13/live/L6_approver.mp4" start={f(144)} pin={pinAt("tu", 144)} open={[f(144), f(145)]} track={L6 as Track} push={[f(145.6), f(147.4)]} ui={{ w: 1600, h: 900, node: <ApprovalsQueue /> }} />
      </Sequence>
      <Screen
        a={147.4}
        b={149.4}
        w={1600}
        h={900}
        snap="tmc_approvals"
        edit={approvalsEdit}
        keys={[K(147.4, 800, 450, 1), K(148.4, 640, 300, 1.45)]}
        pointer={[P(147.4, 900, 600), P(148.8, 345, 286)]}
        clicks={[149.1]}
      />
      <Screen
        a={149.4}
        b={153.4}
        w={1600}
        h={900}
        snap="tmc_changes"
        keys={[K(149.4, 800, 450, 1), K(150.2, 1080, 470, 1.32), K(153.4, 1080, 470, 1.32)]}
        pointer={[P(149.4, 345, 286), P(151.4, 1405, 824), P(152.6, 1121, 190)]}
        clicks={[151.6, 152.8]}
        top={<Caption a={f(149.8) - f(149.4)} b={f(153.2) - f(149.4)}>Правки видны сразу: что изменено и кем</Caption>}
      />
      <Screen
        a={153.4}
        b={156.4}
        w={1600}
        h={900}
        snap="stage8"
        edit={stage8Edit}
        keys={[K(153.4, 950, 330, 1.12), K(156.4, 950, 330, 1.18)]}
        pin={{ id: "econ", a: 155.6, b: 156.4 }}
        top={<Caption a={f(153.6) - f(153.4)} b={f(155.6) - f(153.4)}>Маршрут согласования виден всем</Caption>}
      />

      {/* map: economist → supplier's warehouse */}
      {sec >= 155.6 && sec < 159.2 && (
        <MapStage>
          {(cam, day, s) => (
            <>
              <Pin cam={cam} id="econ" show={1} day={day} />
              <Pin cam={cam} id="store" show={1} day={day} active={s > 157.4 ? 1 : 0} />
              <DataArc cam={cam} from="econ" to="store" u={(s - 156.4) / 1.3} />
            </>
          )}
        </MapStage>
      )}
      <Sequence from={f(158)} durationInFrames={f(162.4) - f(158)}>
        <LiveInsert src="v13/live/L7_supplier.mp4" start={f(158)} pin={pinAt("store", 158)} open={[f(158), f(159)]} track={L7 as Track} push={[f(160.4), f(162.4)]} ui={{ w: 1440, h: 900, node: <SupplierStart /> }} />
      </Sequence>
      <Screen
        a={162.4}
        b={172.4}
        w={1440}
        h={900}
        snap="supplier_home"
        edit={calendarEdit}
        keys={[K(162.4, 720, 450, 1), K(163.4, 720, 360, 1.18), K(165.4, 1000, 460, 1.45), K(170.4, 1000, 460, 1.45), K(172.4, 720, 420, 1.15)]}
        pointer={[P(162.4, 900, 600), P(165.8, 1050, 560), P(167.8, 470, 382)]}
        clicks={[166.0, 168.0]}
        pin={{ id: "store", a: 171.6, b: 172.4 }}
        top={<Caption a={f(163.0) - f(162.4)} b={f(171.4) - f(162.4)}>Поставщик видит заказ в своём календаре</Caption>}
      />

      {/* map: one planned trip */}
      {sec >= 171.6 && sec < 177.2 && (
        <MapStage>
          {(cam, day, s) => (
            <>
              <RouteLine cam={cam} line={ROUTES["w_se>nagornaya"]} draw={easeInOut(clamp01((s - 172.6) / 2.2))} color={C.orange} width={5} o={0.55} />
              <Comet cam={cam} line={ROUTES["w_se>nagornaya"]} u={(s - 172.8) / 2.4} tail={150} width={5} />
              <Pin cam={cam} id="store" show={1} day={day} />
              <Pin cam={cam} id="house" show={1} day={day} active={s > 175 ? 1 : 0} />
            </>
          )}
        </MapStage>
      )}
      {sec >= 172.4 && sec < 176.2 && <Super a={f(172.8)} b={f(176.0)} cap="Один рейс — по графику" dark />}

      {/* the truck arrives */}
      <Sequence from={f(176)} durationInFrames={f(180.6) - f(176)}>
        <LiveInsert src="v13/live/L8_truck.mp4" start={f(176)} pin={pinAt("house", 176)} open={[f(176), f(177)]} />
        <PushCard a={178.6} grow={[179.8, 180.6]} start={f(176)} />
      </Sequence>
      <Screen
        a={180.6}
        b={185.8}
        w={1180}
        h={820}
        snap="c_home"
        edit={remindersEdit}
        keys={[K(180.6, 590, 400, 1.0), K(181.4, 640, 330, 1.38), K(185.8, 640, 330, 1.38)]}
        pointer={[P(180.6, 700, 400), P(181.6, 520, 300), P(184.8, 1010, 370)]}
        clicks={[181.8, 185.0]}
        top={<Caption a={f(180.8) - f(180.6)} b={f(185.6) - f(180.6)}>Система сама напомнит о следующем шаге</Caption>}
      />
      {/* M-15 signed on the tablet: the screen pulls out into the courtyard and back in */}
      <Sequence from={f(185.8)} durationInFrames={f(190) - f(185.8)}>
        <PullOutIn />
      </Sequence>
      <Screen
        a={189.8}
        b={194.4}
        w={1180}
        h={820}
        snap="c_home"
        edit={signedEdit}
        keys={[K(189.8, 590, 410, 1.0), K(190.6, 640, 300, 1.35), K(194.4, 640, 300, 1.35)]}
        top={<Caption a={f(190.4) - f(189.8)} b={f(194.2) - f(189.8)}>КЭП и Диадок — без бумаги и курьеров</Caption>}
      />

      {/* route → question field (ТМЦ → ИИ) */}
      <Sequence from={f(194.4)} durationInFrames={f(198.4) - f(194.4)}>
        <RouteToChat />
      </Sequence>
      <Screen
        a={198.4}
        b={206.4}
        w={1600}
        h={900}
        snap="dashboard"
        edit={chatEdit}
        keys={[K(198.4, 800, 640, 1.2), K(199.4, 800, 560, 1.2), K(201.6, 820, 380, 1.32), K(206.4, 820, 380, 1.32)]}
        top={<Caption a={f(199.0) - f(198.4)} b={f(206.2) - f(198.4)}>Спросите систему — как коллегу</Caption>}
      />
      <Screen
        a={206.4}
        b={212.4}
        w={1600}
        h={900}
        snap="dashboard"
        edit={oneNameEdit}
        keys={[K(206.4, 820, 330, 1.25), K(212.4, 860, 330, 1.25)]}
        top={<Caption a={f(206.8) - f(206.4)} b={f(212.2) - f(206.4)}>Три названия — одна позиция</Caption>}
      />
      <Screen
        a={212.4}
        b={216.0}
        w={1600}
        h={900}
        snap="dashboard"
        edit={checkEdit}
        keys={[K(212.4, 800, 300, 1.3), K(216.0, 800, 300, 1.3)]}
        pin={{ id: "house", a: 215.2, b: 216.0 }}
        top={<Caption a={f(212.6) - f(212.4)} b={f(215.2) - f(212.4)}>Документы сверяются сами — сотрудник видит только отклонения</Caption>}
      />
      {sec >= 215.2 && sec < 217.4 && (
        <MapStage>{(cam, day) => <Pin cam={cam} id="house" show={1} day={day} active={1} />}</MapStage>
      )}
      <Sequence from={f(216.4)} durationInFrames={f(220.6) - f(216.4)}>
        <ToPin a={f(219.8)} b={f(220.6)} pin={[960, 540]} start={f(216.4)}>
          <LiveInsert src="v13/live/L10_resident.mp4" start={f(216.4)} pin={pinAt("house", 216.4)} open={[f(216.4), f(217.2)]} />
        </ToPin>
        <Caption a={f(217.4) - f(216.4)} b={f(219.8) - f(216.4)}>Житель пишет об отоплении</Caption>
      </Sequence>
      <FromCenter a={220.4} b={221.2}>
        <Screen
          a={220.4}
          b={227.2}
          w={1600}
          h={900}
          snap="dashboard"
          edit={citizenEdit}
          keys={[K(220.4, 820, 360, 1.18), K(223.0, 820, 380, 1.24), K(227.2, 820, 420, 1.24)]}
          top={<Caption a={f(221.6) - f(220.4)} b={f(227.0) - f(220.4)}>Обращение сразу попадает к исполнителю</Caption>}
        />
      </FromCenter>
      {sec >= 227 && sec < 230.6 && <MethodsLine />}

      {/* АКТ IV — эффект на светлой карте */}
      {sec >= 230 && sec < 259.6 && (
        <MapStage dim={0.62 * clamp01((sec - 230) / 0.8) * (1 - clamp01((sec - 256.4) / 1.2))}>
          {(cam, day, s) => (
            <>
              <Objects cam={cam} grow={1} day={day} o={0.55} />
              {s > 238.4 && s < 242.4 &&
                ["w_se>nagornaya", "w_nw>kuntsevo", "w_ne>otradnoe"].map((k, i) => <Comet key={k} cam={cam} line={ROUTES[k]} u={((s - 238.4 - i * 0.5) / 2) % 1} tail={120} width={4} />)}
            </>
          )}
        </MapStage>
      )}
      {sec >= 230 && sec < 256.8 && <Effect />}

      {/* ФИНАЛ */}
      {sec >= 258.6 && (
        <Sequence from={f(258.6)} durationInFrames={f(268) - f(258.6)}>
          <EndCard />
        </Sequence>
      )}
    </>
  );
};

/** The source of a passport field, shown on hover (prototype popover style). */
const ProvenancePopover: React.FC = () => {
  const fr = useCurrentFrame() + f(103.8);
  const k = easeOut(ramp(fr, f(106.9), f(107.3))) * (1 - ramp(fr, f(111.6), f(111.9)));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 1090, top: 520, width: 330, background: "#fff", borderRadius: 10, boxShadow: "0 18px 40px -12px rgba(0,2,48,0.2), 0 0 0 1px rgba(0,2,48,0.06)", padding: "14px 16px", fontFamily: FONT, fontSize: 13, color: C.ink, opacity: k, transform: `translateY(${(1 - k) * 6}px)`, zIndex: 40 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>Общая площадь · 9 850 м²</div>
      {[
        ["Источник", "Техпаспорт БТИ"],
        ["Обновлено", "12.03.2026 · ТУ ГАУ"],
        ["История", "2 изменения"],
      ].map(([a, b]) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", marginTop: 9, gap: 12 }}>
          <span style={{ color: C.muted }}>{a}</span>
          <span style={{ fontWeight: 600 }}>{b}</span>
        </div>
      ))}
    </div>
  );
};

/** A data line between two pins on the map (blue), with a travelling light. */
const DataArc: React.FC<{ cam: any; from: keyof typeof PLACES; to: keyof typeof PLACES; u: number }> = ({ cam, from, to, u }) => {
  const [x1, y1] = project(cam, PLACES[from].lng, PLACES[from].lat);
  const [x2, y2] = project(cam, PLACES[to].lng, PLACES[to].lat);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.22;
  const k = clamp01(u);
  const pt = (t: number) => [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2];
  const n = 40;
  const d = Array.from({ length: Math.max(2, Math.round(n * easeInOut(k))) }, (_, i) => pt((i / n) * 1)).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const [hx, hy] = pt(easeInOut(k));
  if (u <= 0) return null;
  return (
    <g>
      <path d={d} fill="none" stroke={C.blue} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      {u < 1.05 && <circle cx={hx} cy={hy} r={9} fill={C.blue} filter="url(#glow)" opacity={0.6} />}
      {u < 1.05 && <circle cx={hx} cy={hy} r={4.5} fill="#fff" />}
    </g>
  );
};

/** A push notification on the live shot that grows into the full interface. */
const PushCard: React.FC<{ a: number; grow: [number, number]; start: number }> = ({ a, grow, start }) => {
  const fr = useCurrentFrame() + start;
  const k = easeOut(ramp(fr, f(a), f(a) + 22));
  if (k <= 0) return null;
  const g = easeInOut(ramp(fr, f(grow[0]), f(grow[1])));
  const x0 = 1390;
  const y0 = 90;
  const w0 = 440;
  const h0 = 104;
  const x = x0 * (1 - g);
  const y = y0 * (1 - g);
  const w = w0 + (1920 - w0) * g;
  const h = h0 + (1080 - h0) * g;
  return (
    <div style={{ position: "absolute", left: x, top: y - (1 - k) * 20, width: w, height: h, opacity: k, background: "rgba(255,255,255,0.97)", borderRadius: 18 * (1 - g), boxShadow: "0 20px 50px rgba(0,2,48,0.28)", fontFamily: FONT, overflow: "hidden" }}>
      {g > 0 && (
        // the notification opens into the app: the same screen the next scene starts on
        <div style={{ position: "absolute", left: 0, top: 0, width: 1180, height: 820, transformOrigin: "0 0", transform: `translate(${(w - 1180 * Math.max(w / 1180, h / 820)) / 2}px, ${(h - 820 * Math.max(w / 1180, h / 820)) / 2}px) scale(${Math.max(w / 1180, h / 820)})`, opacity: clamp01(g * 2.2) }}>
          <ProtoFrame snap="c_home" w={1180} h={820} edit={remindersEdit} offset={start} />
        </div>
      )}
      <div style={{ position: "absolute", padding: "18px 22px", opacity: 1 - g * 3 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.muted }}>ФКР · Учёт ТМЦ</div>
        <div style={{ fontSize: 22, fontWeight: 750, color: C.ink, marginTop: 4 }}>Загрузите ТТН · поставка 20.10</div>
      </div>
    </div>
  );
};

/** From the reminders screen out into the courtyard tablet, the signature, and back in:
    the camera pulls out of the interface (1 → 0), the foreman signs, and it pushes back. */
const PullOutIn: React.FC = () => {
  const start = f(185.8);
  const fr = useCurrentFrame() + start;
  const ep = fr < f(187.5) ? 1 - ramp(fr, f(185.8), f(186.8)) : ramp(fr, f(188.6), f(190));
  return (
    <LiveInsert
      src="v13/live/L9_sign.mp4"
      start={start}
      track={L9 as Track}
      ep={ep}
      ui={{ w: 1180, h: 820, node: fr < f(187.5) ? <RemindersOnTablet /> : <SignedOnTablet /> }}
    />
  );
};

/** A full-frame layer that unfolds from the frame centre (inverse of ToPin). */
const FromCenter: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const fr = useCurrentFrame();
  if (fr < f(a)) return null;
  const e = easeInOut(ramp(fr, f(a), f(b)));
  const s = 0.04 + 0.96 * e;
  return <AbsoluteFill style={{ transform: `scale(${s})`, borderRadius: 40 * (1 - e), overflow: "hidden", opacity: clamp01(e * 3) }}>{children}</AbsoluteFill>;
};

const MethodsLine: React.FC = () => {
  const fr = useCurrentFrame();
  const items = ["Протоколы встреч", "Звонки подрядчикам", "Прогноз потребности", "Фото технадзора", "Поиск аномалий", "База знаний"];
  return (
    <AbsoluteFill style={{ background: "#F3F3F3", fontFamily: FONT, justifyContent: "center", padding: "0 120px" }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, opacity: easeOut(ramp(fr, f(227.1), f(227.6))) }}>И ещё ИИ в системе</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "18px 44px", marginTop: 26 }}>
        {items.map((t, i) => {
          const k = easeOut(ramp(fr, f(227.3 + i * 0.22), f(227.8 + i * 0.22)));
          return (
            <div key={t} style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1.6, color: C.ink, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Finale: the evening city plays, then folds into the first window of the ФКР mark,
    and the mark draws itself around it on white. */
const MARK = { x: 640, y: 360, size: 210 }; // mark's top-left and height on the end card
const WIN0 = (() => {
  const k = MARK.size / 56;
  return { x: MARK.x + 21 * k, y: MARK.y + 10 * k, w: 3 * k, h: 6 * k };
})();

const EndCard: React.FC = () => {
  const fr = useCurrentFrame() + f(258.6);
  const fold = easeInOut(ramp(fr, f(263.0), f(264.6)));
  const open = easeInOut(ramp(fr, f(258.6), f(259.8)));
  // live rect: from a centre pin to full frame, later to the mark's first window
  const r0 = { x: 960 - 13 + (0 - (960 - 13)) * open, y: 540 - 13 + (0 - (540 - 13)) * open, w: 26 + (1920 - 26) * open, h: 26 + (1080 - 26) * open };
  const r = { x: r0.x + (WIN0.x - r0.x) * fold, y: r0.y + (WIN0.y - r0.y) * fold, w: r0.w + (WIN0.w - r0.w) * fold, h: r0.h + (WIN0.h - r0.h) * fold };
  const s = Math.max(r.w / 1920, r.h / 1080);
  const radius = 8 * (1 - open) + 18 * Math.sin(Math.PI * fold) + 2 * fold;
  const k = MARK.size / 56;
  return (
    <AbsoluteFill style={{ background: fold > 0 ? "#fff" : "transparent", fontFamily: FONT }}>
      {fold > 0 && (
        <div style={{ position: "absolute", left: MARK.x, top: MARK.y }}>
          <svg width={44 * k} height={56 * k} viewBox="0 0 44 56" fill="none" style={{ overflow: "visible" }}>
            <path d="M40 14V4H4v48h36V41" stroke={C.logoInk} strokeWidth={3.5} strokeDasharray={187} strokeDashoffset={187 * (1 - easeInOut(ramp(fr, f(263.8), f(265.0))))} />
            {[
              [10, 21],
              [10, 32],
              [16, 32],
              [17, 42],
              [23, 42],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width={3} height={6} fill={C.orangeLogo} style={{ transformBox: "fill-box", transformOrigin: "50% 50%", scale: String(easeOut(ramp(fr, f(264.6 + i * 0.12), f(264.9 + i * 0.12)))) }} />
            ))}
          </svg>
          <div style={{ position: "absolute", left: 44 * k + 60, top: 26, color: C.logoInk, lineHeight: 0.95, clipPath: `inset(0 ${(1 - easeOut(ramp(fr, f(265.0), f(265.8)))) * 100}% 0 0)` }}>
            <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: 1.6 }}>ФКР</div>
            <div style={{ fontSize: 81, fontWeight: 400, letterSpacing: 3.2 }}>МОСКВЫ</div>
          </div>
          <div style={{ position: "absolute", left: 0, top: 56 * k + 54, width: 900, fontSize: 44, fontWeight: 750, letterSpacing: -0.9, color: C.ink, opacity: easeOut(ramp(fr, f(265.6), f(266.2))) }}>
            Единая система капитального ремонта
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius, overflow: "hidden", background: C.orangeLogo }}>
        <div style={{ position: "absolute", left: (r.w - 1920 * s) / 2, top: (r.h - 1080 * s) / 2, width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${s})`, opacity: 1 - ramp(fr, f(264.2), f(264.6)) }}>
          <OffthreadVideo src={staticFile("v13/live/L11_evening.mp4")} playbackRate={0.85} muted style={{ width: 1920, height: 1080 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Scenes2 = { All, DashboardStill };
