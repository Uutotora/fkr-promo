import { chromium } from '/Users/u2ora/Documents/Работа/ФКР/fkr-rskr-concept/node_modules/playwright/index.mjs';
const B='http://127.0.0.1:4178/';
const routes=['#/analytics','#/objects','#/object/1/passport','#/object/1/works','#/object/1/gantt','#/object/1/monitoring','#/contracts','#/contract/1/general','#/approvals','#/tmc/approvals','#/tmc/requests','#/tmc/report','#/stage8-map','#/supply-map','#/guide'];
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:1,locale:'ru-RU'});
const page=await ctx.newPage();
page.on('pageerror',e=>console.log('ERR',e.message));
for(const r of routes){
  await page.goto(B+r); await page.waitForTimeout(1800);
  const name=r.replace(/[#\/]+/g,'_');
  await page.screenshot({path:`explore/${name}.png`});
  const nav=await page.locator('.section-nav a').evaluateAll(n=>n.map(x=>x.getAttribute('href')+' '+x.textContent.trim())).catch(()=>[]);
  console.log(r, await page.locator('main h1').first().innerText().catch(()=>'-'), nav.length? JSON.stringify(nav):'');
}
await browser.close();
