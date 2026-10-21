// Screens the prototype does not have yet, written with the prototype's own
// classes and tokens and injected into a real shell snapshot (ProtoFrame), so
// they are typeset by the same stylesheet as the captured screens.

const badge = (text: string, tone = "") => `<span class="badge ${tone}">${text}</span>`;
const btn = (text: string, primary = false, id = "") => `<button class="btn ${primary ? "primary" : ""}" ${id ? `id="${id}"` : ""} type="button">${text}</button>`;
const th = (cols: string[]) => `<thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
const td = "padding:14px 16px;border-bottom:1px solid var(--line-soft);vertical-align:top;font-size:13.5px";
const table = (cols: string[], rows: string[][], ids: string[] = []) =>
  `<div class="table-wrap"><table class="grid-table" style="width:100%;border-collapse:collapse">${th(cols)}<tbody>${rows
    .map((r, i) => `<tr ${ids[i] ? `id="${ids[i]}"` : ""}>${r.map((c, j) => `<td style="${td}${j === 0 ? ";padding-left:20px" : ""}">${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
const panel = (title: string, body: string, extra = "") => `<section class="panel"><div class="panel-head"><h2>${title}</h2>${extra}</div>${body}</section>`;
const head = (title: string, sub: string, actions = "") => `<div class="pagehead"><div><h1>${title}</h1><div class="subtitle" style="margin-top:6px">${sub}</div></div>${actions}</div>`;
const sub = (s: string) => `<span class="sub">${s}</span>`;

export const MARKET = `<div class="feature-screen" id="v13">
${head("Маркет ФКР", "Материалы по договорам 2026 · ул. Нагорная, д. 20, корп. 4", `<label class="grid-search" style="width:330px"><input id="q" placeholder="Искать материалы, артикулы, ТМЦ" value=""></label>`)}
<section class="panel"><div class="tabs" style="padding:0 12px;border-bottom:1px solid var(--line-soft)">${["Отопление", "Трубы", "Краны", "Кровля", "Фасад", "Утеплители"]
  .map((t, i) => `<button class="tab ${i === 0 ? "active" : ""}" style="padding:14px 12px">${t}</button>`)
  .join("")}</div>
${table(
  ["Материал", "Поставщик · договор", "Лимит", ""],
  [
    [`<strong>Радиаторы биметаллические</strong>${sub("ТМЦ-000317 · по смете ЛСР-НГ-001")}`, `АО «САНТЕХПРОМ»${sub("Д015-2025")}`, "до 1 000 шт. в день", `<span id="add">${btn("В заявку", true)}</span>`],
    [`<strong>Конвекторы</strong>${sub("Отопление")}`, `ООО «ТЭПЛА ПРОИЗВОДСТВО»${sub("Д029-2026")}`, "до 1 500 шт. в день", btn("В заявку")],
    [`<strong>Полотенцесушители</strong>${sub("Отопление")}`, `ООО «Р-КЛИМАТ»${sub("Д013-2026")}`, "до 500 шт. в день", btn("В заявку")],
    [`<strong>Краны латунные шаровые</strong>${sub("Отопление")}`, `ООО «ПНС»${sub("Д023-2026")}`, "до 10 000 шт. в день", btn("В заявку")],
    [`<strong>Трубы стальные оцинкованные</strong>${sub("Трубы")}`, `ООО «ГРИН СТ»${sub("Д033-2026")}`, "до 13 500 м.п. в день", btn("В заявку")],
  ],
  ["r1"],
)}</section>
<div class="callout"><span>Материал нужен конкретной работе: <strong>«Ремонт системы отопления»</strong> · смета ЛСР-НГ-001 · ПСД и МГЭ согласованы</span></div>
</div>`;

export const CALENDAR = (() => {
  const busy = [6, 7, 13, 14, 21, 27, 28];
  const head7 = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => `<div style="color:var(--muted);font-size:12px;font-weight:600;padding:6px 0">${d}</div>`).join("");
  let cells = "";
  for (let i = 0; i < 3; i++) cells += `<div></div>`; // 1 Oct 2026 is a Thursday
  for (let d = 1; d <= 31; d++) {
    const b = busy.includes(d);
    cells += `<div id="d${d}" style="height:58px;border-radius:10px;background:${b ? "var(--surface-3)" : "var(--surface-2)"};padding:8px 10px;font-size:13px;font-weight:650;color:${b ? "var(--faint)" : "var(--ink)"};position:relative">${d}${
      b ? `<span style="position:absolute;right:10px;top:8px;color:var(--faint);font-weight:500">✕</span>` : ""
    }${d === 20 ? `<div id="load" style="font-size:11px;font-weight:650;color:var(--orange-ink);margin-top:6px;white-space:nowrap">640 из 1 000</div>` : ""}</div>`;
  }
  return `<div class="feature-screen" id="v13">
${head("Кабинет поставщика", "АО «САНТЕХПРОМ» · договор Д015-2025 · лимит 1 000 шт. в день")}
<div style="display:grid;grid-template-columns:420px 1fr;gap:16px;align-items:start">
${panel(
  "Новый заказ",
  `<div class="panel-body" style="font-size:14px;line-height:1.5">
   <div style="font-size:17px;font-weight:700">Радиатор биметаллический, 10 секций</div>
   <div style="color:var(--muted);margin:2px 0 14px">ТМЦ-000317 · 10 шт.</div>
   <div style="display:grid;grid-template-columns:150px 1fr;row-gap:10px">
    <span style="color:var(--muted)">Объект</span><span>ул. Нагорная, д. 20, корп. 4</span>
    <span style="color:var(--muted)">Подрядчик</span><span>ООО «Городские системы»</span>
    <span style="color:var(--muted)">Дата поставки</span><span id="date">20.10.2026</span>
   </div>
   <div style="margin-top:18px" id="confirm">${btn("Подтвердить 20.10", true)}</div>
  </div>`,
  badge("Новый", "blue"),
)}
${panel(
  "Октябрь 2026",
  `<div class="panel-body"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;text-align:left">${head7}${cells}</div>
  <div style="display:flex;gap:18px;margin-top:14px;font-size:12.5px;color:var(--muted)"><span>✕ — день занят</span><span>Лимит на заказ — 1 000 шт. в день</span></div></div>`,
)}
</div></div>`;
})();

export const REMINDERS = `<div class="feature-screen" id="v13">
${head("Поставка 20.10", "ул. Нагорная, д. 20, корп. 4 · радиатор биметаллический, 10 шт. · АО «САНТЕХПРОМ»")}
${panel(
  "Напоминания системы",
  table(
    ["Шаг", "Когда", "Статус"],
    [
      [`<strong>Пора подавать заявку</strong>${sub("Заявка на ТМЦ по смете")}`, "за 10 рабочих дней", badge("Выполнено", "green")],
      [`<strong>Загрузите ТТН</strong>${sub(`<span id="ttnfile"></span>`)}`, "в день поставки", `<span id="ttnstate">${badge("Ожидает", "orange")}</span>`],
      [`<strong>Подпишите М-15</strong>${sub("Передача материалов подрядчику — 10 шт.")}`, "после приёмки", `<span id="m15">${btn("Подписать", true)}</span>`],
    ],
    ["", "rowttn", "rowm15"],
  ),
)}
</div>`;

export const SIGNED = `<div class="feature-screen" id="v13">
${head("Акт М-15 · передача материалов подрядчику", "ул. Нагорная, д. 20, корп. 4 · ПКРД-002047-25 · радиатор биметаллический, 10 секций — 10 шт.")}
${panel(
  "Подписание",
  `<div class="panel-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
   ${["ОПМ ФКР", "Подрядчик"]
     .map(
       (r, i) => `<div style="background:var(--surface-2);border-radius:12px;padding:16px 18px"><div style="font-weight:700;font-size:15px">${r}</div>
       <div id="sig${i}" style="margin-top:10px">${badge("Ожидается подпись", "gray")}</div><div style="color:var(--muted);font-size:12.5px;margin-top:8px">КЭП · через Диадок</div></div>`,
     )
     .join("")}
  </div>
  <div class="callout" style="margin-top:16px"><span id="sent">Документ отправлен в Диадок — без бумаги и курьеров</span></div></div>`,
)}
</div>`;

export const CHAT = `<div class="feature-screen" id="v13">
${head("Помощник", "Отвечает по документам Фонда · со ссылками на источники")}
<section class="panel" style="min-height:560px;display:flex;flex-direction:column">
 <div class="panel-body" style="flex:1;display:flex;flex-direction:column;gap:16px">
  <div id="qbubble" style="align-self:flex-end;max-width:560px;background:var(--blue-50);color:var(--blue-700);border-radius:14px 14px 4px 14px;padding:12px 16px;font-size:15px;font-weight:600;opacity:0"></div>
  <div id="answer" style="max-width:860px;background:var(--surface-2);border-radius:14px 14px 14px 4px;padding:16px 18px;font-size:15px;line-height:1.55;opacity:0">
   Заявка <strong>З-2026-0401</strong> на ул. Нагорную, 20 к4 — на проверке у ТУ ГАУ.<br>
   Превышение лимита первой заявки на 7 шт.: подрядчик указал обоснование — замена радиаторов по ПСД.
   <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${badge("ПСД-НГ-001")}${badge("Смета ЛСР-НГ-001")}${badge("Договор ПКРД-002047-25")}</div>
  </div>
 </div>
 <div style="padding:14px 20px 20px"><div id="ask" style="height:52px;border-radius:14px;border:1px solid var(--line-strong);display:flex;align-items:center;padding:0 18px;font-size:15px;color:var(--ink)"><span id="asktext" style="color:var(--faint)">Спросите о заявке, договоре или документе…</span></div></div>
</section></div>`;

export const ONE_NAME = `<div class="feature-screen" id="v13">
${head("Справочник ТМЦ", "Сопоставление номенклатуры · ИИ")}
<div style="display:grid;grid-template-columns:1fr 120px 1fr;align-items:center;gap:8px">
 <div style="display:flex;flex-direction:column;gap:12px">
 ${[
   ["ИС РСКР", "Радиатор биметалл. 10 с."],
   ["1С", "Радиатор БМ 10 секций"],
   ["Смета подрядчика", "Радиатор 10-секц."],
 ]
   .map(([s, n], i) => `<section class="panel" id="src${i}" style="margin:0"><div class="panel-body"><div style="color:var(--muted);font-size:12.5px;font-weight:600">${s}</div><div style="font-size:17px;font-weight:700;margin-top:4px">${n}</div></div></section>`)
   .join("")}
 </div>
 <div id="arrow" style="text-align:center;font-size:34px;color:var(--blue);opacity:0">→</div>
 <section class="panel" id="one" style="margin:0;opacity:0"><div class="panel-body"><div>${badge("Одна позиция", "green")}</div>
  <div style="font-size:22px;font-weight:750;margin-top:12px;letter-spacing:-0.01em">Радиатор биметаллический, 10 секций</div>
  <div style="color:var(--muted);font-size:13.5px;margin-top:6px">ТМЦ-000317 · БАРС, 1С, ТЭП и проект связаны с этой позицией</div></div></section>
</div></div>`;

export const CHECK = `<div class="feature-screen" id="v13">
${head("Сверка документов", "Поставка 20.10 · ул. Нагорная, д. 20, корп. 4 · сверка автоматически")}
${panel(
  "Документы поставки",
  table(
    ["Документ", "Количество", "Результат"],
    [
      ["<strong>УПД</strong>", "10 шт.", `<span id="c0"></span>`],
      ["<strong>ТТН</strong>", "10 шт.", `<span id="c1"></span>`],
      ["<strong>Счёт</strong>", "10 шт.", `<span id="c2"></span>`],
      ["<strong>Акт М-15</strong>", "9 шт.", `<span id="c3"></span>`],
    ],
    ["", "", "", "row3"],
  ),
)}
</div>`;

export const CITIZEN = `<div class="feature-screen" id="v13">
${head("Обращение жителя", "Поступило через портал · разобрано автоматически")}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">
${panel(
  "Текст обращения",
  `<div class="panel-body" style="font-size:16px;line-height:1.55">«После ремонта отопления во 2-м подъезде холодные батареи. ул. Нагорная, 20 к4»</div>`,
  badge("Новое", "blue"),
)}
${panel(
  "Разбор",
  `<div class="panel-body" style="display:grid;grid-template-columns:150px 1fr;row-gap:12px;font-size:14px">
   ${[
     ["Дом", "ул. Нагорная, д. 20, корп. 4 · УНОМ 18542"],
     ["Система", "Отопление · 2-й подъезд"],
     ["Тип", "Гарантийный случай"],
     ["Исполнитель", "Подрядчик по договору ПКРД-002047-25"],
     ["Срок", "до 24.10 · контроль устранения"],
   ]
     .map(([k, v], i) => `<span style="color:var(--muted)">${k}</span><span id="f${i}" style="font-weight:600;opacity:0">${v}</span>`)
     .join("")}
  </div>`,
)}
</div>
<section class="panel" id="reply" style="opacity:0"><div class="panel-head"><h2>Ответ жителю</h2>${badge("Отправлено", "green")}</div>
<div class="panel-body" style="font-size:15px;line-height:1.55">Здравствуйте! Обращение принято. Подрядчик проверит отопление во 2-м подъезде 21.10, устранение — до 24.10. Мы сообщим о результате.</div></section>
</div>`;

/** Put custom markup into the shell once; later frames only animate it. */
export const install = (doc: Document, html: string) => {
  if (doc.getElementById("v13")) return;
  const main = doc.querySelector("#main-content");
  if (main) main.innerHTML = html;
};

export const BADGE = badge;
