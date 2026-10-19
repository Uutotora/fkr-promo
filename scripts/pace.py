"""Pace map v12: story clock (s12) → film clock. Smooth, unhurried, readable.

The film is authored on a story clock. Here we decide how fast the story plays, in film time:
  * `rate` — story seconds per film second (default), `segments` — own rate on story ranges
    (camera flights slower, the hook untouched); rate changes are blended over `blend` story-seconds;
  * `holds` [at, seconds] — the story eases to a stop exactly at `at` (decelerating over `ramp`
    film-seconds), stands for `seconds` (creeping 0.02 s so nothing looks frozen), eases back;
  * speed is integrated in film time, so it is continuous and never overshoots: no jolts.
Legacy v9 scenes keep their v5 clock: s5 = s12 with the `inserts` (new material) taken out.

usage: .venv/bin/python scripts/pace.py [s12 …]  → writes src/v12/pace.json, prints a summary
import:  sys.path.insert(0, "scripts"); from pace import load; P = load(); P.film(s12), P.film5(t5)
"""
import json, os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN = os.path.join(ROOT, "src/v12/pace_plan.json")
OUT = os.path.join(ROOT, "src/v12/pace.json")
CREEP = 0.02


def ss(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


class Pace:
    def __init__(self, plan, dt=1 / 1200):
        self.plan = plan
        self.fps = plan["fps"]
        self.end = float(plan["end"])
        self.inserts = sorted(plan.get("inserts", []))
        r0 = float(plan["rate"])
        blend = float(plan.get("blend", 0.6))
        tau = float(plan.get("ramp", 0.5))
        segs = sorted(plan.get("segments", []))
        holds = sorted(plan.get("holds", []))
        self.holds = holds

        def base(s):
            """Rate at story time s, blended across segment edges."""
            v = r0
            for a, b, r in segs:
                k = ss((s - (a - blend / 2)) / blend) * (1 - ss((s - (b - blend / 2)) / blend))
                v = v + (r - v) * k
            return v

        T, s = 0.0, 0.0
        Ts, Ss = [0.0], [0.0]
        hi = 0
        hold_film = []
        while s < self.end - 1e-9:
            # next hold: decelerate so that the story stops exactly at `at`
            if hi < len(holds):
                at, extra = holds[hi]
                # decelerate from the speed we actually have when the ramp starts (no step in speed)
                r = base(at)
                for _ in range(4):
                    start = at - r * tau / 2
                    r = base(start)
                start = at - r * tau / 2
                if s >= start - 1e-9:
                    # decel: v = r (1 - ss(u)), covers r*tau/2 of story → lands on `at`
                    s0, T0 = s, T
                    n = max(2, int(round(tau / dt)))
                    for i in range(1, n + 1):
                        u = i / n
                        # integral of (1 - ss) from 0..u = u - u^3 + u^4/2
                        s = s0 + (at - s0) * (u - u ** 3 + u ** 4 / 2) / 0.5
                        T = T0 + tau * u
                        Ts.append(T); Ss.append(s)
                    s = at
                    hs = T
                    n = max(2, int(round(extra / dt)))
                    for i in range(1, n + 1):
                        u = i / n
                        T = hs + extra * u
                        s = at + CREEP * ss(u)
                        Ts.append(T); Ss.append(s)
                    hold_film.append([hs, extra])
                    r2 = base(s + r * tau / 2)
                    s1, T1 = s, T
                    n = max(2, int(round(tau / dt)))
                    for i in range(1, n + 1):
                        u = i / n
                        # integral of ss from 0..u = u^3 - u^4/2
                        s = s1 + r2 * tau * (u ** 3 - u ** 4 / 2)
                        T = T1 + tau * u
                        Ts.append(T); Ss.append(s)
                    hi += 1
                    continue
                step_end = min(start, self.end)
            else:
                step_end = self.end
            v = base(s)
            ds = v * dt
            if s + ds > step_end:
                T += (step_end - s) / v
                s = step_end
            else:
                s += ds
                T += dt
            Ts.append(T); Ss.append(min(s, self.end))
        self.Ts = np.array(Ts)
        self.Ss = np.maximum.accumulate(np.array(Ss))
        self.duration = float(self.Ts[-1])
        self.hold_film = hold_film

    def film(self, s12):
        return float(np.interp(s12, self.Ss, self.Ts))

    def s12_of5(self, t5):
        return t5 + sum(d for x, d in self.inserts if t5 > x + 1e-9)

    def film5(self, t5):
        return self.film(self.s12_of5(t5))

    def frames(self):
        n = int(np.ceil(self.duration * self.fps))
        return np.interp(np.arange(n) / self.fps, self.Ts, self.Ss)


def load():
    return Pace(json.load(open(PLAN)))


if __name__ == "__main__":
    P = load()
    s = P.frames()
    json.dump({"fps": P.fps, "end": P.end, "duration": round(P.duration, 4), "inserts": P.inserts,
               "holdsFilm": [[round(a, 4), round(e, 4)] for a, e in P.hold_film],
               "s": [round(float(v), 5) for v in s]}, open(OUT, "w"), separators=(",", ":"))
    sp = np.diff(s) * P.fps
    print(f"story {P.end:.2f} s → film {P.duration:.2f} s ({len(s)} frames); holds {len(P.holds)} (+{sum(e for _, e in P.holds):.1f} s)")
    dsp = np.abs(np.diff(sp))
    print(f"story speed: min {sp.min():.3f}, max {sp.max():.3f}; max change per frame {dsp.max():.4f} at film {np.argmax(dsp) / P.fps:.2f} s")
    for t in sys.argv[1:]:
        print(t, "→", round(P.film(float(t)), 3))
