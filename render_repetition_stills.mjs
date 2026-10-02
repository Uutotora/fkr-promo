import {bundle} from '@remotion/bundler';
import {openBrowser,renderStill,selectComposition} from '@remotion/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';
const frames=process.argv.slice(2).map(Number);
const out=path.resolve('out/repetition/qa');
await fs.mkdir(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
const browser=await openBrowser('chrome',{chromiumOptions:{gl:'angle'}});
try {
 const composition=await selectComposition({serveUrl,id:'PriceOfRepetitionSilent',puppeteerInstance:browser});
 for(let i=0;i<frames.length;i+=4){
  await Promise.all(frames.slice(i,i+4).map(async frame=>{
   await renderStill({serveUrl,composition,frame,output:path.join(out,`f${String(frame).padStart(4,'0')}.jpg`),imageFormat:'jpeg',jpegQuality:94,puppeteerInstance:browser,chromiumOptions:{gl:'angle'}});
   console.log(`frame ${frame}`);
  }));
 }
}finally{await browser.close({silent:true});}
