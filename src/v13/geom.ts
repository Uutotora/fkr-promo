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
