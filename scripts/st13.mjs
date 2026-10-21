// Stills for a v13 composition: node scripts/st13.mjs <comp> <dir> <frame…>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [id, dir, ...frames] = process.argv.slice(2);
const out = path.resolve("stills", dir);
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: process.env.GL || "angle" };
const comp = await selectComposition({ serveUrl, id, inputProps: {}, chromiumOptions });
for (const f of frames.map(Number)) {
  await renderStill({ serveUrl, composition: comp, output: path.join(out, `f${String(f).padStart(5, "0")}.jpg`), frame: f, imageFormat: "jpeg", jpegQuality: 88, chromiumOptions, timeoutInMilliseconds: 180000 });
}
console.log("done", frames.length);
