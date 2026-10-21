// Planar geometry for screen inserts: a homography between two quads and
// its CSS matrix3d form, plus the easing used by every camera move in v13.

export type Pt = [number, number];
export type Quad = [Pt, Pt, Pt, Pt]; // tl, tr, br, bl

/** 3×3 homography (row-major, h8 = 1) mapping src quad onto dst quad. */
export const homography = (src: Quad, dst: Quad): number[] => {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // Gaussian elimination with partial pivoting (8×8).
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const h = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * h[k];
    h[r] = s / A[r][r];
  }
  return [...h, 1];
};

/** CSS matrix3d for an element whose box starts at 0,0 (transform-origin 0 0). */
export const matrix3d = (h: number[]) =>
  `matrix3d(${[h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, h[8]].join(",")})`;

export const rectQuad = (w: number, h: number, x = 0, y = 0): Quad => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

export const lerpQuad = (a: Quad, b: Quad, t: number): Quad =>
  a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]) as Quad;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Strong ease-out, the prototype's --ease-out (cubic-bezier(.23,1,.32,1)) approximated. */
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
/** Symmetric camera ease: gentle start, gentle landing. */
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2;
};
/** Linear ramp of `f` between frames a and b, clamped. */
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

/** A C1 camera path through keys (monotone cubic, Fritsch–Carlson, per channel).
    A move that keeps its direction flows through an intermediate key without
    stopping; holds, reversals and the ends still land with zero speed, and no
    channel ever overshoots its keys. `ts` ascending, `vs[i]` the channels at ts[i]. */
export const smoothPath = (ts: number[], vs: number[][], t: number): number[] => {
  const n = ts.length;
  if (n === 1 || t <= ts[0]) return vs[0].slice();
  if (t >= ts[n - 1]) return vs[n - 1].slice();
  let i = 0;
  while (t > ts[i + 1]) i++;
  const slope = (k: number, c: number) => {
    if (k === 0 || k === n - 1) return 0;
    const h0 = ts[k] - ts[k - 1];
    const h1 = ts[k + 1] - ts[k];
    const d0 = (vs[k][c] - vs[k - 1][c]) / h0;
    const d1 = (vs[k + 1][c] - vs[k][c]) / h1;
    if (d0 * d1 <= 0) return 0;
    const w1 = 2 * h1 + h0;
    const w2 = h1 + 2 * h0;
    return (w1 + w2) / (w1 / d0 + w2 / d1);
  };
  const h = ts[i + 1] - ts[i];
  if (h <= 0) return vs[i + 1].slice();
  const u = (t - ts[i]) / h;
  const u2 = u * u;
  const u3 = u2 * u;
  return vs[i].map((v0, c) => {
    const v1 = vs[i + 1][c];
    const m0 = slope(i, c);
    const m1 = slope(i + 1, c);
    // a move from rest to rest: smootherstep — soft start and landing, top speed
    // only 1.9× the average (the quartic ease peaks at 4× and reads as a whip)
    if (m0 === 0 && m1 === 0) return v0 + (v1 - v0) * u3 * (u * (6 * u - 15) + 10);
    return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * m1;
  });
};
