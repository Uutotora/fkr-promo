"""Builds src/v12/pace_plan.json — the pace of the v12 film in one place.

Story clock s12 = v5 + inserted material. Every reading hold is listed here with the moment
(when everything on screen has arrived) and the seconds the screen should stay; the seconds
come from the amount of text on that screen (~0.33 s per word, at least 1.2 s).
Run: .venv/bin/python scripts/plan12.py && .venv/bin/python scripts/pace.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---- inserted material (v5 moment, story seconds) ----
CYCLE_END = 1.5 + 7 * 0.62 + 0.75 + 0.95 + 1.55 + 0.15 + 0.9   # src/v12/Cycle.tsx
OBJ12_END = 43.3                                               # src/v12/Objects12.tsx
PUSH_EXT = 60.4 - 55.0                                         # src/v12/Tmc12.tsx
INS = [
    [20.0, 9.6],                                  # «как сейчас»: 7 problems instead of 5
    [56.5, round((49 + 9.6 + OBJ12_END - 30) - 57 - 9.6, 4)],   # objects: where data comes from
    [60.0, round(CYCLE_END - 8.2, 4)],            # the whole cycle replaces «работы»
    [74.9, PUSH_EXT],                             # ТМЦ: pushes after the route
]
s12 = lambda t5: t5 + sum(d for x, d in INS if t5 > x + 1e-9)

OBJ_AT = s12(49)
OBJ = lambda local: OBJ_AT - 30 + local            # Objects12 local → s12
CYC_AT = OBJ_AT + OBJ12_END - 30
CYC = lambda local: CYC_AT + local
TMC_AT = CYC_AT + CYCLE_END
TMC = lambda local: TMC_AT - 46.2 + local

def read(words, base=1.2, per=0.33):
    return round(max(base, words * per), 2)

H = []
# hook — untouched
H += [[1.9, 0.6], [3.9, 0.6], [5.9, 0.6], [7.28, 0.5]]
# «как сейчас» (Now7, s12): stage + title + two lines ≈ 16–18 words, plus the visual
for p in [9.0, 13.8, 18.6, 23.4, 28.2, 33.0, 37.8]:
    H.append([round(p + 3.95, 3), 3.2])
# dawn: the line, then the title
H += [[s12(33.98), 1.4], [s12(37.85), 1.8]]
# dashboard: cards, map
H += [[s12(40.9), 1.8], [s12(46.45), 2.2]]
# objects: headline, opened card, provenance (sources + history: ~30 words)
H += [[OBJ(31.75), 1.6], [OBJ(37.0), 1.8], [OBJ(40.35), 4.2]]
# the cycle: the push to read before the click
H += [[CYC(7.54 + 0.75), 1.6]]
# ТМЦ: guard, route complete, the three reminders (~36 words)
H += [[TMC(50.25), 2.2], [TMC(54.7), 2.0], [TMC(57.9), 4.0]]
# legacy holds from v9 for AI, marketplace, signature, effects, the mark
src = open(os.path.join(ROOT, "src/v3/holds.ts")).read()
RAW = [tuple(map(float, m)) for m in re.findall(r"\[([\d.]+),\s*([\d.]+)\]", src.split("const RAW")[1].split("];")[0])]
for at, e in RAW:
    if at >= 75.7:
        H.append([round(s12(at), 3), round(e * 1.8 + 0.5, 2)])

H.sort()
plan = {
    "fps": 60, "rate": 0.86, "ramp": 0.45, "blend": 0.8,
    "end": round(s12(148.5), 3),
    "inserts": INS,
    "segments": [[0, 8.05, 1.0]],
    "holds": H,
}
json.dump(plan, open(os.path.join(ROOT, "src/v12/pace_plan.json"), "w"), indent=1)
print(f"inserts {INS}\nOBJ_AT {OBJ_AT:.2f} CYC_AT {CYC_AT:.2f} TMC_AT {TMC_AT:.2f} end {plan['end']:.2f}; holds {len(H)}")
