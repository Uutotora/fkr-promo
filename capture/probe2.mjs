import { chromium } from '/Users/u2ora/Documents/Работа/ФКР/fkr-rskr-concept/node_modules/playwright/index.mjs';
const B='http://127.0.0.1:4178/';
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1600,height:1000},locale:'ru-RU'});
const page=await ctx.newPage();
page.on('pageerror',e=>console.log('ERR',e.message));
let i=0;
const shot=async(n)=>{await page.waitForTimeout(600);await page.screenshot({path:`probe/${String(++i).padStart(2,'0')}_${n}.png`});};
await page.goto(B+'#/tmc/requests');
await page.locator('.demo-menu summary').click();
await page.getByRole('button',{name:/Пример: 100 радиаторов/}).click();
await page.locator('#modal-form input[name="contact"]').fill('Орлов П. С.');
await page.locator('#modal-form input[name="phone"]').fill('+7 495 000-00-00');
await page.locator('#modal-form input[name="storage"]').fill('Площадка у 2-го подъезда');
await page.locator('#modal-form textarea[name=projectReason]').fill('Фактические обмеры: замена по всем стоякам');
await page.locator('#modal-form button[type="submit"]').click(); await page.waitForTimeout(500);
await page.getByRole('button',{name:'Направить на проверку',exact:true}).click();
await page.locator('#modal-form button[type="submit"]').click(); await page.waitForTimeout(500);
const roles=['ФКР / ГАУ','Подрядчик','Поставщик'];
const setRole=async r=>{await page.getByRole('combobox',{name:'Кабинет пользователя'}).click();await page.waitForTimeout(200);const o=page.getByRole('option',{name:new RegExp('^'+r)});if(await o.count()){await o.first().click();await page.waitForTimeout(700);return true}await page.keyboard.press('Escape');return false};
console.log('opts', await (async()=>{await page.getByRole('combobox',{name:'Кабинет пользователя'}).click();const t=await page.getByRole('option').allInnerTexts();await page.keyboard.press('Escape');return t})());
let idle=0;
for(let k=0;k<30 && idle<4;k++){
  const b=page.locator('main button.primary:visible').first();
  if(!(await b.count())){ const r=roles[k%3]; await setRole(r); console.log('ROLE',r, await page.locator('main .chip, main .status').first().innerText().catch(()=>''));idle++; continue;}
  idle=0;
  const t=(await b.innerText()).trim(); console.log(k,'CLICK',t, await page.locator('.role-switch, [aria-label="Кабинет пользователя"]').first().innerText().catch(()=>''));
  await b.click(); await page.waitForTimeout(500); await shot('k'+k);
  for(let z=0;z<3;z++){
   const ecp=page.locator('dialog.ecp-dialog[open]');
   const m=page.locator('dialog#modal[open]');
   if(await ecp.count()){ await shot('ecp'+k); const p=ecp.locator('button.primary'); console.log(' ECP',await p.innerText()); await p.click(); await page.waitForTimeout(300); await shot('ecpRun'+k); await page.waitForTimeout(4000); await shot('ecpDone'+k); const c=ecp.locator('button.primary'); if(await c.count()) await c.click(); await page.waitForTimeout(800);}
   else if(await m.count()){ const ta=m.locator('textarea:visible'); if(await ta.count()) await ta.first().fill('Согласовано с учетом обмеров');
     const cb=m.locator('input[type=checkbox]:visible'); for(let j=0;j<await cb.count();j++) await cb.nth(j).check().catch(()=>{});
     const sb=m.locator('button.primary:visible').last(); console.log(' MODAL',(await m.locator('h2,h3').first().innerText().catch(()=>'')),'->',(await sb.innerText()).trim()); await shot('m'+k);
     await sb.click(); await page.waitForTimeout(800);}
   else break;
  }
  await shot('after'+k);
}
await browser.close();
