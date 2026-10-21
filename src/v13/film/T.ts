// v13 film timeline, in seconds (60 fps). One source of truth for picture and sound.
// Scene names follow ИИ_промо/СЦЕНАРИЙ_v13.md.

export const FPS = 60;
export const f = (s: number) => Math.round(s * FPS);

export const T = {
  // ОТКРЫТИЕ
  p1: [0, 6.6],
  p2: [6.2, 12.8],
  mapOpen: [11.4, 22.4], // roof shot folds into the Нагорная pin, map pulls back to all Moscow
  // АКТ I «Как сейчас»
  logistics: [22, 34.4],
  phone: [34, 40.4], // insert: foreman calls about the delivery
  twice: [40, 47],
  names: [47, 53],
  bti: [53, 58],
  remains: [58, 63],
  docs: [63, 67.4],
  report: [67, 72.4],
  // ПОВОРОТ
  turn: [72, 82.4],
  // АКТ II
  fundDive: [82, 84.6],
  fundInsert: [83.6, 88.6],
  dashboard: [88, 97.4],
  objects: [97, 104.4],
  passport: [104, 112.4],
  cycle: [112, 119],
  toContractor: [118.6, 123.6],
  contractorInsert: [123, 128.4],
  market: [128, 133.4],
  request: [133, 142.4],
  toApprovals: [142, 144.6],
  approverInsert: [144, 147.4],
  approvals: [147, 156.4],
  toSupplier: [156, 158.6],
  supplierInsert: [158, 162.4],
  calendar: [162, 172.4],
  trip: [172, 176.4],
  truck: [176, 180.4],
  ttn: [180, 186.4],
  signInsert: [186, 189.8],
  signed: [189.4, 194.4],
  toAi: [194, 198.4],
  // АКТ III
  chat: [198, 206.4],
  oneName: [206, 212.4],
  check: [212, 216.4],
  resident: [216, 220.4],
  citizen: [220, 227.4],
  methods: [227, 230.4],
  // АКТ IV
  effect: [230, 256.4],
  // ФИНАЛ
  final: [256, 268],
} as const;

export const DURATION = f(268);
export type Scene = keyof typeof T;
export const from = (k: Scene) => f(T[k][0]);
export const dur = (k: Scene) => f(T[k][1]) - f(T[k][0]);
