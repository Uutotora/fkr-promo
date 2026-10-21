import routes from "../data/routes.json";

/** Participants on the film map. Нагорная, 20 к4 is the real building from
    OpenStreetMap (the prototype's training object); the other points are
    illustrative and carry roles, not real addresses. */
export type Place = { id: string; lng: number; lat: number; label: string };

export const PLACES: Record<string, Place> = {
  fund: { id: "fund", lng: 37.627, lat: 55.757, label: "Фонд капремонта" },
  house: { id: "house", lng: 37.60245, lat: 55.67972, label: "ул. Нагорная, 20 к4" },
  tu: { id: "tu", lng: 37.566, lat: 55.689, label: "ТУ ГАУ" },
  uro: { id: "uro", lng: 37.655, lat: 55.736, label: "УРО ГАУ" },
  econ: { id: "econ", lng: 37.612, lat: 55.768, label: "Экономист ФКР" },
  store: { id: "store", lng: 37.8435, lat: 55.6402, label: "Склад поставщика" },
};

export type LngLat = [number, number];
export const ROUTES = routes as unknown as Record<string, LngLat[]> & { places: Record<string, LngLat> };

/** 1 800 illustrative programme objects, scattered over Moscow districts with
    the prototype's own district weights (src/dashboard/programme.ts). */
const DISTRICTS: [number, number, number][] = [
  [55.769, 37.609, 5], [55.733, 37.57, 6], [55.766, 37.664, 5], [55.74, 37.664, 5], [55.803, 37.515, 5],
  [55.806, 37.542, 5], [55.866, 37.555, 7], [55.87, 37.492, 7], [55.845, 37.503, 7], [55.865, 37.674, 8],
  [55.865, 37.603, 9], [55.891, 37.614, 9], [55.897, 37.566, 7], [55.828, 37.589, 5], [55.886, 37.655, 8],
  [55.792, 37.68, 5], [55.796, 37.79, 9], [55.818, 37.806, 8], [55.752, 37.806, 7], [55.749, 37.767, 8],
  [55.759, 37.708, 6], [55.704, 37.781, 8], [55.7, 37.84, 9], [55.65, 37.745, 9], [55.676, 37.762, 8],
  [55.713, 37.635, 6], [55.633, 37.664, 7], [55.583, 37.603, 8], [55.678, 37.645, 6], [55.612, 37.721, 8],
  [55.678, 37.598, 6], [55.683, 37.575, 6], [55.606, 37.536, 8], [55.668, 37.563, 6], [55.635, 37.519, 8],
  [55.623, 37.495, 7], [55.698, 37.497, 7], [55.747, 37.483, 5], [55.735, 37.425, 7], [55.65, 37.396, 7],
  [55.689, 37.455, 6], [55.805, 37.462, 6], [55.847, 37.37, 7], [55.803, 37.404, 7], [55.777, 37.479, 7],
];
const rand = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
export const OBJECTS: { lng: number; lat: number; t: number }[] = (() => {
  const r = rand(20261021);
  const total = DISTRICTS.reduce((s, d) => s + d[2], 0);
  const out: { lng: number; lat: number; t: number }[] = [];
  for (const [lat, lng, w] of DISTRICTS) {
    const n = Math.round((1800 * w) / total);
    for (let i = 0; i < n; i++) {
      // Box–Muller around the district centre, ~1.6 km spread
      const a = Math.sqrt(-2 * Math.log(Math.max(1e-6, r()))) * 0.012;
      const b = 2 * Math.PI * r();
      out.push({ lat: lat + a * Math.cos(b) * 0.6, lng: lng + a * Math.sin(b), t: r() });
    }
  }
  return out.slice(0, 1800);
})();
