import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: "PromoSilent", inputProps: {} });
await Promise.all(times.map(async (t, i) => {
  await new Promise(r => setTimeout(r, i * 50));
  await renderStill({ serveUrl, composition: comp, output: `stills/t${t}.png`, frame: Math.round(t * 60), imageFormat: "png" });
}));
console.log("done", times.length);
