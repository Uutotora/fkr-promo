import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [tag, ...ts] = process.argv.slice(2);
const times = ts.map(Number);
fs.mkdirSync(`stills/${tag}`, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: process.env.COMP ?? "PromoSilent", inputProps: {} });
for (let i = 0; i < times.length; i += 6) {
  await Promise.all(times.slice(i, i + 6).map((t) => renderStill({ serveUrl, composition: comp, output: `stills/${tag}/t${t.toFixed(2)}.png`, frame: Math.round(t * 60), imageFormat: "png" })));
}
console.log("done");
