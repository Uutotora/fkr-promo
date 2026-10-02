import { chromium } from '/Users/u2ora/Documents/Работа/ФКР/fkr-rskr-concept/node_modules/playwright/index.mjs';
const B='http://127.0.0.1:4178/';
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1600,height:1000},locale:'ru-RU'});
const page=await ctx.newPage();
page.on('pageerror',e=>console.log('ERR',e.message));
let i=0;
const shot=async(n)=>{await page.waitForTimeout(700);await page.screenshot({path:`probe/${String(++i).padStart(2,'0')}_${n}.png`});
 const btns=await page.locator('main button:visible, [role=dialog] button:visible').evaluateAll(b=>b.map(x=>x.innerText.trim().replace(/\s+/g,' ')).filter(Boolean));
 console.log(i,n,'| BTN:',JSON.stringify(btns).slice(0,900));};
await page.goto(B+'#/tmc/requests'); await shot('req');
await page.locator('.demo-menu summary').click(); await shot('menu');
await page.getByRole('button',{name:/Пример: 100 радиаторов/}).click(); await shot('form');
await page.locator('#modal-form input[name="contact"]').fill('Орлов П. С.');
await page.locator('#modal-form input[name="phone"]').fill('+7 495 000-00-00');
await page.locator('#modal-form input[name="storage"]').fill('Площадка у 2-го подъезда');
await page.locator('#modal-form textarea').first().fill('Фактические обмеры: замена по всем стоякам');
await shot('form-filled');
console.log(await page.locator('#modal-form textarea').evaluateAll(t=>t.map(x=>x.name)));
await page.locator('#modal-form button[type="submit"]').click(); await shot('draft');
await page.getByRole('button',{name:'Направить на проверку',exact:true}).click(); await shot('exceed');
await page.locator('#modal-form textarea').fill('Фактические обмеры: 100 секций по стоякам');
await page.locator('#modal-form button[type="submit"]').click(); await shot('sent');
await page.getByRole('combobox',{name:'Кабинет пользователя'}).click(); await shot('rolemenu');
await page.getByRole('option',{name:'ФКР / ГАУ',exact:true}).click(); await shot('fkr');
console.log(page.url());
for(let k=0;k<8;k++){
  const b=page.locator('main button.primary:visible').first();
  if(!(await b.count())) break;
  const t=(await b.innerText()).trim(); console.log('CLICK',t);
  await b.click(); await shot('step'+k);
  const d=page.locator('[role=dialog]:visible');
  if(await d.count()){
    const ta=page.locator('[role=dialog] textarea:visible'); if(await ta.count()) await ta.first().fill('Согласовано с учетом обмеров');
    const cb=page.locator('[role=dialog] input[type=checkbox]:visible'); for(let j=0;j<await cb.count();j++) await cb.nth(j).check().catch(()=>{});
    await shot('dlg'+k);
    const sb=page.locator('[role=dialog] button.primary:visible').last(); console.log('DLG-SUBMIT',(await sb.innerText()).trim());
    await sb.click(); await page.waitForTimeout(3500); await shot('after'+k);
  }
}
await browser.close();
