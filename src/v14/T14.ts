// v14 timeline, film seconds at 60 fps. The whole film rides one music piece
// (ИИ_промо/v14/music/m1.mp3, 100 BPM) that starts at MUSIC: its lift lands on the
// flight out of the window, its break on the ФКР facade, its drop on the window
// the facade camera punches through (DROP).
export const FPS = 60;
export const f = (s: number) => Math.round(s * FPS);
export const MUSIC = 2.14;
export const m = (musicSec: number) => MUSIC + musicSec;
export const DROP = m(43.42);

// Scene starts and ends; neighbours overlap inside each transition (see Film14).
export const S = {
  call: [0, 11.94], // the resident's call (voice from the approved edit)
  t1: [11.94, 16.98], // Seedance: out of her window over the district
  drone: [16.98, 29.01], // the district → the house → the roof (×1.25)
  t2: [29.01, 34.05], // Seedance: off the roof, down the facade, into the stairwell
  foreman: [34.05, 37.55], // ends pushing through the bright doorway behind him
  problems: [37.55, 43.16], // the day map: ×3 trips, ≈20 papers, 7,76 vs 6,1; then the ФКР mark
  facade: [43.16, 48.0], // one shot, speed-ramped through the open window on the drop
  t3: [48.0, 53.04], // Seedance: into the monitor → the real dashboard
  u1: [53.04, 60.51], // Fund UI, recorded live; its notification flies to the contractor
  t4: [60.51, 65.55], // Seedance: into the contractor's tablet
  u2: [65.55, 73.17], // contractor UI, ends on the full screen
  approver: [73.17, 75.49], // out of that screen into the approver's monitor, and back in
  u3: [75.49, 80.74], // approver UI, ends on the click «Согласовать ТУ» (a beat)
  supplier: [80.74, 83.5], // opens from the click
  trip: [83.5, 87.0], // whip up over the warehouse: one trip, on schedule; dive into the house
  truck: [87.0, 90.0],
  sign: [90.0, 93.0], // rack focus from the yard to the tablet
  appeal: [93.0, 100.0], // the signed act lifts off the tablet as the closed appeal
  effect: [100.0, 125.96], // the page pans down onto the city; dusk; the numbers
  coda: [125.96, 134.54], // the map tilts into the evening city; the mark
} as const;

export const DURATION = f(134.54);
export type Scene = keyof typeof S;
export const from = (k: Scene) => f(S[k][0]);
export const dur = (k: Scene) => f(S[k][1]) - f(S[k][0]);
