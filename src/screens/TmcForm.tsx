import React from "react";
import { C } from "../theme";
import { EXPO, tw, useSec } from "../lib";
import { IX, IChevron, ICalendar, IPlus, IAlert } from "../components/Icons";

export const MODAL = { x: 280, y: 78, w: 1040, h: 840 };
export const QTY = { x: MODAL.x + 32 + 576 + 60, y: MODAL.y + 452 + 27 };
export const SEND = { x: MODAL.x + MODAL.w - 32 - 135, y: MODAL.y + MODAL.h - 74 + 24 };

const Label: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, fontSize: 14.5, color: C.ink2, fontWeight: 500 }}>{children}</div>
);
const Input: React.FC<{ x: number; y: number; w: number; h?: number; children: React.ReactNode; chevron?: boolean; icon?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h = 48, children, chevron, icon, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: "border-box",
      borderRadius: 11,
      boxShadow: `inset 0 0 0 1px ${C.line}`,
      background: "#fff",
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      fontSize: 16,
      fontWeight: 550,
      gap: 10,
      ...style,
    }}
  >
    <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{children}</div>
    {icon}
    {chevron && <IChevron size={16} color={C.muted} />}
  </div>
);

/** New TMC request dialog with live estimate guard. Coordinates are window-absolute. */
export const TmcForm: React.FC<{ at: number; qtyClick: number; type: number[]; limit: number; reasonAt: number; sendPress: number }> = ({ at, qtyClick, type, limit, reasonAt, sendPress }) => {
  const s = useSec();
  const k = tw(s, [at, at + 0.6], [0, 1], EXPO);
  const digits = "100".slice(0, type.filter((t) => s >= t).length);
  const focus = s >= qtyClick;
  const lim = tw(s, [limit, limit + 0.35], [0, 1], EXPO);
  const shake = s >= limit && s < limit + 0.5 ? Math.sin((s - limit) * 60) * 9 * (1 - (s - limit) / 0.5) : 0;
  const reason = "Фактические обмеры: замена по всем стоякам";
  const rk = tw(s, [reasonAt, reasonAt + 0.6], [0, 1], EXPO);
  const typedReason = reason.slice(0, Math.round(tw(s, [reasonAt + 0.25, reasonAt + 1.05], [0, reason.length], (t) => t)));
  const press = tw(s, [sendPress - 0.05, sendPress + 0.08, sendPress + 0.3], [0, 1, 0]);
  const L = 32;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,2,48,${0.32 * k})` }} />
      <div
        style={{
          position: "absolute",
          left: MODAL.x,
          top: MODAL.y,
          width: MODAL.w,
          height: MODAL.h,
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 40px 90px -20px rgba(0,2,48,0.45)",
          opacity: k,
          scale: String(0.94 + 0.06 * k),
          translate: `0 ${(1 - k) * 30}px`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: L, top: 22, fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em" }}>Новая заявка на поставку ТМЦ</div>
        <div style={{ position: "absolute", right: 28, top: 24 }}>
          <IX size={22} color={C.muted} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 72, height: 1, background: C.lineSoft }} />

        <div style={{ position: "absolute", left: L, top: 92, fontSize: 17, fontWeight: 750 }}>Объект и поставка</div>
        <Label x={L} y={124}>Объект ремонта</Label>
        <Input x={L} y={148} w={470} chevron>ул. Нагорная, д. 20, корп. 4</Input>
        <Label x={L + 486} y={124}>Дата поставки</Label>
        <Input x={L + 486} y={148} w={190} icon={<ICalendar size={17} color={C.muted} />}>08.10.2026</Input>
        <Label x={L + 692} y={124}>Поставщик</Label>
        <Input x={L + 692} y={148} w={284}>ООО «Материалы города»</Input>
        <div style={{ position: "absolute", left: L, top: 204, fontSize: 13.5, color: C.muted }}>УНОМ 18542 · ПКРД-002047-25 · поставка Д045-2026</div>

        <Label x={L} y={240}>Адрес доставки</Label>
        <Input x={L} y={264} w={470}>Площадка у 2-го подъезда</Input>
        <Label x={L + 486} y={240}>Грузополучатель</Label>
        <Input x={L + 486} y={264} w={300}>ООО «Городские системы»</Input>
        <Label x={L + 802} y={240}>Телефон</Label>
        <Input x={L + 802} y={264} w={174}>+7 495 000-00-00</Input>

        <div style={{ position: "absolute", left: L, right: L, top: 330, height: 1, background: C.lineSoft }} />
        <div style={{ position: "absolute", left: L, top: 350, fontSize: 17, fontWeight: 750 }}>Материалы</div>
        <div style={{ position: "absolute", right: L, top: 342, display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderRadius: 10, boxShadow: `inset 0 0 0 1px ${C.line}`, fontSize: 14.5, fontWeight: 650 }}>
          <IPlus size={15} /> Добавить позицию
        </div>
        <div style={{ position: "absolute", left: L, top: 392, fontSize: 15, fontWeight: 700 }}>
          ПСД и МГЭ согласованы <span style={{ fontWeight: 500, color: C.muted, marginLeft: 10 }}>ПСД-НГ-001 · лимиты по выбранному объекту</span>
        </div>
        <Label x={L} y={428}>Номенклатура</Label>
        <Input x={L} y={452} w={560} h={54} chevron>
          Радиатор биметаллический, 10 секций · ТМЦ-000317
        </Input>
        <Label x={L + 576} y={428}>Количество</Label>
        <div
          style={{
            position: "absolute",
            left: L + 576,
            top: 452,
            width: 120,
            height: 54,
            boxSizing: "border-box",
            borderRadius: 11,
            background: lim > 0 ? `rgba(253,237,240,${lim})` : "#fff",
            boxShadow: lim > 0 ? `inset 0 0 0 2px ${C.red}, 0 0 0 ${6 * lim}px rgba(208,52,75,0.15)` : focus ? `inset 0 0 0 2px ${C.blue}, 0 0 0 5px rgba(49,107,253,0.15)` : `inset 0 0 0 1px ${C.line}`,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            fontSize: 22,
            fontWeight: 800,
            color: lim > 0 ? C.red : C.ink,
            translate: `${shake}px 0`,
          }}
        >
          {digits}
          {focus && s < limit + 0.6 && <span style={{ width: 2, height: 24, background: C.blue, marginLeft: 2, opacity: Math.floor(s * 3) % 2 ? 1 : 0.15 }} />}
        </div>
        <div style={{ position: "absolute", left: L + 704, top: 470, fontSize: 15, color: C.muted }}>шт.</div>
        <Label x={L + 740} y={428}>Характеристики</Label>
        <Input x={L + 740} y={452} w={236} h={54}>
          Биметалл · 10 секций
        </Input>

        <div style={{ position: "absolute", left: L, top: 524, display: "flex", gap: 22, fontSize: 15, color: C.muted }}>
          {[
            ["ПСД", "10 шт."],
            ["МГЭ", "10 шт."],
            ["Занято / получено", "0 шт."],
            ["Остаток проекта", "10 шт."],
            ["Первая заявка · лимит 30%", "3 шт."],
          ].map(([l, v], i) => (
            <span key={l} style={{ position: "relative" }}>
              {l} <b style={{ color: i < 2 && lim > 0 ? C.red : C.ink }}>{v}</b>
              {i < 2 && lim > 0 && <span style={{ position: "absolute", left: 0, right: 0, bottom: -4, height: 2.5, borderRadius: 2, background: C.red, scale: `${lim} 1`, transformOrigin: "left" }} />}
            </span>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: L,
            top: 560,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 16.5,
            fontWeight: 750,
            color: C.red,
            opacity: lim,
            translate: `${(1 - lim) * -16}px 0`,
          }}
        >
          <IAlert size={19} color={C.red} /> Превышение лимита первой заявки 97 шт. · укажите обоснование
        </div>

        <div style={{ opacity: rk, translate: `0 ${(1 - rk) * 16}px` }}>
          <Label x={L} y={602}>
            Обоснование превышения <span style={{ color: C.red }}>*</span>
          </Label>
          <div style={{ position: "absolute", left: L, top: 628, width: MODAL.w - 2 * L, height: 82, boxSizing: "border-box", borderRadius: 11, boxShadow: `inset 0 0 0 ${typedReason ? 2 : 1}px ${typedReason ? C.blue : C.line}`, padding: "14px 16px", fontSize: 16, fontWeight: 550 }}>
            {typedReason}
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: MODAL.h - 92, height: 1, background: C.lineSoft }} />
        <div style={{ position: "absolute", left: L, top: MODAL.h - 60, fontSize: 13.5, color: C.muted }}>ФКР увидит отклонение от проекта при согласовании</div>
        <div style={{ position: "absolute", right: L + 290, top: MODAL.h - 74, height: 48, padding: "0 20px", borderRadius: 12, boxShadow: `inset 0 0 0 1px ${C.line}`, display: "grid", placeItems: "center", fontWeight: 650, fontSize: 15.5 }}>Отмена</div>
        <div
          style={{
            position: "absolute",
            right: L,
            top: MODAL.h - 74,
            width: 270,
            height: 48,
            borderRadius: 12,
            background: C.blue,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 15.5,
            scale: String(1 - press * 0.05),
            boxShadow: `0 10px 24px -10px rgba(49,107,253,${0.6 + press * 0.4})`,
          }}
        >
          Направить на проверку
        </div>
      </div>
    </>
  );
};
