import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('out/repetition/fkr-price-of-repetition-1080p60.mp4');
await fs.mkdir(path.dirname(output), {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
let progressBucket = -1;
try {
  const composition = await selectComposition({serveUrl, id: 'PriceOfRepetition', puppeteerInstance: browser});
  console.log(JSON.stringify({id: composition.id, width: composition.width, height: composition.height, fps: composition.fps, frames: composition.durationInFrames}));
  await renderMedia({
    serveUrl, composition, puppeteerInstance: browser, outputLocation: output,
    codec: 'h264', crf: 16, x264Preset: 'slow', pixelFormat: 'yuv420p',
    imageFormat: 'jpeg', jpegQuality: 98, audioCodec: 'aac', audioBitrate: '320k',
    sampleRate: 48000, enforceAudioTrack: true, concurrency: 8,
    chromiumOptions: {gl: 'angle'}, overwrite: true, colorSpace: 'bt709',
    metadata: {title: 'ФКР — Цена повторения', comment: '1920x1080 · 60 fps · Remotion; original score and frame-locked sound design'},
    onProgress: ({progress}) => {
      const bucket = Math.floor(progress * 20);
      if (bucket !== progressBucket) {progressBucket = bucket; console.log(`Render ${Math.round(progress * 100)}%`);}
    },
  });
  console.log(`Completed: ${output}`);
} finally {await browser.close({silent: true});}
