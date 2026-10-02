import type { Hold } from "../lib";

/** Reading holds for the final cut, on the v5 film clock: [moment, extra seconds].
    Each sits where everything on screen has settled, so the screen simply stays a little longer. */
const RAW: [number, number][] = [
  // hook: each statement, once its digits have landed
  [1.9, 0.6], [3.9, 0.6], [5.9, 0.6], [7.28, 0.5],
  // «как это работает сейчас»: every screen, once everything on it has arrived
  [13.32, 1.8], [18.12, 1.8], [22.92, 1.8], [27.72, 1.8], [32.52, 1.8],
  // dawn: the line, then the title
  [33.98, 0.8], [37.85, 0.8],
  // dashboard: the cards, then the map
  [40.9, 0.8], [46.45, 1.0],
  // objects: the headline, then the opened card
  [50.75, 0.8], [56.0, 0.8],
  // works & schedule: headline, Gantt, all sections
  [58.2, 0.8], [60.75, 0.8], [63.9, 1.0],
  // ТМЦ: the guard, the route
  [69.25, 1.0], [74.75, 1.0],
  // AI: the answer, the focus, the verdict, the matching, the modules
  [81.3, 1.2], [82.7, 0.8], [86.92, 1.0], [90.95, 1.0], [93.75, 1.2],
  // marketplace: results, need covered, closing line
  [100.5, 0.8], [104.3, 1.0], [106.9, 0.8],
  // signature
  [109.4, 0.6], [113.45, 1.0],
  // economic effect: each infographic after its number has counted, before it flies
  [117.4, 1.0], [121.22, 1.0], [125.05, 1.0], [128.95, 1.0], [132.8, 1.0], [136.55, 1.0], [138.6, 1.5],
  // the mark
  [145.0, 1.5],
];
const ADV = 0.02; // the moment stands still: animations keep their speed, the screen just stays
export const HOLDS: Hold[] = RAW.map(([at, extra]) => ({ at, film: extra + ADV, adv: ADV }));
export const HOLD_EXTRA = RAW.reduce((a, [, e]) => a + e, 0);
