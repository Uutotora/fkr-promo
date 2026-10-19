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
    [92.5, 100.2 - 84.5],                         # ИИ: every method (two bento pages), citizens' requests
    [104.45, 7.0],                                # маркет: the supplier's calendar
    [125.0, 145.82 - 138.42],                     # эффект: Деньги / Время / Люди, returns of requests
]
s12 = lambda t5: t5 + sum(d for x, d in INS if t5 > x + 1e-9)

OBJ_AT = s12(49)
OBJ = lambda local: OBJ_AT - 30 + local            # Objects12 local → s12
CYC_AT = OBJ_AT + OBJ12_END - 30
CYC = lambda local: CYC_AT + local
TMC_AT = CYC_AT + CYCLE_END
TMC = lambda local: TMC_AT - 46.2 + local + (1.0 if local > 47.15 else 0)   # Tmc12 keeps the v9 scene hold at 47.15

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
# ИИ (Ai12 clock = v9 local, s12 = local + AI_SHIFT): v9 holds of the chat, then the new pages
AI_SHIFT = s12(75.7) - 65.7
AIL = lambda local: AI_SHIFT + local
H += [[AIL(71.3), 2.6], [AIL(72.7), 1.8], [AIL(76.92), 2.2], [AIL(80.95), 2.6]]
H += [[AIL(84.6), 4.4], [AIL(89.0), 4.6], [AIL(95.0), 3.4], [AIL(97.1), 2.4], [AIL(99.6), 1.0]]
# маркет (Market12 clock = v9 local, s12 = local + MK_SHIFT): results, need, calendar (pick, confirmed), closing line
MK_SHIFT = s12(95) - 94.0
MKL = lambda local: MK_SHIFT + local + (1.5 if local > 95.2 else 0)   # Market12 keeps the v9 scene hold at 95.2
H += [[MKL(99.5), 2.2], [MKL(102.2), 2.4], [MKL(105.8), 1.8], [MKL(109.1), 2.6], [MKL(105.9 + 7.0), 1.8]]
# эффект (Effects12 clock = v9 local, s12 = local + EF_SHIFT): every number once it has counted, the summary
EF_SHIFT = s12(114.5) - 112.0
EFL = lambda local: EF_SHIFT + local
H += [[EFL(114.9), 2.2], [EFL(118.9), 2.2], [EFL(122.7), 2.2], [EFL(126.5), 3.2], [EFL(130.3), 2.0], [EFL(134.2), 2.6], [EFL(138.0), 2.6], [EFL(141.7), 1.6], [EFL(143.6), 3.6]]
# legacy holds from v9 for the signature and the mark
src = open(os.path.join(ROOT, "src/v3/holds.ts")).read()
RAW = [tuple(map(float, m)) for m in re.findall(r"\[([\d.]+),\s*([\d.]+)\]", src.split("const RAW")[1].split("];")[0])]
for at, e in RAW:
    if 108.0 <= at < 114.5 or at >= 140.9:
        H.append([round(s12(at), 3), round(e * 1.8 + 0.5, 2)])

# ---- camera flights: each move of the app-window camera (and every morph) plays slower than the rest
FLY = 0.7
SEG = []
def fly(a, b, r=FLY, pad=0.15):
    SEG.append([round(a - pad, 3), round(b + pad, 3), r])
# «как сейчас»: the morph from one problem to the next
for p in [9.0, 13.8, 18.6, 23.4, 28.2, 33.0, 37.8][1:] + [42.6]:
    fly(p - 0.45, p + 0.4, 0.8)
# dawn → dashboard (logo frame becomes the window), the map zoom in / out
fly(s12(38.75), s12(39.75), 0.75)
fly(s12(43.4), s12(44.3)); fly(s12(47.3), s12(48.5))
# objects: to the search, to the passport, back home
fly(OBJ(31.9), OBJ(32.6)); fly(OBJ(37.1), OBJ(38.1)); fly(OBJ(42.3), OBJ(43.3))
# the cycle: the window becomes the card; the push opens into the request window
fly(CYC(0.0), CYC(0.9), 0.75); fly(CYC(9.24), CYC(10.1), 0.75)
# ТМЦ: arrive, zoom to the quantity, to the reason, the window leaves for the route
fly(TMC(46.2), TMC(46.8), 0.75); fly(TMC(47.3), TMC(47.95)); fly(TMC(49.4), TMC(50.1)); fly(TMC(50.6), TMC(51.3))
# ИИ: the attention camera on the answer and on the document
fly(AIL(71.8), AIL(72.5)); fly(AIL(73.2), AIL(73.8)); fly(AIL(75.0), AIL(75.5)); fly(AIL(90.6), AIL(91.35), 0.75); fly(AIL(98.6), AIL(99.3), 0.75); fly(AIL(100.2), AIL(100.82), 0.75)
# маркет: arrive, the whole shopping path, to the calendar and back, into the signature
fly(MKL(94.15), MKL(94.8), 0.75); fly(MKL(95.4), MKL(102.8), 0.8); fly(MKL(102.8), MKL(104.2))
fly(MKL(103.4 + 7.0 - 0.6), MKL(103.6 + 7.0)); fly(MKL(105.3 + 7.0), MKL(106.15 + 7.0))
# эффект: every number flies into the rail
for l in [115.8, 119.35, 123.15, 127.15, 131.0, 134.75, 138.55, 142.15]:
    fly(EFL(l - 0.6), EFL(l + 0.05), 0.75)
fly(EFL(142.4), EFL(143.3), 0.75); fly(EFL(144.9), EFL(145.82), 0.75)

HOLD_K = 0.8   # global trim of reading holds (the hook keeps its own)
H = [[at, e if at < 8 else round(e * HOLD_K, 2)] for at, e in H]
H.sort()
plan = {
    "fps": 60, "rate": 0.9, "ramp": 0.38, "blend": 0.35,
    "end": round(s12(148.5), 3),
    "inserts": INS,
    "segments": [[0, 8.05, 1.0]] + SEG,
    "holds": H,
}
json.dump(plan, open(os.path.join(ROOT, "src/v12/pace_plan.json"), "w"), indent=1)
print(f"inserts {INS}\nOBJ_AT {OBJ_AT:.2f} CYC_AT {CYC_AT:.2f} TMC_AT {TMC_AT:.2f} end {plan['end']:.2f}; holds {len(H)}")
